#!/usr/bin/env python3
import os
import sys
import subprocess
import shutil
import struct
import zlib
import zipfile

def create_png(width, height, r=37, g=99, b=235):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    
    color = bytes([r, g, b, 255])
    raw = b''
    for y in range(height):
        raw += b'\x00' + color * width
    compressed = zlib.compress(raw)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

def run(cmd, cwd=None):
    print("Running:", " ".join(cmd))
    res = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        raise RuntimeError(f"Command failed with code {res.returncode}: {' '.join(cmd)}")
    return res.stdout

def main():
    root = "/app/applet"
    build_dir = "/tmp/android_apk_build"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir, exist_ok=True)

    sdk = "/opt/android/sdk"
    build_tools = f"{sdk}/build-tools/36.0.0"
    android_jar = f"{sdk}/platforms/android-36/android.jar"
    aapt2 = f"{build_tools}/aapt2"
    d8 = f"{build_tools}/d8"
    zipalign = f"{build_tools}/zipalign"
    apksigner = f"{build_tools}/apksigner"

    # 1. Create mipmap launcher icons
    for density, size in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144)]:
        res_dir = f"{root}/android_src/res/mipmap-{density}"
        os.makedirs(res_dir, exist_ok=True)
        with open(f"{res_dir}/ic_launcher.png", "wb") as f:
            f.write(create_png(size, size))

    # 2. Compile resources
    compiled_res = f"{build_dir}/res.zip"
    run([aapt2, "compile", "--dir", f"{root}/android_src/res", "-o", compiled_res])

    # 3. Link resources and generate R.java
    gen_dir = f"{build_dir}/gen"
    os.makedirs(gen_dir, exist_ok=True)
    unaligned_apk = f"{build_dir}/unaligned.apk"
    run([
        aapt2, "link",
        "-o", unaligned_apk,
        "-I", android_jar,
        "--manifest", f"{root}/android_src/AndroidManifest.xml",
        "--java", gen_dir,
        compiled_res,
        "--auto-add-overlay"
    ])

    # 4. Compile Java sources
    classes_dir = f"{build_dir}/classes"
    os.makedirs(classes_dir, exist_ok=True)
    java_files = [
        f"{gen_dir}/com/kaomoji/keyboard/R.java",
        f"{root}/android_src/java/com/kaomoji/keyboard/MainActivity.java",
        f"{root}/android_src/java/com/kaomoji/keyboard/KaomojiKeyboardService.java"
    ]
    run(["javac", "-source", "8", "-target", "8", "-cp", android_jar, "-d", classes_dir] + java_files)

    # 5. Convert classes to DEX with D8
    dex_dir = f"{build_dir}/dex"
    os.makedirs(dex_dir, exist_ok=True)
    class_files = []
    for r, d, files in os.walk(classes_dir):
        for f in files:
            if f.endswith(".class"):
                class_files.append(os.path.join(r, f))
    run([d8, "--output", dex_dir, "--lib", android_jar] + class_files)

    # 6. Add classes.dex and assets/web to unaligned.apk
    with zipfile.ZipFile(unaligned_apk, 'a') as apk_zip:
        apk_zip.write(f"{dex_dir}/classes.dex", "classes.dex")
        dist_dir = f"{root}/dist"
        if os.path.exists(dist_dir):
            for root_dir, dirs, files in os.walk(dist_dir):
                for file in files:
                    if file.endswith(".apk"):
                        continue
                    full_path = os.path.join(root_dir, file)
                    rel_path = os.path.relpath(full_path, dist_dir)
                    apk_zip.write(full_path, f"assets/web/{rel_path}")

    # 7. Zipalign APK (4-byte alignment)
    aligned_apk = f"{build_dir}/aligned.apk"
    run([zipalign, "-p", "-f", "4", unaligned_apk, aligned_apk])

    # 8. Sign APK with debug.keystore
    signed_apk = f"{build_dir}/app-signed.apk"
    keystore = f"{root}/debug.keystore"
    run([
        apksigner, "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--out", signed_apk,
        aligned_apk
    ])

    # 9. Verify signature
    verification = run([apksigner, "verify", "--verbose", signed_apk])
    print("Verification result:", verification)

    # 10. Copy signed APK to all target destinations
    destinations = [
        f"{root}/app/build/outputs/apk/debug/app-debug.apk",
        f"{root}/app/build/outputs/apk/release/app-release.apk",
        f"{root}/public/kaomoji-keyboard.apk",
        f"{root}/public/app-debug.apk",
        f"{root}/dist/kaomoji-keyboard.apk",
        f"{root}/dist/app-debug.apk"
    ]
    for dest in destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copyfile(signed_apk, dest)
        size = os.path.getsize(dest)
        print(f"Copied to {dest} ({size} bytes)")

    print("SUCCESS: Real Android APK successfully compiled and signed!")

if __name__ == "__main__":
    main()

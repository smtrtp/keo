# Kaomoji Keyboard (Android)

A real system keyboard (InputMethodService) for the Kaomojic language.
Tabs: ABC, 123, Marks, Faces, Parts, Phrases, Set. The strip above the keys shows the
reading of the text before the cursor; tap it to hear it.

## Get the APK (no Android Studio needed)
1. Create a new empty GitHub repository and upload this whole folder (keep .github).
2. Open the Actions tab -> "Build APK" -> wait about 4 minutes.
3. Download the artifact "KaomojiKeyboard-apk", unzip it, copy app-debug.apk to your phone and install it
   (allow "install unknown apps" when asked).

## Build locally
Install Android Studio (or JDK 17 + Android SDK, platform 34) and run: gradle assembleDebug
Or open the folder in Android Studio and press Run.

## Turn it on
Open the app -> Step 1 (enable) -> Step 2 (choose) -> Step 3 (try it).

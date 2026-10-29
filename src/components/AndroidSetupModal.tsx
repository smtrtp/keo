import React from 'react';
import { X, Smartphone, CheckCircle2, Download, Terminal, Sparkles, ExternalLink } from 'lucide-react';

interface AndroidSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidSetupModal: React.FC<AndroidSetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg font-mono">
              (◕ω◕)
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Kaomoji Keyboard Android Setup
              </h2>
              <p className="text-xs text-neutral-400">
                Original InputMethodService System App Guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-4 text-xs text-neutral-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <h3 className="font-semibold text-neutral-200 mb-1 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              What is Kaomoji Keyboard?
            </h3>
            <p className="text-neutral-400">
              A real system keyboard for the Kaomojic language where every letter is a kaomoji part.
              Each glyph has a phonetic reading, shown above the keys; tap the reading strip to hear the text read aloud.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h4 className="font-semibold text-neutral-200">Step 1: Turn on Kaomoji Keyboard</h4>
                <p className="text-neutral-400 mt-0.5">
                  On Android, go to <em>Settings &rarr; System &rarr; Languages &amp; input &rarr; Manage on-screen keyboards</em>, and toggle Kaomoji Keyboard ON.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h4 className="font-semibold text-neutral-200">Step 2: Choose Kaomoji Keyboard</h4>
                <p className="text-neutral-400 mt-0.5">
                  Tap any text box, open the input method switcher (keyboard icon at bottom right of navigation bar), and pick Kaomoji Keyboard.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h4 className="font-semibold text-neutral-200">Step 3: Try it here or on web</h4>
                <p className="text-neutral-400 mt-0.5">
                  You can use the full interactive web version right in this window! You get every tab (ABC, 123, Marks, Faces, Parts, Phrases, Set), live speech synthesis, and customizable themes.
                </p>
              </div>
            </div>
          </div>

          {/* GitHub APK build instructions */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2 mb-2 font-semibold text-neutral-200">
              <Terminal className="w-4 h-4 text-purple-400" />
              Build the APK from GitHub Actions
            </div>
            <ol className="list-decimal list-inside space-y-1 text-neutral-400">
              <li>Upload the repository to your GitHub account.</li>
              <li>Navigate to the <strong>Actions</strong> tab &rarr; run <strong>"Build APK"</strong>.</li>
              <li>Download the artifact <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-200">KaomojiKeyboard-apk</code>, unzip, and install <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-200">app-debug.apk</code> on your device.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Got it, take me to Keyboard
          </button>
        </div>
      </div>
    </div>
  );
};

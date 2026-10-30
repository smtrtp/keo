import React, { useState, useEffect, useCallback } from 'react';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { InputSandbox } from './components/InputSandbox';
import { TransliterateTool } from './components/TransliterateTool';
import { KaomojiDictionary } from './components/KaomojiDictionary';
import { KaomojiBuilder } from './components/KaomojiBuilder';
import { AndroidSetupModal } from './components/AndroidSetupModal';
import { KeyboardSettings, DEFAULT_SETTINGS } from './types/keyboard';
import { BY_LETTER, NUM_BY_DIGIT, reading } from './data/kaomojiData';
import { speakText, playKeyClick } from './utils/audio';
import {
  Keyboard,
  ArrowRightLeft,
  BookOpen,
  Sparkles,
  Smartphone,
  Volume2,
  VolumeX,
  Sliders,
  Smile,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function App() {
  // Stored state mimicking Android SharedPreferences "kk"
  const [settings, setSettings] = useState<KeyboardSettings>(() => {
    try {
      const saved = localStorage.getItem('kk_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [currentText, setCurrentText] = useState<string>('(◕ω◕) ');
  const [activeView, setActiveView] = useState<'ime' | 'transliterate' | 'builder' | 'dictionary'>('ime');
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [enablePhysicalIME, setEnablePhysicalIME] = useState<boolean>(true);

  // Sync settings to localStorage
  const updateSettings = (newSettings: Partial<KeyboardSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('kk_settings', JSON.stringify(updated));
      } catch {
        // Fallback
      }
      return updated;
    });
  };

  // Keyboard operations
  const handleCommit = useCallback((str: string) => {
    setCurrentText((prev) => prev + str);
  }, []);

  const handleBackspace = useCallback(() => {
    setCurrentText((prev) => {
      if (!prev) return '';
      // Delete last unicode character / code point properly
      const chars = Array.from(prev);
      chars.pop();
      return chars.join('');
    });
  }, []);

  const handleEnter = useCallback(() => {
    setCurrentText((prev) => prev + '\n');
  }, []);

  // Physical keyboard listener (Hardware IME translation)
  useEffect(() => {
    if (!enablePhysicalIME) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in standard text inputs outside our sandbox
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || (target.tagName === 'TEXTAREA' && target.id !== 'sandbox-area'))
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;

      if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (key === ' ') {
        e.preventDefault();
        handleCommit(' ');
      } else if (key.length === 1) {
        const upper = key.toUpperCase();
        if (BY_LETTER[upper]) {
          e.preventDefault();
          const g = BY_LETTER[upper];
          handleCommit(g.glyph);
          if (settings.keyspeak === 'on') {
            speakText(g.reading, settings.rate);
          }
        } else if (NUM_BY_DIGIT[key]) {
          e.preventDefault();
          const n = NUM_BY_DIGIT[key];
          const out = settings.num === 'plain' ? n.digit : n.glyph;
          handleCommit(out);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enablePhysicalIME, handleBackspace, handleEnter, handleCommit, settings.keyspeak, settings.rate, settings.num]);

  return (
    <div className="min-h-screen bg-[#0E0F12] text-neutral-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-500/20 font-mono">
              ʘωʘ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-neutral-100">
                  Kaomoji Keyboard
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Kaomojic IME
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Phonetic transliterator &amp; glyph keyboard for the Kaomojic language
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => updateSettings({ soundClicks: !settings.soundClicks })}
              className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                settings.soundClicks
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
              title={settings.soundClicks ? 'Mute key clicks' : 'Enable key clicks'}
            >
              {settings.soundClicks ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Direct APK Download */}
            <a
              href="/kaomoji-keyboard.apk"
              download="kaomoji-keyboard.apk"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all shadow-sm"
              title="Download compiled APK file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Download</span>
              <span>APK</span>
            </a>

            {/* Android Setup & APK guide */}
            <button
              type="button"
              onClick={() => setShowAndroidModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Setup</span>
              <span>Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6">
        {/* Navigation View Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-lg gap-1 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveView('ime')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeView === 'ime'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Keyboard &amp; Canvas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('transliterate')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeView === 'transliterate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Cipher Translator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('builder')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeView === 'builder'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Face Creator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dictionary')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeView === 'dictionary'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Syllabary (A-Z)</span>
            </button>
          </div>
        </div>

        {/* View 1: Main Keyboard IME & Input Canvas */}
        {activeView === 'ime' && (
          <div className="flex flex-col gap-6">
            {/* Input Sandbox (Step 3: Try it here) */}
            <InputSandbox
              text={currentText}
              onChange={setCurrentText}
              speechSpeed={settings.rate}
              enablePhysicalKeyboardMapping={enablePhysicalIME}
              onTogglePhysicalKeyboard={() => setEnablePhysicalIME(!enablePhysicalIME)}
            />

            {/* Virtual Keyboard (KaomojiIME implementation) */}
            <VirtualKeyboard
              onCommit={handleCommit}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              currentText={currentText}
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          </div>
        )}

        {/* View 2: Cipher Transliteration Tool */}
        {activeView === 'transliterate' && (
          <div className="flex flex-col gap-6">
            <TransliterateTool
              onInsertToKeyboard={(str) => {
                handleCommit(str);
                setActiveView('ime');
              }}
              speechSpeed={settings.rate}
            />

            {/* Input preview */}
            <InputSandbox
              text={currentText}
              onChange={setCurrentText}
              speechSpeed={settings.rate}
              enablePhysicalKeyboardMapping={enablePhysicalIME}
              onTogglePhysicalKeyboard={() => setEnablePhysicalIME(!enablePhysicalIME)}
            />
          </div>
        )}

        {/* View 3: Modular Kaomoji Builder */}
        {activeView === 'builder' && (
          <div className="flex flex-col gap-6">
            <KaomojiBuilder
              onInsertToKeyboard={(face) => {
                handleCommit(face + ' ');
                setActiveView('ime');
              }}
            />

            {/* Input preview */}
            <InputSandbox
              text={currentText}
              onChange={setCurrentText}
              speechSpeed={settings.rate}
              enablePhysicalKeyboardMapping={enablePhysicalIME}
              onTogglePhysicalKeyboard={() => setEnablePhysicalIME(!enablePhysicalIME)}
            />
          </div>
        )}

        {/* View 4: Kaomoji Dictionary & Syllabary Reference */}
        {activeView === 'dictionary' && (
          <div className="flex flex-col gap-6">
            <KaomojiDictionary
              onInsertGlyph={(glyph) => {
                handleCommit(glyph);
              }}
              speechSpeed={settings.rate}
            />

            {/* Current text preview */}
            <InputSandbox
              text={currentText}
              onChange={setCurrentText}
              speechSpeed={settings.rate}
              enablePhysicalKeyboardMapping={enablePhysicalIME}
              onTogglePhysicalKeyboard={() => setEnablePhysicalIME(!enablePhysicalIME)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 bg-neutral-950/70 py-4 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Rewritten from Android <code className="text-neutral-400">smtrtp/keo</code> to React &amp; TypeScript.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAndroidModal(true)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors underline"
            >
              Android Integration Notes
            </button>
            <span>&bull;</span>
            <span className="font-mono text-neutral-400">(益∀) &ldquo;Fierce, protective love&rdquo;</span>
          </div>
        </div>
      </footer>

      {/* Android Setup Modal */}
      <AndroidSetupModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
}

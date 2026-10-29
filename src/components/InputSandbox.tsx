import React, { useState } from 'react';
import {
  Copy,
  Check,
  Trash2,
  Volume2,
  Sparkles,
  Keyboard,
  Info
} from 'lucide-react';
import { breakdownReading, reading } from '../data/kaomojiData';
import { speakText, playKeyClick } from '../utils/audio';
import { SpeechSpeed } from '../types/keyboard';

interface InputSandboxProps {
  text: string;
  onChange: (newText: string) => void;
  speechSpeed: SpeechSpeed;
  enablePhysicalKeyboardMapping: boolean;
  onTogglePhysicalKeyboard: () => void;
}

export const InputSandbox: React.FC<InputSandboxProps> = ({
  text,
  onChange,
  speechSpeed,
  enablePhysicalKeyboardMapping,
  onTogglePhysicalKeyboard
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSpeakingChar, setActiveSpeakingChar] = useState<string | null>(null);

  const breakdown = breakdownReading(text);
  const syllables = reading(text);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    playKeyClick('special');
    onChange('');
  };

  const speakSingleSyllable = async (syllable: string, char: string) => {
    setActiveSpeakingChar(char);
    await speakText(syllable, speechSpeed);
    setActiveSpeakingChar(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      {/* Sandbox Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-neutral-200">
            Interactive Input Canvas
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono">
            {text.length} chars
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Physical Keyboard Kaomoji auto-map toggle */}
          <button
            type="button"
            onClick={onTogglePhysicalKeyboard}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              enablePhysicalKeyboardMapping
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="When active, typing Latin A-Z on physical keyboard automatically inputs Kaomoji cipher glyphs"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hardware IME:</span>
            <span>{enablePhysicalKeyboardMapping ? 'On' : 'Off'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Copy Kaomoji to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Text Display / Textarea */}
      <div className="relative mt-3">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tap keyboard keys below or type here... (◕ω◕)"
          rows={3}
          className="w-full bg-neutral-950/70 text-neutral-100 placeholder-neutral-500 rounded-xl p-3.5 text-2xl md:text-3xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-neutral-800/80 resize-none leading-relaxed tracking-wider"
        />
      </div>

      {/* Syllable Reading & Pronunciation Chips */}
      {breakdown.length > 0 ? (
        <div className="mt-3.5 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Phonetic Syllabary Analysis
            </span>
            <span className="text-[11px] text-neutral-500">
              Click any chip to audition sound
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {breakdown.map((item, idx) => (
              <button
                key={`${item.char}-${idx}`}
                type="button"
                onClick={() => speakSingleSyllable(item.syllable, item.char + idx)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                  activeSpeakingChar === item.char + idx
                    ? 'bg-blue-500/30 border-blue-400 text-blue-200 scale-105'
                    : item.isSilent
                    ? 'bg-neutral-800/50 border-neutral-700/40 text-neutral-400'
                    : 'bg-neutral-800 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
                }`}
                title={item.desc || item.syllable}
              >
                <span className="text-sm font-bold text-blue-300">{item.char}</span>
                <span className="text-[11px] opacity-90">{item.syllable}</span>
                {item.isSilent && (
                  <span className="text-[9px] px-1 rounded bg-neutral-700 text-neutral-400">
                    silent
                  </span>
                )}
                {!item.isSilent && (
                  <Volume2 className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Type Kaomoji characters to see the live phonetic syllable transcription and listen to their pronunciation.</span>
        </div>
      )}
    </div>
  );
};

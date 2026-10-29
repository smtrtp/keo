import React, { useState } from 'react';
import { ArrowRightLeft, Volume2, Copy, Check, Sparkles } from 'lucide-react';
import { transliterateToKaomoji, reading } from '../data/kaomojiData';
import { speakText } from '../utils/audio';
import { SpeechSpeed } from '../types/keyboard';

interface TransliterateToolProps {
  onInsertToKeyboard: (text: string) => void;
  speechSpeed: SpeechSpeed;
}

export const TransliterateTool: React.FC<TransliterateToolProps> = ({
  onInsertToKeyboard,
  speechSpeed
}) => {
  const [sourceText, setSourceText] = useState('Hello world');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const kaomojiOutput = transliterateToKaomoji(sourceText);
  const kaomojiReading = reading(kaomojiOutput);

  const handleCopy = async () => {
    if (!kaomojiOutput) return;
    try {
      await navigator.clipboard.writeText(kaomojiOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSpeak = async () => {
    if (!kaomojiReading) return;
    setIsSpeaking(true);
    await speakText(kaomojiReading.replace(/-/g, ' '), speechSpeed);
    setIsSpeaking(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-neutral-200">
            Latin to Kaomojic Cipher Converter
          </h3>
        </div>
        <span className="text-xs text-neutral-400 font-mono">
          Instant Transliteration
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {/* Input */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            English / Latin Text
          </label>
          <input
            type="text"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type any word or phrase..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-sans text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-neutral-400">
              Kaomoji Glyph Output
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSpeak}
                disabled={!kaomojiReading}
                className="p-1 rounded text-neutral-400 hover:text-blue-400 disabled:opacity-40 transition-colors"
                title="Speak Syllables"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-blue-400 animate-pulse' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!kaomojiOutput}
                className="p-1 rounded text-neutral-400 hover:text-emerald-400 disabled:opacity-40 transition-colors"
                title="Copy result"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 min-h-[42px] flex items-center justify-between">
            <span className="text-lg font-mono text-blue-300 font-medium">
              {kaomojiOutput || <span className="text-neutral-600 text-sm">Waiting for input...</span>}
            </span>
            {kaomojiOutput && (
              <button
                type="button"
                onClick={() => onInsertToKeyboard(kaomojiOutput)}
                className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors shrink-0 ml-2"
              >
                Send to Keyboard
              </button>
            )}
          </div>
        </div>
      </div>

      {kaomojiReading && (
        <div className="mt-3 text-xs bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-neutral-400">Reading:</span>
          <span className="font-mono text-emerald-400 font-semibold">{kaomojiReading}</span>
        </div>
      )}
    </div>
  );
};

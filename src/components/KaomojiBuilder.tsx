import React, { useState } from 'react';
import { EYES, MOUTHS, ARMS, EXTRAS } from '../data/kaomojiData';
import { Sparkles, Copy, Check, Plus } from 'lucide-react';
import { playKeyClick } from '../utils/audio';

interface KaomojiBuilderProps {
  onInsertToKeyboard: (face: string) => void;
}

export const KaomojiBuilder: React.FC<KaomojiBuilderProps> = ({ onInsertToKeyboard }) => {
  const [leftArm, setLeftArm] = useState('(');
  const [leftEye, setLeftEye] = useState('◕');
  const [mouth, setMouth] = useState('ω');
  const [rightEye, setRightEye] = useState('◕');
  const [rightArm, setRightArm] = useState(')');
  const [extra, setExtra] = useState('');
  const [copied, setCopied] = useState(false);

  const assembledFace = `${leftArm}${leftEye}${mouth}${rightEye}${rightArm}${extra}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assembledFace);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleInsert = () => {
    playKeyClick('accent');
    onInsertToKeyboard(assembledFace);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-neutral-200">
            Modular Kaomoji Creator
          </h3>
        </div>
        <span className="text-xs text-neutral-400 font-mono">
          Mix &amp; Match Parts
        </span>
      </div>

      {/* Preview Box */}
      <div className="my-4 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="text-xs text-neutral-400 mb-1">Constructed Expression</div>
          <div className="text-3xl sm:text-4xl font-mono text-neutral-100 font-bold tracking-wider py-1">
            {assembledFace}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert to Canvas</span>
          </button>
        </div>
      </div>

      {/* Part Pickers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* Left Arm */}
        <div className="bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80">
          <span className="text-neutral-400 font-medium block mb-1.5">Left Arm</span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {ARMS.slice(0, 10).map((arm) => (
              <button
                key={`la-${arm}`}
                type="button"
                onClick={() => setLeftArm(arm)}
                className={`w-7 h-7 rounded text-sm font-mono flex items-center justify-center transition-all ${
                  leftArm === arm ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {arm}
              </button>
            ))}
          </div>
        </div>

        {/* Eyes */}
        <div className="bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80">
          <span className="text-neutral-400 font-medium block mb-1.5">Eyes</span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {EYES.slice(0, 10).map((eye) => (
              <button
                key={`eye-${eye}`}
                type="button"
                onClick={() => {
                  setLeftEye(eye);
                  setRightEye(eye);
                }}
                className={`w-7 h-7 rounded text-sm font-mono flex items-center justify-center transition-all ${
                  leftEye === eye ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {eye}
              </button>
            ))}
          </div>
        </div>

        {/* Mouth */}
        <div className="bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80">
          <span className="text-neutral-400 font-medium block mb-1.5">Mouth</span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {MOUTHS.slice(0, 10).map((m) => (
              <button
                key={`mouth-${m}`}
                type="button"
                onClick={() => setMouth(m)}
                className={`w-7 h-7 rounded text-sm font-mono flex items-center justify-center transition-all ${
                  mouth === m ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Right Arm */}
        <div className="bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80">
          <span className="text-neutral-400 font-medium block mb-1.5">Right Arm</span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {ARMS.slice(1, 11).map((arm) => (
              <button
                key={`ra-${arm}`}
                type="button"
                onClick={() => setRightArm(arm)}
                className={`w-7 h-7 rounded text-sm font-mono flex items-center justify-center transition-all ${
                  rightArm === arm ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {arm}
              </button>
            ))}
          </div>
        </div>

        {/* Extras / Flairs */}
        <div className="col-span-2 sm:col-span-2 bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-neutral-400 font-medium">Extras &amp; Flairs</span>
            {extra && (
              <button
                type="button"
                onClick={() => setExtra('')}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 underline"
              >
                Clear flair
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {EXTRAS.slice(0, 14).map((ex) => (
              <button
                key={`ex-${ex}`}
                type="button"
                onClick={() => setExtra(ex)}
                className={`px-2 h-7 rounded text-sm font-mono flex items-center justify-center transition-all ${
                  extra === ex ? 'bg-pink-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

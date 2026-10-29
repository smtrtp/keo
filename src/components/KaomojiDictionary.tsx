import React, { useState } from 'react';
import { BookOpen, Volume2, Search, Sparkles } from 'lucide-react';
import { CIPHER, NUMBERS, MARKS, Glyph } from '../data/kaomojiData';
import { speakText, playKeyClick } from '../utils/audio';
import { SpeechSpeed } from '../types/keyboard';

interface KaomojiDictionaryProps {
  onInsertGlyph: (glyph: string) => void;
  speechSpeed: SpeechSpeed;
}

export const KaomojiDictionary: React.FC<KaomojiDictionaryProps> = ({
  onInsertGlyph,
  speechSpeed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'cipher' | 'numbers' | 'marks'>('cipher');
  const [playingSyllable, setPlayingSyllable] = useState<string | null>(null);

  const handleSpeak = async (syllable: string) => {
    if (syllable === 'Os') return;
    setPlayingSyllable(syllable);
    await speakText(syllable, speechSpeed);
    setPlayingSyllable(null);
  };

  const filteredCipher = CIPHER.filter(
    (g) =>
      g.letter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.glyph.includes(searchTerm) ||
      g.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-neutral-200">
            Kaomojic Syllabary &amp; Glyph Reference
          </h3>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveCategory('cipher')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'cipher'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Letters (A-Z)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('numbers')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'numbers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Numbers (0-9)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('marks')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'marks'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Punctuation
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {activeCategory === 'cipher' && (
        <div className="relative mt-3 mb-3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by letter, glyph, reading or acoustic description..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Cipher Grid / Table */}
      {activeCategory === 'cipher' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1 mt-3">
          {filteredCipher.map((g) => (
            <div
              key={g.letter}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playKeyClick('tap');
                    onInsertGlyph(g.glyph);
                  }}
                  className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-2xl font-mono text-neutral-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                  title="Click to insert"
                >
                  {g.glyph}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400 font-mono">
                      {g.letter}
                    </span>
                    <span className="text-xs font-bold text-blue-400">
                      {g.reading}
                    </span>
                    {g.reading === 'Os' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">
                        Silent
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-tight mt-0.5 line-clamp-1">
                    {g.desc}
                  </div>
                </div>
              </div>

              {g.reading !== 'Os' && (
                <button
                  type="button"
                  onClick={() => handleSpeak(g.reading)}
                  className={`p-1.5 rounded-lg text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 transition-colors ${
                    playingSyllable === g.reading ? 'text-blue-400 bg-neutral-800' : ''
                  }`}
                  title="Hear pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Numbers Grid */}
      {activeCategory === 'numbers' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1 mt-3">
          {NUMBERS.map((n) => (
            <div
              key={n.digit}
              className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col items-center justify-center text-center gap-1.5 hover:border-neutral-700 transition-all"
            >
              <button
                type="button"
                onClick={() => {
                  playKeyClick('tap');
                  onInsertGlyph(n.glyph);
                }}
                className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-2xl font-mono text-neutral-100 hover:bg-blue-600 hover:text-white transition-all"
              >
                {n.glyph}
              </button>
              <div className="text-xs font-semibold text-neutral-300">
                {n.digit} - {n.name}
              </div>
              <button
                type="button"
                onClick={() => handleSpeak(n.name)}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Hear</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Marks Grid */}
      {activeCategory === 'marks' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[340px] overflow-y-auto pr-1 mt-3">
          {MARKS.map((m) => (
            <div
              key={m.name}
              className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center gap-3 hover:border-neutral-700 transition-all"
            >
              <button
                type="button"
                onClick={() => {
                  playKeyClick('tap');
                  onInsertGlyph(m.mark);
                }}
                className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-xl font-mono text-neutral-100 hover:bg-blue-600 hover:text-white transition-all shrink-0"
              >
                {m.mark}
              </button>
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  {m.name}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {m.mark}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

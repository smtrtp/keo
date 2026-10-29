import React, { useState, useEffect, useRef } from 'react';
import {
  CIPHER,
  BY_LETTER,
  NUMBERS,
  MARKS,
  FACES,
  PART_SETS,
  PHRASES,
  Glyph,
  reading
} from '../data/kaomojiData';
import {
  KeyboardSettings,
  KeyboardTab,
  ThemeMode,
  KeyLook,
  CornerHints,
  NumberMode,
  KeySpeak,
  SpeechSpeed
} from '../types/keyboard';
import { speakText, playKeyClick, triggerHaptic } from '../utils/audio';
import { Volume2, Delete, CornerDownLeft, Sparkles, Sliders, Hash, Smile, Grid, Quote, BookOpen } from 'lucide-react';

interface VirtualKeyboardProps {
  onCommit: (text: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  currentText: string;
  settings: KeyboardSettings;
  onUpdateSettings: (newSettings: Partial<KeyboardSettings>) => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onCommit,
  onBackspace,
  onEnter,
  currentText,
  settings,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<KeyboardTab>('ABC');
  const [selectedPartCategory, setSelectedPartCategory] = useState<string>('Eyes');
  const [hintText, setHintText] = useState<string>('Kaomojic');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute theme colors matching original KaomojiIME.kt pal()
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const colors = isDark
    ? {
        kb: '#17181A',
        key: '#3C4043',
        keyHover: '#4A4E52',
        spec: '#2A2C2F',
        ink: '#E8EAED',
        mute: '#9AA0A6',
        accent: '#8AB4F8',
        on: '#202124',
        line: '#34373B'
      }
    : {
        kb: '#E8EAED',
        key: '#FFFFFF',
        keyHover: '#F1F3F4',
        spec: '#CFD3D8',
        ink: '#202124',
        mute: '#5F6368',
        accent: '#1A73E8',
        on: '#FFFFFF',
        line: '#D5D8DC'
      };

  // Derive syllable reading for the typed text
  const currentReading = reading(currentText);

  // Handle syllable playback
  const handleSpeakReading = async () => {
    if (!currentReading) {
      setHintText('Nothing to read yet');
      return;
    }
    setIsSpeaking(true);
    setHintText(`Reading: ${currentReading}`);
    await speakText(currentReading.replace(/-/g, ' '), settings.rate);
    setIsSpeaking(false);
  };

  const handleKeyPress = (
    label: string,
    action: () => void,
    kind: 'normal' | 'spec' | 'accent' = 'normal',
    speakSyllable?: string,
    hint?: string
  ) => {
    if (settings.soundClicks) {
      playKeyClick(kind === 'accent' ? 'accent' : kind === 'spec' ? 'special' : 'tap');
    }
    triggerHaptic(10);
    action();

    if (hint) {
      setHintText(hint);
    }

    if (settings.keyspeak === 'on' && speakSyllable) {
      speakText(speakSyllable, settings.rate);
    }
  };

  const startRepeating = (action: () => void) => {
    action();
    if (settings.soundClicks) playKeyClick('special');
    triggerHaptic(10);
    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        action();
        triggerHaptic(6);
      }, 65);
    }, 380);
  };

  const stopRepeating = () => {
    if (repeatTimerRef.current) clearTimeout(repeatTimerRef.current);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
  };

  useEffect(() => {
    return () => stopRepeating();
  }, []);

  // Key border-radius & styling according to "look" setting
  const getKeyStyle = (kind: 'normal' | 'spec' | 'accent' = 'normal') => {
    const isOutline = settings.look === 'outline';
    const isFlat = settings.look === 'flat';
    const borderRadius = isFlat ? '4px' : '10px';

    if (kind === 'accent') {
      return {
        backgroundColor: colors.accent,
        color: colors.on,
        borderRadius,
        border: 'none',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
      };
    }

    if (isOutline) {
      return {
        backgroundColor: 'transparent',
        color: colors.ink,
        borderRadius,
        border: `1.5px solid ${colors.line}`,
        boxShadow: 'none'
      };
    }

    const baseBg = kind === 'spec' ? colors.spec : colors.key;
    return {
      backgroundColor: baseBg,
      color: colors.ink,
      borderRadius,
      border: 'none',
      boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.08)'
    };
  };

  // Glyph key generator
  const renderGlyphKey = (char: string) => {
    const g = BY_LETTER[char.toUpperCase()];
    if (!g) return null;
    return (
      <button
        key={g.letter}
        type="button"
        onClick={() => {
          handleKeyPress(
            g.glyph,
            () => onCommit(g.glyph),
            'normal',
            g.reading,
            `${g.letter} → ${g.glyph} ${g.reading}`
          );
        }}
        className="relative flex-1 h-12 flex items-center justify-center transition-all select-none active:scale-95 focus:outline-none"
        style={getKeyStyle('normal')}
        title={`${g.letter}: ${g.glyph} (${g.reading}) - ${g.desc}`}
      >
        {settings.hints === 'on' && (
          <span
            className="absolute top-1 left-1.5 text-[10px] font-mono leading-none pointer-events-none"
            style={{ color: colors.mute }}
          >
            {g.letter}
          </span>
        )}
        <span className="text-xl md:text-2xl font-medium tracking-tight font-sans">
          {g.glyph}
        </span>
      </button>
    );
  };

  // Standard bottom action row
  const renderBottomRow = () => (
    <div className="flex gap-1.5 w-full h-11 mt-1">
      <button
        type="button"
        onClick={() => {
          handleKeyPress('ABC', () => setActiveTab('ABC'), 'spec');
        }}
        className="flex-[1.5] h-full flex items-center justify-center text-xs font-semibold uppercase tracking-wider select-none active:scale-95 transition-transform"
        style={getKeyStyle('spec')}
      >
        ABC
      </button>
      <button
        type="button"
        onMouseDown={() => startRepeating(() => onCommit(' '))}
        onMouseUp={stopRepeating}
        onMouseLeave={stopRepeating}
        onTouchStart={() => startRepeating(() => onCommit(' '))}
        onTouchEnd={stopRepeating}
        className="flex-[5] h-full flex items-center justify-center text-xs font-medium tracking-wider select-none active:scale-98 transition-transform"
        style={getKeyStyle('normal')}
      >
        space
      </button>
      <button
        type="button"
        onMouseDown={() => startRepeating(onBackspace)}
        onMouseUp={stopRepeating}
        onMouseLeave={stopRepeating}
        onTouchStart={() => startRepeating(onBackspace)}
        onTouchEnd={stopRepeating}
        className="flex-[1.5] h-full flex items-center justify-center select-none active:scale-95 transition-transform"
        style={getKeyStyle('spec')}
        title="Backspace"
      >
        <Delete className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleKeyPress('Enter', onEnter, 'accent', undefined, 'Newline')}
        className="flex-[1.5] h-full flex items-center justify-center select-none active:scale-95 transition-transform"
        style={getKeyStyle('accent')}
        title="Enter"
      >
        <CornerDownLeft className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl p-2.5 sm:p-3 shadow-2xl transition-colors select-none border border-neutral-700/30"
      style={{ backgroundColor: colors.kb }}
    >
      {/* Suggestion Strip: Hint on left | Syllable Reading on right (Tap to speak) */}
      <div
        className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl border border-dashed text-xs md:text-sm font-medium"
        style={{
          borderColor: colors.line,
          backgroundColor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.45)'
        }}
      >
        <div
          className="truncate max-w-[40%] flex items-center gap-1.5"
          style={{ color: colors.mute }}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="truncate">{hintText}</span>
        </div>

        <button
          type="button"
          onClick={handleSpeakReading}
          className={`group flex items-center gap-2 px-3 py-1 rounded-lg font-bold transition-all ${
            isSpeaking ? 'ring-2 ring-blue-400 scale-98' : 'hover:opacity-90'
          }`}
          style={{
            color: colors.accent,
            backgroundColor: isDark ? 'rgba(138, 180, 248, 0.12)' : 'rgba(26, 115, 232, 0.1)',
            opacity: currentReading ? 1 : 0.6
          }}
          title="Click to speak phonetic syllables"
        >
          <Volume2 className={`w-4 h-4 shrink-0 ${isSpeaking ? 'animate-pulse text-blue-400' : ''}`} />
          <span className="truncate max-w-[220px]">
            {currentReading || 'Reading'}
          </span>
          <span className="text-[10px] font-normal opacity-60 hidden sm:inline">
            (Tap to speak)
          </span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar scroll-smooth">
        {(['ABC', '123', 'Marks', 'Faces', 'Parts', 'Phrases', 'Set'] as KeyboardTab[]).map(
          (tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (settings.soundClicks) playKeyClick('special');
                  setActiveTab(tab);
                  setHintText(`Switched to ${tab}`);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap active:scale-95 focus:outline-none flex items-center gap-1"
                style={{
                  backgroundColor: isSelected ? colors.accent : 'transparent',
                  color: isSelected ? colors.on : colors.mute,
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {tab === 'ABC' && <span className="font-mono">ʘ</span>}
                {tab === '123' && <span className="font-mono">⚂</span>}
                {tab === 'Faces' && <Smile className="w-3.5 h-3.5" />}
                {tab === 'Parts' && <Grid className="w-3.5 h-3.5" />}
                {tab === 'Phrases' && <Quote className="w-3.5 h-3.5" />}
                {tab === 'Set' && <Sliders className="w-3.5 h-3.5" />}
                <span>{tab}</span>
              </button>
            );
          }
        )}
      </div>

      {/* Keyboard Panels */}
      <div className="min-h-[224px] flex flex-col justify-between">
        {/* ABC Tab */}
        {activeTab === 'ABC' && (
          <div className="flex flex-col gap-1.5 w-full">
            {/* Row 1: QWERTYUIOP */}
            <div className="flex gap-1 w-full">
              {'qwertyuiop'.split('').map((char) => renderGlyphKey(char))}
            </div>

            {/* Row 2: ASDFGHJKL */}
            <div className="flex gap-1 w-full px-2 sm:px-3">
              {'asdfghjkl'.split('').map((char) => renderGlyphKey(char))}
            </div>

            {/* Row 3: 123 + ZXCVBNM + Backspace */}
            <div className="flex gap-1 w-full">
              <button
                type="button"
                onClick={() => {
                  handleKeyPress('123', () => setActiveTab('123'), 'spec');
                }}
                className="flex-[1.5] h-12 flex items-center justify-center text-xs font-semibold tracking-wider select-none active:scale-95 transition-transform"
                style={getKeyStyle('spec')}
              >
                123
              </button>
              {'zxcvbnm'.split('').map((char) => renderGlyphKey(char))}
              <button
                type="button"
                onMouseDown={() => startRepeating(onBackspace)}
                onMouseUp={stopRepeating}
                onMouseLeave={stopRepeating}
                onTouchStart={() => startRepeating(onBackspace)}
                onTouchEnd={stopRepeating}
                className="flex-[1.5] h-12 flex items-center justify-center select-none active:scale-95 transition-transform"
                style={getKeyStyle('spec')}
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>

            {/* Row 4: Marks + Space + Comma(・) + Period(◦) + Enter */}
            <div className="flex gap-1 w-full">
              <button
                type="button"
                onClick={() => {
                  handleKeyPress('Marks', () => setActiveTab('Marks'), 'spec');
                }}
                className="flex-[1.5] h-12 flex items-center justify-center text-xs font-semibold select-none active:scale-95 transition-transform"
                style={getKeyStyle('spec')}
              >
                Marks
              </button>
              <button
                type="button"
                onMouseDown={() => startRepeating(() => onCommit(' '))}
                onMouseUp={stopRepeating}
                onMouseLeave={stopRepeating}
                onTouchStart={() => startRepeating(() => onCommit(' '))}
                onTouchEnd={stopRepeating}
                className="flex-[5] h-12 flex items-center justify-center text-xs font-medium tracking-wider select-none active:scale-98 transition-transform"
                style={getKeyStyle('normal')}
              >
                space
              </button>
              <button
                type="button"
                onClick={() => {
                  handleKeyPress('・', () => onCommit('・'), 'spec', undefined, 'Comma: ・');
                }}
                className="flex-[1] h-12 flex items-center justify-center text-xl select-none active:scale-95 transition-transform font-mono"
                style={getKeyStyle('spec')}
                title="Comma (・)"
              >
                ・
              </button>
              <button
                type="button"
                onClick={() => {
                  handleKeyPress('◦', () => onCommit('◦'), 'spec', undefined, 'Full stop: ◦');
                }}
                className="flex-[1] h-12 flex items-center justify-center text-xl select-none active:scale-95 transition-transform font-mono"
                style={getKeyStyle('spec')}
                title="Full stop (◦)"
              >
                ◦
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('Enter', onEnter, 'accent', undefined, 'Newline')}
                className="flex-[1.5] h-12 flex items-center justify-center select-none active:scale-95 transition-transform"
                style={getKeyStyle('accent')}
                title="Enter"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 123 Tab (Numbers) */}
        {activeTab === '123' && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-1.5 w-full">
              {NUMBERS.slice(0, 5).map((n) => {
                const outputChar = settings.num === 'plain' ? n.digit : n.glyph;
                return (
                  <button
                    key={n.digit}
                    type="button"
                    onClick={() => {
                      handleKeyPress(
                        outputChar,
                        () => onCommit(outputChar),
                        'normal',
                        n.name,
                        `${n.digit} → ${n.glyph} ${n.name}`
                      );
                    }}
                    className="relative flex-1 h-14 flex items-center justify-center select-none active:scale-95 transition-transform"
                    style={getKeyStyle('normal')}
                  >
                    <span
                      className="absolute top-1 left-2 text-[10px] font-mono leading-none"
                      style={{ color: colors.mute }}
                    >
                      {n.digit}
                    </span>
                    <span className="text-2xl font-sans">{n.glyph}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5 w-full">
              {NUMBERS.slice(5).map((n) => {
                const outputChar = settings.num === 'plain' ? n.digit : n.glyph;
                return (
                  <button
                    key={n.digit}
                    type="button"
                    onClick={() => {
                      handleKeyPress(
                        outputChar,
                        () => onCommit(outputChar),
                        'normal',
                        n.name,
                        `${n.digit} → ${n.glyph} ${n.name}`
                      );
                    }}
                    className="relative flex-1 h-14 flex items-center justify-center select-none active:scale-95 transition-transform"
                    style={getKeyStyle('normal')}
                  >
                    <span
                      className="absolute top-1 left-2 text-[10px] font-mono leading-none"
                      style={{ color: colors.mute }}
                    >
                      {n.digit}
                    </span>
                    <span className="text-2xl font-sans">{n.glyph}</span>
                  </button>
                );
              })}
            </div>
            {renderBottomRow()}
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'Marks' && (
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-6 gap-1.5">
              {MARKS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    handleKeyPress(m.mark, () => onCommit(m.mark), 'normal', undefined, m.name);
                  }}
                  className="h-12 flex flex-col items-center justify-center select-none active:scale-95 transition-transform group"
                  style={getKeyStyle('normal')}
                  title={m.name}
                >
                  <span className="text-xl font-mono">{m.mark}</span>
                  <span
                    className="text-[9px] truncate max-w-[90%] leading-tight opacity-70 mt-0.5"
                    style={{ color: colors.mute }}
                  >
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
            {renderBottomRow()}
          </div>
        )}

        {/* Faces Tab */}
        {activeTab === 'Faces' && (
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {FACES.map((face) => (
                <button
                  key={face}
                  type="button"
                  onClick={() => {
                    handleKeyPress(face, () => onCommit(face), 'normal', undefined, face);
                  }}
                  className="h-11 px-2 flex items-center justify-center text-sm sm:text-base font-medium select-none active:scale-95 transition-transform font-mono"
                  style={getKeyStyle('normal')}
                  title={`Insert ${face}`}
                >
                  {face}
                </button>
              ))}
            </div>
            {renderBottomRow()}
          </div>
        )}

        {/* Parts Tab */}
        {activeTab === 'Parts' && (
          <div className="flex flex-col gap-2 w-full">
            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Object.keys(PART_SETS).map((cat) => {
                const on = selectedPartCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      if (settings.soundClicks) playKeyClick('special');
                      setSelectedPartCategory(cat);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: on ? colors.accent : 'transparent',
                      color: on ? colors.on : colors.mute,
                      border: on ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Parts Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {PART_SETS[selectedPartCategory]?.map((glyph, idx) => (
                <button
                  key={`${glyph}-${idx}`}
                  type="button"
                  onClick={() => {
                    handleKeyPress(glyph, () => onCommit(glyph), 'normal', undefined, `${selectedPartCategory}: ${glyph}`);
                  }}
                  className="h-11 flex items-center justify-center text-xl select-none active:scale-95 transition-transform font-mono"
                  style={getKeyStyle('normal')}
                  title={`Insert ${glyph}`}
                >
                  {glyph}
                </button>
              ))}
            </div>
            {renderBottomRow()}
          </div>
        )}

        {/* Phrases Tab */}
        {activeTab === 'Phrases' && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {PHRASES.map((phrase) => (
                <button
                  key={phrase.text}
                  type="button"
                  onClick={() => {
                    handleKeyPress(phrase.text, () => onCommit(phrase.text), 'normal', undefined, phrase.meaning);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl text-left select-none active:scale-98 transition-transform"
                  style={getKeyStyle('normal')}
                >
                  <div className="text-xl font-bold font-mono tracking-wide">{phrase.text}</div>
                  <div
                    className="text-xs mt-0.5 line-clamp-1 italic"
                    style={{ color: colors.mute }}
                  >
                    "{phrase.meaning}"
                  </div>
                </button>
              ))}
            </div>
            {renderBottomRow()}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'Set' && (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
            {/* Setting: Theme */}
            <div className="flex items-center justify-between py-1 border-b border-neutral-700/20">
              <span className="font-semibold" style={{ color: colors.ink }}>
                Theme
              </span>
              <div className="flex gap-1">
                {(['auto', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: mode })}
                    className="px-2.5 py-1 rounded-full capitalize font-medium transition-all"
                    style={{
                      backgroundColor: settings.theme === mode ? colors.accent : 'transparent',
                      color: settings.theme === mode ? colors.on : colors.mute,
                      border: settings.theme === mode ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Key look */}
            <div className="flex items-center justify-between py-1 border-b border-neutral-700/20">
              <span className="font-semibold" style={{ color: colors.ink }}>
                Key look
              </span>
              <div className="flex gap-1">
                {(['round', 'flat', 'outline'] as KeyLook[]).map((look) => (
                  <button
                    key={look}
                    type="button"
                    onClick={() => onUpdateSettings({ look })}
                    className="px-2.5 py-1 rounded-full capitalize font-medium transition-all"
                    style={{
                      backgroundColor: settings.look === look ? colors.accent : 'transparent',
                      color: settings.look === look ? colors.on : colors.mute,
                      border: settings.look === look ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {look}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Corner letters */}
            <div className="flex items-center justify-between py-1 border-b border-neutral-700/20">
              <span className="font-semibold" style={{ color: colors.ink }}>
                Corner letters
              </span>
              <div className="flex gap-1">
                {(['on', 'off'] as CornerHints[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdateSettings({ hints: opt })}
                    className="px-3 py-1 rounded-full capitalize font-medium transition-all"
                    style={{
                      backgroundColor: settings.hints === opt ? colors.accent : 'transparent',
                      color: settings.hints === opt ? colors.on : colors.mute,
                      border: settings.hints === opt ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Numbers */}
            <div className="flex items-center justify-between py-1 border-b border-neutral-700/20">
              <span className="font-semibold" style={{ color: colors.ink }}>
                Numbers
              </span>
              <div className="flex gap-1">
                {(['kaomojic', 'plain'] as NumberMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onUpdateSettings({ num: mode })}
                    className="px-2.5 py-1 rounded-full capitalize font-medium transition-all"
                    style={{
                      backgroundColor: settings.num === mode ? colors.accent : 'transparent',
                      color: settings.num === mode ? colors.on : colors.mute,
                      border: settings.num === mode ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {mode === 'kaomojic' ? 'Kaomojic (⚀)' : '0-9'}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Speak each key */}
            <div className="flex items-center justify-between py-1 border-b border-neutral-700/20">
              <span className="font-semibold" style={{ color: colors.ink }}>
                Speak each key
              </span>
              <div className="flex gap-1">
                {(['off', 'on'] as KeySpeak[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdateSettings({ keyspeak: opt })}
                    className="px-3 py-1 rounded-full capitalize font-medium transition-all"
                    style={{
                      backgroundColor: settings.keyspeak === opt ? colors.accent : 'transparent',
                      color: settings.keyspeak === opt ? colors.on : colors.mute,
                      border: settings.keyspeak === opt ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Speech speed */}
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold" style={{ color: colors.ink }}>
                Speech speed
              </span>
              <div className="flex gap-1">
                {(['slow', 'normal', 'fast'] as SpeechSpeed[]).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onUpdateSettings({ rate: spd })}
                    className="px-2.5 py-1 rounded-full capitalize font-medium transition-all"
                    style={{
                      backgroundColor: settings.rate === spd ? colors.accent : 'transparent',
                      color: settings.rate === spd ? colors.on : colors.mute,
                      border: settings.rate === spd ? 'none' : `1px solid ${colors.line}`
                    }}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

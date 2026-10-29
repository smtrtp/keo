export type ThemeMode = 'auto' | 'light' | 'dark';
export type KeyLook = 'round' | 'flat' | 'outline';
export type CornerHints = 'on' | 'off';
export type NumberMode = 'kaomojic' | 'plain';
export type KeySpeak = 'off' | 'on';
export type SpeechSpeed = 'slow' | 'normal' | 'fast';

export interface KeyboardSettings {
  theme: ThemeMode;
  look: KeyLook;
  hints: CornerHints;
  num: NumberMode;
  keyspeak: KeySpeak;
  rate: SpeechSpeed;
  soundClicks: boolean;
}

export const DEFAULT_SETTINGS: KeyboardSettings = {
  theme: 'dark',
  look: 'round',
  hints: 'on',
  num: 'kaomojic',
  keyspeak: 'off',
  rate: 'normal',
  soundClicks: true
};

export type KeyboardTab = 'ABC' | '123' | 'Marks' | 'Faces' | 'Parts' | 'Phrases' | 'Set';

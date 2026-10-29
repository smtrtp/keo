# Kaomoji Keyboard & Syllabary

A modern, interactive React web application and phonetic transliterator for the **Kaomojic** language, rewritten from the original Android InputMethodService (`smtrtp/keo`).

## Features

- **Full Kaomojic IME Keyboard**:
  - **ABC**: QWERTY layout where each Latin letter maps to its Kaomojic cipher glyph, with optional corner hints.
  - **123**: Kaomojic numerals (⚀, ⚁, ⚂... or plain 0-9) with phonetic names (Ena, Duo, Tre, etc.).
  - **Marks**: Kaomoji punctuation marks (◦, ・, ⁇, ‼, …, 〜, 「, 」, ‥, ※, ⁂, ♪).
  - **Faces**: Direct insertion of popular kaomoji expressions (e.g. `(◕ω◕)`, `(｡♥‿♥｡)`, `¯\_(ツ)_/¯`).
  - **Parts**: Modular parts palette categorised by Eyes, Mouths, Arms, and Extras.
  - **Phrases**: Idiomatic Kaomojic expressions with meanings and one-tap insertion.
  - **Set**: Customizable theme (Dark, Light, Auto), key appearance (Round, Flat, Outline), corner hints, number styling, and speech rate.
- **Phonetic Speech Synthesis**:
  - Live syllable reading strip above the keys with audio speech playback via Web Speech API.
  - Syllable breakdown inspection with individual phonetic audio auditioning.
- **Hardware Keyboard Support**:
  - Live typing with physical keyboard support that transliterates Latin keystrokes into Kaomojic characters.
- **Cipher Transliteration Tool**:
  - Two-way Latin text to Kaomojic cipher conversion.
- **Modular Face Builder**:
  - Mix and match arms, eyes, mouths, and accessories to create custom kaomoji.
- **Syllabary Reference Guide**:
  - Complete dictionary of all 26 cipher letters, acoustic descriptions, numbers, and marks.

## Development

```bash
npm install
npm run dev
```

Built with React 19, TypeScript, Vite, and Tailwind CSS.

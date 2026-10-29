/**
 * Kaomoji Cipher and Dictionary Data
 * Ported from Data.kt in the original Android repository.
 */

export interface Glyph {
  letter: string;
  glyph: string;
  reading: string;
  desc: string;
}

export interface KaomojiNumber {
  digit: string;
  glyph: string;
  name: string;
}

export interface Mark {
  mark: string;
  name: string;
}

export interface Phrase {
  text: string;
  meaning: string;
}

export const CIPHER: Glyph[] = [
  { letter: "A", glyph: "ʘ", reading: "Vok", desc: "Sharp click + high whistle" },
  { letter: "B", glyph: "益", reading: "Grak", desc: "Guttural throat growl" },
  { letter: "C", glyph: "◕", reading: "Mee", desc: "Soft exhaled hum" },
  { letter: "D", glyph: "σ", reading: "Zuu", desc: "Vibrating hum" },
  { letter: "E", glyph: "✧", reading: "Kee", desc: "High crisp pop" },
  { letter: "F", glyph: "இ", reading: "Thal", desc: "Rolling tongue-click" },
  { letter: "G", glyph: "ω", reading: "Ohm", desc: "Purr-like low resonance" },
  { letter: "H", glyph: "∀", reading: "Kha", desc: "Sharp exhaled snap" },
  { letter: "I", glyph: "﹏", reading: "Vra", desc: "Low tremolo rhythm" },
  { letter: "J", glyph: "༚", reading: "Nii", desc: "Soft inhalation" },
  { letter: "K", glyph: "Д", reading: "Rokh", desc: "Heavy impact exhale" },
  { letter: "L", glyph: "づ", reading: "Lyu", desc: "Sliding glissando" },
  { letter: "M", glyph: "(", reading: "Os", desc: "Enclosed silence (left)" },
  { letter: "N", glyph: ")", reading: "Os", desc: "Enclosed silence (right)" },
  { letter: "O", glyph: "♡", reading: "Vra", desc: "Dual heart-thump pulse" },
  { letter: "P", glyph: "⊂", reading: "Kor", desc: "Low resonant echo shield (left)" },
  { letter: "Q", glyph: "⊃", reading: "Kor", desc: "Low resonant echo shield (right)" },
  { letter: "R", glyph: "୧", reading: "Bak", desc: "Heavy snapped inhale" },
  { letter: "S", glyph: "◔", reading: "Sii", desc: "Soft sibilant slide" },
  { letter: "T", glyph: "ಠ", reading: "Thok", desc: "Dry tongue tap" },
  { letter: "U", glyph: "ᴗ", reading: "Uum", desc: "Closed-lip rounded hum" },
  { letter: "V", glyph: "▽", reading: "Vell", desc: "Bright rising lilt" },
  { letter: "W", glyph: "╯", reading: "Wao", desc: "Breathy open wow" },
  { letter: "X", glyph: "╰", reading: "Xir", desc: "Sharp metallic rasp" },
  { letter: "Y", glyph: "✿", reading: "Yen", desc: "Sing-song upward note" },
  { letter: "Z", glyph: "★", reading: "Zol", desc: "Deep buzzing drone" }
];

export const BY_LETTER: Record<string, Glyph> = Object.fromEntries(
  CIPHER.map((g) => [g.letter.toUpperCase(), g])
);

export const BY_GLYPH: Record<string, Glyph> = Object.fromEntries(
  CIPHER.map((g) => [g.glyph, g])
);

export const NUMBERS: KaomojiNumber[] = [
  { digit: "1", glyph: "⚀", name: "Ena" },
  { digit: "2", glyph: "⚁", name: "Duo" },
  { digit: "3", glyph: "⚂", name: "Tre" },
  { digit: "4", glyph: "⚃", name: "Kua" },
  { digit: "5", glyph: "⚄", name: "Pen" },
  { digit: "6", glyph: "⚅", name: "Hex" },
  { digit: "7", glyph: "◐", name: "Sep" },
  { digit: "8", glyph: "◑", name: "Okt" },
  { digit: "9", glyph: "◒", name: "Non" },
  { digit: "0", glyph: "○", name: "Nul" }
];

export const NUM_BY_GLYPH: Record<string, KaomojiNumber> = Object.fromEntries(
  NUMBERS.map((n) => [n.glyph, n])
);

export const NUM_BY_DIGIT: Record<string, KaomojiNumber> = Object.fromEntries(
  NUMBERS.map((n) => [n.digit, n])
);

export const EYES: string[] = [
  "ʘ", "◕", "●", "◔", "◉", "⊙", "✧", "ಠ", "ಥ", "╥", "ᵔ", "˘", "≧", "≦", "⌒", "°", "・", "^", "T", "இ", "σ", "•", "｡", "－"
];

export const MOUTHS: string[] = [
  "ω", "∀", "▽", "‿", "﹏", "Д", "ᴗ", "□", "ε", "益", "ー", "ᗨ", "ᴥ", "෴", "༚", "﹃", "〇", "_"
];

export const ARMS: string[] = [
  "(", ")", "⊂", "⊃", "づ", "ノ", "ﾉ", "ヽ", "╯", "╰", "٩", "۶", "੭", "ଘ", "☞", "ง", "ʕ", "ʔ", "/", "\\", "ᕕ", "ᕗ"
];

export const EXTRAS: string[] = [
  "♡", "♥", "✿", "★", "☆", "*", "~", "♪", "!", "?", "…", "💢", "💧", "✨", ";", "〃", "꒰", "꒱", "₍", "₎", "·", ",", ".", "´", "`", "┻━┻", "︵"
];

export const PART_SETS: Record<string, string[]> = {
  Eyes: EYES,
  Mouths: MOUTHS,
  Arms: ARMS,
  Extras: EXTRAS
};

export const FACES: string[] = [
  "(◕ω◕)", "(｡♥‿♥｡)", "(≧▽≦)", "(ಥ﹏ಥ)", "(づ｡◕‿‿◕｡)づ",
  "(⌒‿⌒)", "ヽ(°〇°)ﾉ", "(；´Д｀)", "(¬‿¬)", "٩(◕‿◕)۶",
  "(ᵔᴥᵔ)", "ʕ•ᴥ•ʔ", "(*^▽^*)", "(－_－) zzz", "(╯°□°)╯︵ ┻━┻",
  "¯\\_(ツ)_/¯", "(ง •̀_•́)ง", "(☞ﾟヮﾟ)☞", "(ʘ益ʘ)", "(✧ω✧)"
];

export const PHRASES: Phrase[] = [
  { text: "(益∀)", meaning: "Fierce, protective love. Unyielding loyalty." },
  { text: "♡(σω)♡", meaning: "She is so cute when she is sleepy." },
  { text: "୧(ʘ﹏)୨", meaning: "Captivated focus. Helplessly in love." }
];

export const MARKS: Mark[] = [
  { mark: "◦", name: "Full stop" },
  { mark: "・", name: "Comma" },
  { mark: "⁇", name: "Question mark" },
  { mark: "‼", name: "Exclamation mark" },
  { mark: "…", name: "Ellipsis" },
  { mark: "〜", name: "Wave" },
  { mark: "「", name: "Open quote" },
  { mark: "」", name: "Close quote" },
  { mark: "‥", name: "Pause" },
  { mark: "※", name: "Note" },
  { mark: "⁂", name: "Break" },
  { mark: "♪", name: "Tune" }
];

/**
 * Reading of a string: syllable names joined with '-', silent (Os) glyphs skipped.
 * Faithful reproduction of Data.kt reading algorithm.
 */
export function reading(text: string): string {
  const out: string[] = [];
  const chars = Array.from(text);

  for (const ch of chars) {
    const glyph = BY_GLYPH[ch];
    if (glyph) {
      if (glyph.reading !== "Os") {
        out.push(glyph.reading);
      }
      continue;
    }
    const num = NUM_BY_GLYPH[ch];
    if (num) {
      out.push(num.name);
    }
  }

  return out.join("-");
}

/**
 * Returns detailed syllable breakdown with glyph and description for UI inspection.
 */
export function breakdownReading(text: string): Array<{ char: string; syllable: string; isSilent: boolean; desc?: string }> {
  const result: Array<{ char: string; syllable: string; isSilent: boolean; desc?: string }> = [];
  const chars = Array.from(text);

  for (const ch of chars) {
    const glyph = BY_GLYPH[ch];
    if (glyph) {
      result.push({
        char: ch,
        syllable: glyph.reading,
        isSilent: glyph.reading === "Os",
        desc: glyph.desc
      });
      continue;
    }
    const num = NUM_BY_GLYPH[ch];
    if (num) {
      result.push({
        char: ch,
        syllable: num.name,
        isSilent: false,
        desc: `Number ${num.digit}`
      });
      continue;
    }
  }
  return result;
}

/**
 * Translates standard Latin text into Kaomojic cipher text.
 */
export function transliterateToKaomoji(input: string, useKaomojiDigits = true): string {
  let result = "";
  for (const char of input) {
    const upper = char.toUpperCase();
    if (BY_LETTER[upper]) {
      result += BY_LETTER[upper].glyph;
    } else if (NUM_BY_DIGIT[char] && useKaomojiDigits) {
      result += NUM_BY_DIGIT[char].glyph;
    } else if (char === ".") {
      result += "◦";
    } else if (char === ",") {
      result += "・";
    } else if (char === "?") {
      result += "⁇";
    } else if (char === "!") {
      result += "‼";
    } else {
      result += char;
    }
  }
  return result;
}

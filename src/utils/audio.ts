/**
 * Audio synthesis engine for Kaomojic syllables and sound effects.
 * Replicates the Android TextToSpeech functionality and phonetic pronunciation.
 */

export type SpeechRate = 'slow' | 'normal' | 'fast';

const RATE_MULTIPLIERS: Record<SpeechRate, number> = {
  slow: 0.7,
  normal: 0.95,
  fast: 1.3
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Speaks text using Web Speech API, matching Android TextToSpeech.
 */
export function speakText(text: string, rate: SpeechRate = 'normal'): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const clean = text.replace(/[-_]/g, ' ').trim();
      if (!clean) {
        resolve(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = RATE_MULTIPLIERS[rate] || 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Plays a subtle tactile mechanical keyboard click or pop sound.
 */
export function playKeyClick(type: 'tap' | 'special' | 'accent' = 'tap') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'accent') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'special') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

/**
 * Triggers subtle haptic feedback if available (similar to Android KEYBOARD_TAP).
 */
export function triggerHaptic(duration = 10) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration error
    }
  }
}

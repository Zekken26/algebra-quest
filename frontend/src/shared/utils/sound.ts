type SoundName = "ui" | "correct" | "wrong" | "complete";

type OscillatorStep = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const soundSteps: Record<SoundName, OscillatorStep[]> = {
  ui: [{ frequency: 520, duration: 0.06, type: "triangle", gain: 0.16 }],
  correct: [
    { frequency: 660, duration: 0.08, type: "sine", gain: 0.28 },
    { frequency: 880, duration: 0.1, type: "sine", gain: 0.28 },
    { frequency: 1175, duration: 0.12, type: "triangle", gain: 0.2 },
  ],
  wrong: [
    { frequency: 220, duration: 0.11, type: "sawtooth", gain: 0.2 },
    { frequency: 165, duration: 0.16, type: "triangle", gain: 0.24 },
  ],
  complete: [
    { frequency: 523, duration: 0.09, type: "triangle", gain: 0.24 },
    { frequency: 659, duration: 0.09, type: "triangle", gain: 0.24 },
    { frequency: 784, duration: 0.11, type: "triangle", gain: 0.24 },
    { frequency: 1047, duration: 0.18, type: "sine", gain: 0.24 },
  ],
};

let audioContext: AudioContext | null = null;
let musicTimer: number | null = null;
let musicGain: GainNode | null = null;
let musicStep = 0;
let musicStarting = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

function playStep(context: AudioContext, step: OscillatorStep, startTime: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const duration = step.duration;
  const peakGain = step.gain ?? 0.12;

  oscillator.type = step.type ?? "sine";
  oscillator.frequency.setValueAtTime(step.frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export function playSound(name: SoundName) {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    void context.resume().then(() => playSound(name));
    return;
  }

  let startTime = context.currentTime;
  for (const step of soundSteps[name]) {
    playStep(context, step, startTime);
    startTime += step.duration * 0.82;
  }
}

function playMusicNote(context: AudioContext, frequency: number, startTime: number) {
  if (!musicGain) {
    musicGain = context.createGain();
    musicGain.gain.setValueAtTime(0.14, context.currentTime);
    musicGain.connect(context.destination);
  }

  const oscillator = context.createOscillator();
  const noteGain = context.createGain();
  const duration = 0.42;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(0.64, startTime + 0.03);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(noteGain);
  noteGain.connect(musicGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

export function startBackgroundMusic() {
  const context = getAudioContext();
  if (!context || musicTimer !== null || musicStarting) return;

  if (context.state === "suspended") {
    musicStarting = true;
    void context.resume().then(() => {
      musicStarting = false;
      startBackgroundMusic();
    });
    return;
  }

  const melody = [196, 247, 294, 330, 294, 247, 220, 247, 196, 247, 294, 392, 330, 294, 247, 220];

  const playNextNote = () => {
    const frequency = melody[musicStep % melody.length];
    playMusicNote(context, frequency, context.currentTime);
    musicStep += 1;
  };

  playNextNote();
  musicTimer = window.setInterval(playNextNote, 520);
}

export function stopBackgroundMusic() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }

  if (musicGain && audioContext) {
    musicGain.gain.cancelScheduledValues(audioContext.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
  }
}

export function isSoundControl(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const control = target.closest("button, a, [role='button'], input, select, textarea");

  return Boolean(
    control &&
    !control.hasAttribute("disabled") &&
    control.getAttribute("aria-disabled") !== "true",
  );
}

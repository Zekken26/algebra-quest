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
let musicGain: GainNode | null = null;
let musicDelay: DelayNode | null = null;
let musicFeedback: GainNode | null = null;
let musicNodes: OscillatorNode[] = [];
let arpeggioTimer: number | null = null;
let arpeggioStep = 0;
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

function createTone(
  context: AudioContext,
  frequency: number,
  detune: number,
  type: OscillatorType,
  gainAmt: number,
  fadeIn: number,
) {
  const osc = context.createOscillator();
  const g = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, context.currentTime);
  osc.detune.setValueAtTime(detune, context.currentTime);
  g.gain.setValueAtTime(0.0001, context.currentTime);
  g.gain.exponentialRampToValueAtTime(gainAmt, context.currentTime + fadeIn);
  osc.connect(g);
  g.connect(musicGain!);
  osc.start();
  musicNodes.push(osc);
  return { osc, gain: g };
}

export function startBackgroundMusic() {
  const context = getAudioContext();
  if (!context || musicGain !== null || musicStarting) return;

  if (context.state === "suspended") {
    musicStarting = true;
    void context.resume().then(() => {
      musicStarting = false;
      startBackgroundMusic();
    });
    return;
  }

  /* ── Master bus ── */
  musicGain = context.createGain();
  musicGain.gain.setValueAtTime(0.35, context.currentTime);

  /* ── Simple delay for spatial depth ── */
  musicDelay = context.createDelay(1);
  musicDelay.delayTime.setValueAtTime(0.18, context.currentTime);

  musicFeedback = context.createGain();
  musicFeedback.gain.setValueAtTime(0.18, context.currentTime);

  musicDelay.connect(musicFeedback);
  musicFeedback.connect(musicDelay);
  musicDelay.connect(context.destination);
  musicGain.connect(musicDelay);
  musicGain.connect(context.destination);

  /* ── Drone: low sine waves (very quiet, creates ambient foundation) ── */
  createTone(context, 55, 0, "sine", 0.02, 2);
  createTone(context, 110, -1.5, "sine", 0.015, 2);
  createTone(context, 110, 1.5, "sine", 0.015, 2);

  /* ── Pad: Am chord (A3 C4 E4) with LFO for slow breathing ── */
  const ctx = context;

  function createPad(freq: number, detune: number, gainAmt: number, lfoRate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.detune.setValueAtTime(detune, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gainAmt, ctx.currentTime + 4);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(lfoRate, ctx.currentTime);
    lfoGain.gain.setValueAtTime(gainAmt * 0.35, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    lfo.start();

    osc.connect(g);
    g.connect(musicGain!);
    osc.start();
    musicNodes.push(osc);
  }

  createPad(220, -2, 0.01, 0.07);
  createPad(262, 1, 0.008, 0.09);
  createPad(330, -1, 0.008, 0.06);

  /* ── Arpeggio: slow pentatonic pattern ── */
  const pentatonic = [220, 262, 294, 330, 392, 440];

  function playArpeggio() {
    if (!musicGain) return;
    const freq = pentatonic[arpeggioStep % pentatonic.length];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const duration = 0.35;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.012, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(g);
    g.connect(musicGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.03);

    arpeggioStep += 1;
  }

  playArpeggio();
  arpeggioTimer = window.setInterval(playArpeggio, 1800);
}

export function stopBackgroundMusic() {
  if (arpeggioTimer !== null) {
    window.clearInterval(arpeggioTimer);
    arpeggioTimer = null;
  }

  const now = audioContext?.currentTime ?? 0;
  for (const node of musicNodes) {
    try {
      node.stop(Math.max(now, 0) + 0.3);
    } catch { /* already stopped */ }
  }
  musicNodes = [];

  if (musicGain) {
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.exponentialRampToValueAtTime(0.0001, Math.max(now, 0) + 0.3);
  }

  musicDelay = null;
  musicFeedback = null;
  musicGain = null;
  arpeggioStep = 0;
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

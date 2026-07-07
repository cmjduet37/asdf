/**
 * Cute Synthesized Audio Effects for Kindergarten Four-Cut App
 * Uses Web Audio API so it works instantly without needing external assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Cute bubbly click sound
export function playPopSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    // Frequency sweeps upwards quickly for a bubbly "pop"
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 2. Countdown Tick Sound (Cute ping)
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(500, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 3. Camera Shutter Sound (White noise + metallic click)
export function playShutterSound() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.15; // 150ms of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make it sound like a mechanical shutter click
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Add a metallic oscillator beep for the primary shutter snap
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1200, ctx.currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    noiseNode.start();
    clickOsc.start();

    noiseNode.stop(ctx.currentTime + 0.15);
    clickOsc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// 4. Success Fanfare (Happy high melody)
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a 4-note cute cheerful scale (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const durations = [0.1, 0.1, 0.1, 0.3];
    const deltas = [0, 0.08, 0.16, 0.24];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + deltas[idx]);

      gain.gain.setValueAtTime(0.12, now + deltas[idx]);
      gain.gain.exponentialRampToValueAtTime(0.005, now + deltas[idx] + durations[idx]);

      osc.start(now + deltas[idx]);
      osc.stop(now + deltas[idx] + durations[idx]);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// Sizzle Rush — audio: tiny synthesized WebAudio blips, no asset files.
let ctx = null;

function ac() {
  if (!ctx) { try { ctx = new AudioContext(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// One enveloped oscillator blip.
function blip(freq, dur, type = 'square', vol = 0.12, slide = 0) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start(); o.stop(c.currentTime + dur);
}

export const sfx = {
  pick:   () => blip(520, 0.07, 'triangle', 0.10),
  put:    () => blip(340, 0.07, 'triangle', 0.10),
  chop:   () => blip(200, 0.10, 'square', 0.14, -80),
  sizzle: () => blip(90, 0.30, 'sawtooth', 0.10, 60),
  serve:  () => { blip(660, 0.10, 'triangle', 0.12); setTimeout(() => blip(880, 0.14, 'triangle', 0.12), 90); },
  combo:  () => { blip(784, 0.09, 'triangle', 0.12); setTimeout(() => blip(988, 0.09, 'triangle', 0.12), 80); setTimeout(() => blip(1175, 0.16, 'triangle', 0.12), 160); },
  miss:   () => blip(160, 0.35, 'sawtooth', 0.12, -100),
  trash:  () => blip(120, 0.12, 'square', 0.10, -40),
  start:  () => { blip(440, 0.09); setTimeout(() => blip(554, 0.09), 90); setTimeout(() => blip(659, 0.09), 180); setTimeout(() => blip(880, 0.18), 270); },
};

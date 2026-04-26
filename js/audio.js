let audioCtx = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playKalimbaPluck(isMilestone = false) {
  if (!audioCtx) return;
  
  // Base 880Hz sine wave tone
  playTone(880, 0.04, 0.1);

  // If milestone, layer a softer, higher chime slightly delayed
  if (isMilestone) {
    setTimeout(() => {
      playTone(1320, 0.08, 0.05); // perfect fifth above
    }, 40);
  }
}

export function playClick() {
  if (!audioCtx) return;
  // A very short, low-volume tick sound
  playTone(600, 0.015, 0.02);
}

function playTone(frequency, duration, volume) {
  if (audioCtx.state === 'suspended') return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  // Quick decay for a pluck sound
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

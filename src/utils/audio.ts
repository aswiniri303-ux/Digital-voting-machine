/**
 * Programmatic audio synthesis using the Web Audio API
 * Mimics real-world hardware feedback loops (piezo beeps, click triggers).
 */

export function playEVMBeep(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const duration = 1.0; // Exact 1-second buzzer sound
    
    // Real industrial buzzers have a sharp square/triangle buzzer tone with a prominent primary frequency
    const primaryOsc = audioCtx.createOscillator();
    const primaryGain = audioCtx.createGain();
    
    primaryOsc.type = "square"; // Authentic industrial buzzer sound
    primaryOsc.frequency.setValueAtTime(1150, audioCtx.currentTime); // High pitch (1150 Hz)
    
    // Quick ramp up, solid sustained volume, and clean drop to prevent speaker popping
    primaryGain.gain.setValueAtTime(0, audioCtx.currentTime);
    primaryGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
    primaryGain.gain.setValueAtTime(0.06, audioCtx.currentTime + duration - 0.03);
    primaryGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    
    primaryOsc.connect(primaryGain);
    primaryGain.connect(audioCtx.destination);
    
    primaryOsc.start(audioCtx.currentTime);
    primaryOsc.stop(audioCtx.currentTime + duration);

    // Add a secondary resonance oscillator to make the beep rich and metallic
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(575, audioCtx.currentTime); // Harmonious sub-octave (575 Hz)
    
    subGain.gain.setValueAtTime(0, audioCtx.currentTime);
    subGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.01);
    subGain.gain.setValueAtTime(0.04, audioCtx.currentTime + duration - 0.03);
    subGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    
    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    
    subOsc.start(audioCtx.currentTime);
    subOsc.stop(audioCtx.currentTime + duration);
    
  } catch (error) {
    console.warn("Web Audio API failed or is not allowed by browser security policies:", error);
  }
}

export function playCategoryBeep(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const duration = 0.15; // Shorter 150ms buzzer sound
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(1150, audioCtx.currentTime); // Same high pitch
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.005);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime + duration - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  } catch (error) {
    console.warn("Web Audio API failed or is not allowed by browser security policies:", error);
  }
}

export function playMechanicalClick(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Ignore silent click errors
  }
}

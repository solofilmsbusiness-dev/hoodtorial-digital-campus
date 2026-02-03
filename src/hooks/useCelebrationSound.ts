import { useCallback, useRef, useState, useEffect } from "react";

const SOUND_MUTED_KEY = "hoodtorial-celebration-sound-muted";
function createSuccessChime(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  
  // Play a rising arpeggio chord
  const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.type = "sine";
    
    const startTime = now + index * 0.08;
    const endTime = startTime + 0.4;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
    
    oscillator.start(startTime);
    oscillator.stop(endTime);
  });
}

// Create a subtle "level up" flourish
function createLevelUpSound(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  
  // Swoosh up effect
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(200, now);
  oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
  oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
  
  oscillator.type = "sine";
  
  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  oscillator.start(now);
  oscillator.stop(now + 0.3);
  
  // Add sparkle overlay
  const sparkle = audioContext.createOscillator();
  const sparkleGain = audioContext.createGain();
  
  sparkle.connect(sparkleGain);
  sparkleGain.connect(audioContext.destination);
  
  sparkle.frequency.setValueAtTime(1500, now + 0.15);
  sparkle.frequency.exponentialRampToValueAtTime(2000, now + 0.35);
  sparkle.type = "sine";
  
  sparkleGain.gain.setValueAtTime(0, now + 0.15);
  sparkleGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
  sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  sparkle.start(now + 0.15);
  sparkle.stop(now + 0.4);
}

// Create a small "tick" for individual score increases
function createTickSound(audioContext: AudioContext, pitch: number = 1) {
  const now = audioContext.currentTime;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(600 * pitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(400 * pitch, now + 0.08);
  
  oscillator.type = "sine";
  
  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

export function useCelebrationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SOUND_MUTED_KEY) === "true";
    }
    return false;
  });

  // Persist mute preference
  useEffect(() => {
    localStorage.setItem(SOUND_MUTED_KEY, String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  const playSuccessChime = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      createSuccessChime(ctx);
    } catch (error) {
      console.debug("Sound playback failed:", error);
    }
  }, [getAudioContext, isMuted]);

  const playLevelUp = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      createLevelUpSound(ctx);
    } catch (error) {
      console.debug("Sound playback failed:", error);
    }
  }, [getAudioContext, isMuted]);

  const playTick = useCallback((pitch: number = 1) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      createTickSound(ctx, pitch);
    } catch (error) {
      console.debug("Sound playback failed:", error);
    }
  }, [getAudioContext, isMuted]);

  return { playSuccessChime, playLevelUp, playTick, isMuted, toggleMute };
}

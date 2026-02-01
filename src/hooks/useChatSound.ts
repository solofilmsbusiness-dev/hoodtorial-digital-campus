import { useCallback, useRef } from "react";

// Create a subtle "pop" sound using Web Audio API
function createPopSound(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
  
  oscillator.type = "sine";
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

export function useChatSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playMessageSound = useCallback(() => {
    try {
      // Create audio context on demand (required for browser autoplay policies)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      
      createPopSound(audioContextRef.current);
    } catch (error) {
      // Silently fail - sound is a nice-to-have
      console.debug("Sound playback failed:", error);
    }
  }, []);

  return { playMessageSound };
}

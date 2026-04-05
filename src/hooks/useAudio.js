/**
 * USE AUDIO - Sound effects and music management
 * 
 * ADDICTION MECHANICS:
 * - Audio feedback enhances satisfaction
 * - Distinct sounds for different actions
 * - Music creates atmosphere
 */

import { useCallback, useRef, useState, useEffect } from 'react';

// Audio context for generating sounds without external files
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Sound definitions using Web Audio API synthesis
const SOUNDS = {
  jump: {
    type: 'sine',
    frequency: 400,
    endFrequency: 600,
    duration: 0.1,
    volume: 0.3
  },
  coin: {
    type: 'sine',
    frequency: 800,
    endFrequency: 1200,
    duration: 0.15,
    volume: 0.25
  },
  powerup: {
    type: 'square',
    frequency: 300,
    endFrequency: 800,
    duration: 0.3,
    volume: 0.2
  },
  combo: {
    type: 'triangle',
    frequency: 500,
    endFrequency: 1000,
    duration: 0.2,
    volume: 0.25
  },
  nearMiss: {
    type: 'sawtooth',
    frequency: 200,
    endFrequency: 400,
    duration: 0.1,
    volume: 0.15
  },
  death: {
    type: 'sawtooth',
    frequency: 400,
    endFrequency: 50,
    duration: 0.5,
    volume: 0.3
  },
  tap: {
    type: 'sine',
    frequency: 600,
    duration: 0.05,
    volume: 0.2
  },
  start: {
    type: 'sine',
    frequency: 440,
    endFrequency: 880,
    duration: 0.3,
    volume: 0.25
  },
  reward: {
    type: 'sine',
    frequency: 523,
    duration: 0.4,
    volume: 0.3,
    sequence: [523, 659, 784, 1047] // C, E, G, High C
  },
  purchase: {
    type: 'triangle',
    frequency: 700,
    endFrequency: 900,
    duration: 0.2,
    volume: 0.25
  },
  error: {
    type: 'square',
    frequency: 200,
    duration: 0.2,
    volume: 0.2
  }
};

export function useAudio() {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const musicRef = useRef(null);

  // Resume audio context on user interaction
  const resumeAudioContext = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }, []);

  useEffect(() => {
    // Resume on first touch/click
    document.addEventListener('touchstart', resumeAudioContext, { once: true });
    document.addEventListener('mousedown', resumeAudioContext, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', resumeAudioContext);
      document.removeEventListener('mousedown', resumeAudioContext);
    };
  }, [resumeAudioContext]);

  // Play synthesized sound
  const playSound = useCallback((soundName) => {
    if (!sfxEnabled) return;
    
    const sound = SOUNDS[soundName];
    if (!sound) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state !== 'running') return;

      // Handle sequence sounds (like reward)
      if (sound.sequence) {
        sound.sequence.forEach((freq, index) => {
          setTimeout(() => playSingleNote(ctx, freq, sound), index * 100);
        });
        return;
      }

      playSingleNote(ctx, sound.frequency, sound);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [sfxEnabled]);

  const playSingleNote = (ctx, frequency, config) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    if (config.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        config.endFrequency,
        ctx.currentTime + config.duration
      );
    }

    gainNode.gain.setValueAtTime(config.volume || 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  };

  // Background music (simple looping tone)
  const startMusic = useCallback(() => {
    if (!musicEnabled) return;
    
    try {
      const ctx = getAudioContext();
      if (musicRef.current) return;

      // Create a simple ambient background
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(55, ctx.currentTime); // Low A

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      musicRef.current = { oscillator, gainNode };
    } catch (error) {
      console.warn('Music playback failed:', error);
    }
  }, [musicEnabled]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      try {
        musicRef.current.oscillator.stop();
        musicRef.current = null;
      } catch (error) {
        console.warn('Error stopping music:', error);
      }
    }
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => {
      const newState = !prev;
      if (!newState) {
        stopMusic();
      }
      return newState;
    });
  }, [stopMusic]);

  const toggleSfx = useCallback(() => {
    setSfxEnabled(prev => !prev);
  }, []);

  // Haptic feedback (if supported)
  const vibrate = useCallback((pattern = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    playSound,
    startMusic,
    stopMusic,
    toggleMusic,
    toggleSfx,
    vibrate,
    musicEnabled,
    sfxEnabled
  };
}

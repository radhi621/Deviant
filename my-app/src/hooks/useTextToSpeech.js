import { useState, useRef, useEffect, useCallback } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    const synth = window.speechSynthesis;
    
    if (!synth) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    synthRef.current = synth;

    // Load voices
    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    
    // Voices may load asynchronously
    synth.onvoiceschanged = loadVoices;

    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance with human-like defaults
    utterance.rate = options.rate || 0.95;        // Slightly slower for natural speech
    utterance.pitch = options.pitch || 1.0;       // Natural pitch
    utterance.volume = options.volume || 0.9;     // Slightly lower volume
    utterance.lang = options.lang || 'en-US';

    // Select voice
    if (availableVoices.length > 0) {
      const voiceIndex = options.voiceIndex !== undefined ? options.voiceIndex : selectedVoiceIndex;
      utterance.voice = availableVoices[Math.min(voiceIndex, availableVoices.length - 1)];
    }

    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [availableVoices, selectedVoiceIndex]);

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const getVoices = useCallback(() => {
    if (!synthRef.current) return [];
    return synthRef.current.getVoices();
  }, []);

  const changeVoice = useCallback((voiceIndex) => {
    if (voiceIndex >= 0 && voiceIndex < availableVoices.length) {
      setSelectedVoiceIndex(voiceIndex);
    }
  }, [availableVoices.length]);

  // Helper function to find voices by gender
  const findVoicesByGender = useCallback((gender) => {
    return availableVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      if (gender === 'female') {
        return name.includes('female') || name.includes('woman') || name.includes('ms.') || name.includes('female');
      } else if (gender === 'male') {
        return name.includes('male') || name.includes('man') || name.includes('mr.') || name.includes('male');
      }
      return false;
    });
  }, [availableVoices]);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    getVoices,
    availableVoices,
    selectedVoiceIndex,
    changeVoice,
    findVoicesByGender,
  };
};

export default useTextToSpeech;

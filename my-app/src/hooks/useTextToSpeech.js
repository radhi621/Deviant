import { useState, useRef, useEffect, useCallback } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [voiceInfo, setVoiceInfo] = useState(null);
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
      
      // Find best default voice (prefer English voices with natural quality)
      if (voices.length > 0) {
        const bestVoice = findBestDefaultVoice(voices);
        if (bestVoice) {
          setSelectedVoiceIndex(bestVoice.index);
          setVoiceInfo({
            name: bestVoice.voice.name,
            lang: bestVoice.voice.lang,
            local: bestVoice.voice.localService,
          });
        }
      }
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
    
    // Configure utterance with optimized defaults for natural speech
    utterance.rate = options.rate !== undefined ? options.rate : 0.95;        // Slightly slower = more natural
    utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;      // Natural pitch
    utterance.volume = options.volume !== undefined ? options.volume : 0.9;   // Comfortable level
    utterance.lang = options.lang || 'en-US';

    // Select voice with validation
    if (availableVoices.length > 0) {
      const voiceIndex = options.voiceIndex !== undefined ? options.voiceIndex : selectedVoiceIndex;
      const validIndex = Math.min(Math.max(voiceIndex, 0), availableVoices.length - 1);
      utterance.voice = availableVoices[validIndex];
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
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    
    // Use setTimeout to ensure proper browser handling
    setTimeout(() => {
      if (synthRef.current) {
        synthRef.current.speak(utterance);
      }
    }, 0);
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

  // Find best default voice based on language and quality
  const findBestDefaultVoice = useCallback((voices) => {
    if (!voices || voices.length === 0) return null;

    // Priority list for best voices
    const preferences = [
      // English US voices (most common and natural)
      (v) => v.lang.startsWith('en-US') && v.name.includes('Google'),
      (v) => v.lang.startsWith('en-US') && v.localService,
      (v) => v.lang.startsWith('en-US'),
      // Other English variants
      (v) => v.lang.startsWith('en-') && v.localService,
      (v) => v.lang.startsWith('en-'),
    ];

    for (const predicate of preferences) {
      const index = voices.findIndex(predicate);
      if (index !== -1) {
        return { index, voice: voices[index] };
      }
    }

    // Fallback to first voice
    return { index: 0, voice: voices[0] };
  }, []);

  // Get voice info for display
  const getVoiceInfo = useCallback(() => {
    if (availableVoices.length > 0 && selectedVoiceIndex >= 0 && selectedVoiceIndex < availableVoices.length) {
      const voice = availableVoices[selectedVoiceIndex];
      return {
        name: voice.name,
        lang: voice.lang,
        local: voice.localService,
        default: voice.default,
      };
    }
    return null;
  }, [availableVoices, selectedVoiceIndex]);

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
    getVoiceInfo,
    voiceInfo,
  };
};

export default useTextToSpeech;

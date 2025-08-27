import { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
}

interface VoiceActivationConfig {
  triggerPhrase: string;
  onActivate: () => void;
  enabled: boolean;
  language: string;
}

interface VoiceActivationState {
  isListening: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  error: string | null;
  confidence: number;
}

export const useVoiceActivation = (config: VoiceActivationConfig) => {
  const [state, setState] = useState<VoiceActivationState>({
    isListening: false,
    permissionStatus: 'prompt',
    error: null,
    confidence: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const shouldAutoRestart = useRef(false);

  // Keep latest config values in refs to avoid re-creating callbacks each render
  const enabledRef = useRef(config.enabled);
  const languageRef = useRef(config.language);
  const triggerPhraseRef = useRef(config.triggerPhrase);
  const onActivateRef = useRef(config.onActivate);

  useEffect(() => { enabledRef.current = config.enabled; }, [config.enabled]);
  useEffect(() => { languageRef.current = config.language; }, [config.language]);
  useEffect(() => { triggerPhraseRef.current = config.triggerPhrase; }, [config.triggerPhrase]);
  useEffect(() => { onActivateRef.current = config.onActivate; }, [config.onActivate]);

  // Initialize speech recognition (stable)
  const initializeRecognition = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser' }));
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current || 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      // Restart only if we didn't intentionally stop
      if (shouldAutoRestart.current && enabledRef.current && state.permissionStatus === 'granted') {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }, 300);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResult) => result[0].transcript.toLowerCase())
        .join(' ');

      // Check for trigger phrase with fuzzy matching
      const triggerPhrase = triggerPhraseRef.current.toLowerCase();
      const words = transcript.split(' ');
      const triggerWords = triggerPhrase.split(' ');

      // Check if trigger words are present in the transcript
      const matchCount = triggerWords.filter(word => 
        words.some(transcriptWord => 
          transcriptWord.includes(word) || word.includes(transcriptWord)
        )
      ).length;

      const confidence = matchCount / triggerWords.length;

      if (confidence >= 0.7) { // 70% confidence threshold
        setState(prev => ({ ...prev, confidence }));
        onActivateRef.current();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error';
      if (event.error === 'not-allowed') {
        setState(prev => ({ ...prev, permissionStatus: 'denied' }));
        errorMessage = 'Microphone permission denied';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Audio capture error';
      } else if (event.error === 'network') {
        errorMessage = 'Network error';
      }

      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
    };

    return recognition;
  }, [isSupported, state.permissionStatus]);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setState(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
    } catch (error) {
      console.error('Permission request failed:', error);
      setState(prev => ({ 
        ...prev, 
        permissionStatus: 'denied', 
        error: 'Microphone permission denied' 
      }));
    }
  }, []);

  // Start listening (stable)
  const startListening = useCallback(() => {
    if (!enabledRef.current || state.permissionStatus !== 'granted') {
      return;
    }

    try {
      const recognition = initializeRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        shouldAutoRestart.current = true;
        recognition.start();
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setState(prev => ({ ...prev, error: 'Failed to start speech recognition' }));
    }
  }, [state.permissionStatus, initializeRecognition]);

  // Stop listening (stable)
  const stopListening = useCallback(() => {
    shouldAutoRestart.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      recognitionRef.current = null;
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setState(prev => ({ ...prev, permissionStatus: permission.state as any }));
        
        permission.onchange = () => {
          setState(prev => ({ ...prev, permissionStatus: permission.state as any }));
        };
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        // Fallback: try to get user media to check permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setState(prev => ({ ...prev, permissionStatus: 'granted' }));
        } catch (mediaError) {
          setState(prev => ({ ...prev, permissionStatus: 'denied' }));
        }
      }
    };

    checkPermission();
  }, []);

  // Handle enabled/disabled changes in a controlled manner
  useEffect(() => {
    if (enabledRef.current && state.permissionStatus === 'granted' && !state.isListening) {
      startListening();
    }
    if ((!enabledRef.current || state.permissionStatus !== 'granted') && state.isListening) {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [state.permissionStatus, state.isListening, startListening, stopListening, config.enabled]);

  return {
    isListening: state.isListening,
    permissionStatus: state.permissionStatus,
    error: state.error,
    confidence: state.confidence,
    isSupported,
    requestPermission,
    startListening,
    stopListening
  };
};
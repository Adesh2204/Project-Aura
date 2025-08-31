import { useState, useEffect, useCallback } from 'react';

type VoiceRecognitionState = 'idle' | 'listening' | 'processing' | 'error';

interface UseVoiceRecognitionProps {
  onActivationPhrase: () => void;
  activationPhrase?: string;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  enabled?: boolean;
}

interface UseVoiceRecognitionReturn {
  state: VoiceRecognitionState;
  error: string | null;
  startListening: () => boolean;
  stopListening: () => void;
  isListening: boolean;
}

export const useVoiceRecognition = ({
  onActivationPhrase,
  activationPhrase = 'help aura',
  lang = 'en-US',
  continuous = true,
  interimResults = false,
  enabled = true,
}: UseVoiceRecognitionProps): UseVoiceRecognitionReturn => {
  const [state, setState] = useState<VoiceRecognitionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!enabled) {
      console.log('Voice recognition is disabled');
      return false;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = continuous;
      recognitionInstance.lang = lang;
      recognitionInstance.interimResults = interimResults;

      recognitionInstance.onstart = () => {
        setState('listening');
        setError(null);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        setState('processing');
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        
        if (transcript.includes(activationPhrase.toLowerCase())) {
          onActivationPhrase();
        }
        
        if (continuous) {
          setState('listening');
        } else {
          setState('idle');
        }
      };

      recognitionInstance.onerror = (event: any) => {
        setState('error');
        setError(`Error occurred in recognition: ${event.error}`);
      };

      recognitionInstance.onend = () => {
        if (state !== 'error') {
          recognitionInstance.start(); // Restart recognition
        }
      };

      recognitionInstance.start();
      setRecognition(recognitionInstance);
      return true;
    } catch (err) {
      setState('error');
      setError(`Failed to start voice recognition: ${err}`);
      return false;
    }
  }, [activationPhrase, continuous, lang, onActivationPhrase, state]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setState('idle');
    }
  }, [recognition]);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  return {
    state,
    error,
    startListening,
    stopListening,
    isListening: state === 'listening',
  };
};

// Add TypeScript declaration for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

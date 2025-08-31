import { useState, useEffect, useCallback, FC } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../contexts/EmergencyContext';

type AuraState = 'idle' | 'listening' | 'processing' | 'error' | 'active' | 'alert' | 'sos_active';
type PermissionState = 'granted' | 'denied' | 'prompt';

interface VoiceActivatedOrbProps {
  auraState?: AuraState;
  isListening?: boolean;
  permissionStatus?: PermissionState;
  onRequestPermission?: () => Promise<void>;
  className?: string;
  onActivationPhrase?: (phrase: string) => void;
  onError?: (error: Error) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const VoiceActivatedOrb: FC<VoiceActivatedOrbProps> = ({
  auraState = 'idle',
  isListening: externalIsListening = false,
  onRequestPermission,
  onActivationPhrase = () => {},
  onError = () => {},
  onListeningChange = () => {},
  className = '',
}) => {
  const navigate = useNavigate();
  const { activateEmergency } = useEmergency();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isListeningState, setIsListeningState] = useState(externalIsListening);
  const [error, setError] = useState<Error | null>(null);

  const handleEmergencyActivation = useCallback(async () => {
    try {
      await activateEmergency('voice');
      navigate('/chat');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to activate emergency');
      setError(error);
      onError(error);
    }
  }, [activateEmergency, navigate, onError]);

  const { startListening, stopListening, isListening: isVoiceListening } = useVoiceRecognition({
    onActivationPhrase: handleEmergencyActivation,
    enabled: permissionGranted,
  });

  // Handle permission changes
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionGranted(permission.state === 'granted');
        
        permission.onchange = () => {
          setPermissionGranted(permission.state === 'granted');
        };
      } catch (err) {
        console.warn('Permission API not supported');
      }
    };
    
    checkPermission();
  }, []);

  // Sync listening state with parent and voice recognition state
  useEffect(() => {
    setIsListeningState(isVoiceListening);
    onListeningChange(isVoiceListening);
  }, [isVoiceListening, onListeningChange]);

  // Handle click to toggle listening
  const handleClick = useCallback(() => {
    if (isListeningState) {
      stopListening?.();
    } else if (permissionGranted) {
      startListening?.();
    } else {
      onRequestPermission?.();
    }
  }, [isListeningState, permissionGranted, startListening, stopListening, onRequestPermission]);

  // Get the appropriate CSS class based on the current state
  const getOrbClass = (): string => {
    switch (auraState) {
      case 'error':
        return 'bg-red-500';
      case 'processing':
      case 'sos_active':
        return 'bg-yellow-500 animate-pulse';
      case 'listening':
        return 'bg-blue-500 animate-pulse';
      case 'active':
      case 'alert':
        return 'bg-red-600';
      case 'idle':
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {isListeningState && (
        <div className="mb-2 text-sm text-gray-400 transition-opacity duration-300">
          Listening for "Help Aura"...
        </div>
      )}
      <button
        className={`w-20 h-20 rounded-full ${getOrbClass()} transition-all duration-300 flex items-center justify-center focus:outline-none ${className}`}
        onClick={handleClick}
        aria-label={isListeningState ? 'Stop listening' : 'Start listening'}
      >
        <div className="w-4/5 h-4/5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-white bg-opacity-50 rounded-full" />
        </div>
      </button>
      <div className="mt-2 text-xs text-center text-gray-400">
        {isListeningState ? 'Listening...' : 'Tap to activate'}
        {error && <div className="text-red-400">Error: {error.message}</div>}
      </div>
    </div>
  );
};

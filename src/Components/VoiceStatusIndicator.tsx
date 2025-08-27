import React from 'react';
import { Mic, MicOff, AlertTriangle, Volume2 } from 'lucide-react';

interface VoiceStatusIndicatorProps {
  isListening: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  error: string | null;
  onRequestPermission: () => void;
}

export const VoiceStatusIndicator: React.FC<VoiceStatusIndicatorProps> = ({
  isListening,
  permissionStatus,
  error,
  onRequestPermission
}) => {
  const getStatusContent = () => {
    if (error) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        text: error,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    switch (permissionStatus) {
      case 'granted':
        return {
          icon: isListening ? (
            <div className="relative">
              <Mic className="w-5 h-5 text-green-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <MicOff className="w-5 h-5 text-gray-400" />
          ),
          text: isListening ? 'Voice activation active - Say "Help Aura" for emergency' : 'Voice activation ready',
          color: isListening ? 'text-green-600' : 'text-gray-600',
          bgColor: isListening ? 'bg-green-50' : 'bg-gray-50',
          borderColor: isListening ? 'border-green-200' : 'border-gray-200'
        };
      
      case 'denied':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          text: 'Microphone permission denied. Voice activation disabled.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      
      case 'prompt':
      default:
        return {
          icon: <Volume2 className="w-5 h-5 text-blue-500" />,
          text: 'Microphone permission required for voice activation',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const status = getStatusContent();

  return (
    <div className={`rounded-lg border p-4 ${status.bgColor} ${status.borderColor}`}>
      <div className="flex items-center space-x-3">
        {status.icon}
        <div className="flex-1">
          <p className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </p>
          {permissionStatus === 'prompt' && (
            <button
              onClick={onRequestPermission}
              className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Grant Permission
            </button>
          )}
          {permissionStatus === 'denied' && (
            <p className="mt-1 text-xs text-gray-500">
              Please enable microphone access in your browser settings
            </p>
          )}
        </div>
      </div>
      
      {isListening && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-green-600 font-medium">Listening...</span>
        </div>
      )}
    </div>
  );
};
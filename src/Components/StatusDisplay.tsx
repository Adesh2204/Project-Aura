import React from 'react';
import { Mic, MicOff, AlertTriangle, Shield } from 'lucide-react';
import { AuraState } from '../types';

interface StatusDisplayProps {
  state: AuraState;
  transcription?: string;
  aiResponse?: string;
  isListening: boolean;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  state,
  transcription,
  aiResponse,
  isListening
}) => {
  if (state === AuraState.IDLE || state === AuraState.SOS_ACTIVE) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
        <div className={`flex items-center justify-center space-x-2 ${
          state === AuraState.SOS_ACTIVE ? 'text-green-600' : 'text-gray-500'
        }`}>
          <Shield className="w-5 h-5" />
          <span>
            {state === AuraState.SOS_ACTIVE 
              ? 'Emergency alert sent successfully' 
              : 'Aura is ready to protect you'
            }
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto space-y-4">
      {/* Microphone Status */}
      <div className="flex items-center justify-center space-x-2">
        {isListening ? (
          <>
            <Mic className="w-5 h-5 text-aura-calm" />
            <span className="text-aura-calm font-medium">Listening...</span>
          </>
        ) : (
          <>
            <MicOff className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Not listening</span>
          </>
        )}
      </div>

      {/* Alert Status */}
      {state === AuraState.ALERT && (
        <div className="flex items-center justify-center space-x-2 text-aura-alert">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Emergency Alert Sent</span>
        </div>
      )}



      {/* Transcription */}
      {transcription && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">You said:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            "{transcription}"
          </p>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Aura responded:</h4>
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            "{aiResponse}"
          </p>
        </div>
      )}
    </div>
  );
};
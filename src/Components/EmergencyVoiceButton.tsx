import React from 'react';
import { Volume2 } from 'lucide-react';

interface EmergencyVoiceButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

export const EmergencyVoiceButton: React.FC<EmergencyVoiceButtonProps> = ({
  onActivate,
  disabled = false
}) => {
  return (
    <button
      onClick={onActivate}
      disabled={disabled}
      className={`
        w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl
        flex items-center justify-center space-x-3 transition-all duration-200
        shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
      }}
    >
      <Volume2 className="w-5 h-5" />
      <span>🔊 Activate AI Assistant Voice</span>
    </button>
  );
};
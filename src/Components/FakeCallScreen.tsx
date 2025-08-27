import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';

interface FakeCallScreenProps {
  callerName: string;
  onEndCall: () => void;
  onCallAnswered: () => void;
}

export const FakeCallScreen: React.FC<FakeCallScreenProps> = ({
  callerName,
  onEndCall,
  onCallAnswered
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-answer the call after 2-3 seconds
  useEffect(() => {
    const autoAnswerTimer = setTimeout(() => {
      setIsAnswered(true);
      onCallAnswered();
    }, 2500);

    return () => clearTimeout(autoAnswerTimer);
  }, [onCallAnswered]);

  // Start call timer when answered
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnswered) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnswered]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onEndCall();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Status Bar */}
      <div className="bg-black text-white text-center py-2 text-sm">
        <div className="flex justify-between items-center px-4">
          <span>9:41 AM</span>
          <span className="font-medium">
            {isAnswered ? 'Call in Progress' : 'Incoming Call'}
          </span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Call Screen Content */}
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white flex flex-col justify-between p-8">
        {/* Caller Info */}
        <div className="text-center mt-16">
          {!isAnswered && (
            <p className="text-lg text-gray-300 mb-4">Incoming call from</p>
          )}
          
          {/* Profile Picture */}
          <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">👨‍💼</span>
          </div>
          
          {/* Caller Name */}
          <h1 className="text-4xl font-light mb-2">{callerName}</h1>
          <p className="text-gray-400">Mobile</p>
          
          {/* Call Duration */}
          {isAnswered && (
            <div className="mt-8">
              <p className="text-2xl font-mono text-green-400">
                {formatDuration(callDuration)}
              </p>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="pb-8">
          {!isAnswered ? (
            /* Incoming Call Controls */
            <div className="flex justify-center space-x-16">
              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={() => {
                  setIsAnswered(true);
                  onCallAnswered();
                }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Phone className="w-8 h-8 text-white" />
              </button>
            </div>
          ) : (
            /* Active Call Controls */
            <div className="grid grid-cols-3 gap-8 max-w-xs mx-auto">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isMuted ? 'bg-red-500' : 'bg-gray-600'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>

              {/* Speaker Button */}
              <button className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Exit Instructions */}
      <div className="absolute top-20 left-4 right-4">
        <div className="bg-black bg-opacity-50 rounded-lg p-3">
          <p className="text-white text-xs text-center">
            Press volume down or shake phone to emergency exit
          </p>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Mic, MapPin, Users, AlertTriangle } from 'lucide-react';

interface PermissionPromptProps {
  onComplete: () => void;
}

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({ onComplete }) => {
  const [permissions, setPermissions] = useState({
    microphone: false,
    location: false
  });
  const [isChecking, setIsChecking] = useState(false);

  const requestPermissions = async () => {
    setIsChecking(true);
    
    const requestMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissions(prev => ({ ...prev, microphone: true }));
      } catch (micError) {
        console.warn('Microphone permission denied:', micError);
      }
    };

    const requestLocation = async () => {
      try {
        await new Promise<void>((resolve) => {
          let resolved = false;
          const done = () => { if (!resolved) { resolved = true; resolve(); } };
          const timer = setTimeout(done, 2000);
          navigator.geolocation.getCurrentPosition(
            () => {
              clearTimeout(timer);
              setPermissions(prev => ({ ...prev, location: true }));
              done();
            },
            () => {
              // Ignore error; proceed without blocking
              done();
            },
            { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
          );
        });
      } catch (locationError) {
        console.warn('Location permission error:', locationError);
      }
    };

    try {
      await Promise.allSettled([requestMic(), requestLocation()]);
    } finally {
      setIsChecking(false);
      onComplete();
    }
  };



  return (
    <div className="min-h-screen bg-aura-background flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-aura-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Aura</h1>
          <p className="text-gray-600">
            Your personal safety companion with voice activation needs a few permissions to protect you effectively.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              permissions.microphone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium">Microphone Access</h3>
              <p className="text-sm text-gray-500">Required for voice activation with "Help Aura" trigger phrase</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              permissions.location ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium">Location Access</h3>
              <p className="text-sm text-gray-500">To share your location in emergency alerts</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium">Emergency Contacts</h3>
              <p className="text-sm text-gray-500">Add contacts to notify during emergencies</p>
            </div>
          </div>
        </div>

        <button
          onClick={requestPermissions}
          disabled={isChecking}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isChecking
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-aura-primary text-white hover:bg-indigo-600'
          }`}
        >
          {isChecking 
            ? 'Checking Permissions...' 
            : 'Continue to Aura'
          }
        </button>

        <p className="text-center text-sm text-gray-500 mt-3">
          You can enable additional permissions later in settings
        </p>
      </div>
    </div>
  );
};
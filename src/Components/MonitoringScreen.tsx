import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Users, Shield, ArrowLeft } from 'lucide-react';

interface MonitoringScreenProps {
  onBack: () => void;
  userLocation: { latitude: number; longitude: number };
}

export const MonitoringScreen: React.FC<MonitoringScreenProps> = ({ onBack, userLocation }) => {
  const [isAICalling, setIsAICalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAICalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAICalling]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAICall = () => {
    setIsAICalling(true);
    setCallDuration(0);
    
    // Simulate AI voice messages
    const messages = [
      "Everything is under control. Don't worry at all.",
      "I'm analyzing the safest route possible for you.",
      "Help is on the way. Stay calm and stay safe.",
      "Your location has been shared with emergency contacts.",
      "Police and emergency services have been notified."
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        // In a real app, this would trigger text-to-speech
        console.log('AI Message:', messages[messageIndex]);
        messageIndex++;
      } else {
        clearInterval(messageInterval);
      }
    }, 3000);

    // Auto-end call after 15 seconds
    setTimeout(() => {
      setIsAICalling(false);
      setCallDuration(0);
      clearInterval(messageInterval);
    }, 15000);
  };

  const endAICall = () => {
    setIsAICalling(false);
    setCallDuration(0);
  };

  return (
    <div className="min-h-screen bg-aura-background">
      {/* Header */}
      <div className="bg-gray-900 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">Aura Monitoring</h1>
              <p className="text-sm text-gray-300">Emergency Response Active</p>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Emergency Alert Status */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Emergency Alert Sent</h2>
            <p className="text-sm text-gray-300">Your location has been shared with emergency contacts</p>
          </div>

          {/* Status Updates */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="text-sm font-medium text-white">Relatives & Friends Notified</h3>
                  <p className="text-xs text-gray-400">8 contacts in New Delhi area</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-medium text-white">Police & Emergency Services</h3>
                  <p className="text-xs text-gray-400">Nearest station: Connaught Place Police Station</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-sm font-medium text-white">Current Coordinates</h3>
                  <p className="text-xs text-gray-400">
                    {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Call Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">AI Comfort Call</h3>
            
            {!isAICalling ? (
              <button
                onClick={handleAICall}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Phone className="w-5 h-5" />
                <span>Start AI Call</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">AI Call Active</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-gray-300">Duration: {formatTime(callDuration)}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300 italic">
                    "Everything is under control. Don't worry at all. I'm analyzing the safest route possible for you."
                  </p>
                </div>

                <button
                  onClick={endAICall}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  End Call
                </button>
              </div>
            )}
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Safety Tips:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Stay in a well-lit, public area</li>
              <li>• Keep your phone charged and accessible</li>
              <li>• Trust your instincts and call 911 if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringScreen;

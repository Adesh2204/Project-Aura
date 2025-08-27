import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, CheckCircle, MapPin, Phone, Users, AlertTriangle } from 'lucide-react';
import { Location } from '../types';

interface AlertConfirmationScreenProps {
  alertResult: any;
  userLocation: Location | null;
  onBack: () => void;
  onAllClear: () => void;
}

interface AlertStatus {
  id: string;
  text: string;
  completed: boolean;
  icon: React.ReactNode;
}

export const AlertConfirmationScreen: React.FC<AlertConfirmationScreenProps> = ({
  alertResult,
  userLocation,
  onBack,
  onAllClear
}) => {
  const [alertStatuses, setAlertStatuses] = useState<AlertStatus[]>([
    {
      id: 'contacts',
      text: 'Notifying emergency contacts...',
      completed: false,
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'location',
      text: 'Sharing your live location...',
      completed: false,
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'authorities',
      text: 'Notifying authorities (Simulated)...',
      completed: false,
      icon: <Shield className="w-5 h-5" />
    }
  ]);

  // Simulate progressive completion of alert actions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Complete contacts notification after 1 second
    timers.push(setTimeout(() => {
      setAlertStatuses(prev => prev.map(status => 
        status.id === 'contacts' 
          ? { ...status, text: 'Emergency contacts notified', completed: true }
          : status
      ));
    }, 1000));

    // Complete location sharing after 2 seconds
    timers.push(setTimeout(() => {
      setAlertStatuses(prev => prev.map(status => 
        status.id === 'location' 
          ? { ...status, text: 'Live location shared', completed: true }
          : status
      ));
    }, 2000));

    // Complete authorities notification after 3 seconds
    timers.push(setTimeout(() => {
      setAlertStatuses(prev => prev.map(status => 
        status.id === 'authorities' 
          ? { ...status, text: 'Authorities notified', completed: true }
          : status
      ));
    }, 3000));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const allCompleted = alertStatuses.every(status => status.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Emergency Alert</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Alert Sent Header */}
          <div className="text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ALERT SENT</h1>
            <p className="text-xl text-blue-100 font-medium">Help is on the way.</p>
          </div>

          {/* Status List */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 space-y-4">
            {alertStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  status.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white bg-opacity-20 text-blue-200 animate-pulse'
                }`}>
                  {status.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    status.icon
                  )}
                </div>
                <span className={`font-medium transition-colors duration-500 ${
                  status.completed ? 'text-green-100' : 'text-blue-100'
                }`}>
                  {status.text}
                </span>
              </div>
            ))}
          </div>

          {/* Location Display */}
          {userLocation && (
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-200" />
                <h3 className="font-semibold text-white">Your Location</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-2">
                  Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm underline"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          )}

          {/* Alert Details */}
          {alertResult && (
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Phone className="w-5 h-5 text-blue-200" />
                <h3 className="font-semibold text-white">Alert Details</h3>
              </div>
              <div className="space-y-2 text-blue-100 text-sm">
                <p>Contacts notified: {alertResult.data?.contactsNotified || 'Processing...'}</p>
                <p>Alert sent: {new Date(alertResult.data?.timestamp || Date.now()).toLocaleTimeString()}</p>
                <p>Status: {alertResult.success ? 'Delivered' : 'Processing'}</p>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-amber-500 bg-opacity-20 border border-amber-400 border-opacity-30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-200 mb-1">Important</h4>
                <p className="text-amber-100 text-sm">
                  This is a simulated emergency response for demonstration. In real emergencies, always call 911 or your local emergency services directly.
                </p>
              </div>
            </div>
          </div>

          {/* I Am Safe Button */}
          <div className="space-y-4">
            {allCompleted && (
              <button
                onClick={onAllClear}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg"
              >
                I Am Safe - Send All Clear
              </button>
            )}
            
            <button
              onClick={onBack}
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-3 px-6 rounded-xl transition-colors backdrop-blur-sm"
            >
              Return to Aura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
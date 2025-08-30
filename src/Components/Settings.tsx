import React, { useState } from 'react';
import { ArrowLeft, User, Shield, HelpCircle, Mic } from 'lucide-react';
import { ContactManager } from './ContactManager';
import { EmergencyContact, UserProfile } from '../types';

interface SettingsProps {
  userProfile: UserProfile;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  userProfile,
  onProfileUpdate,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts' | 'help' | 'voice'>('contacts');
  const [userName, setUserName] = useState(userProfile.name);

  const handleContactsUpdate = (contacts: EmergencyContact[]) => {
    onProfileUpdate({ emergencyContacts: contacts });
  };

  const handleNameUpdate = () => {
    onProfileUpdate({ name: userName.trim() });
  };

  return (
    <div className="min-h-screen bg-aura-background">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'voice' ? 'bg-white text-aura-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mic className="w-4 h-4 mr-1" />
          Voice
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-white text-aura-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-aura-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'help'
                ? 'bg-white text-aura-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Help
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4 pb-8">
        {activeTab === 'voice' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-aura-primary rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Voice Activation</h3>
                <p className="text-sm text-gray-600">Configure voice recognition settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Enable Voice Activation</p>
                  <p className="text-sm text-gray-500">Aura will listen for "Help Aura" to activate emergency mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userProfile.voiceActivationEnabled || false}
                    onChange={(e) => onProfileUpdate({ voiceActivationEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aura-primary"></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="font-medium text-gray-800 mb-2">Voice Recognition Language</p>
                <select
                  value={userProfile.voiceActivationLanguage || 'en-US'}
                  onChange={(e) => onProfileUpdate({ voiceActivationLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aura-primary focus:border-transparent"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ko-KR">Korean</option>
                  <option value="ar-SA">Arabic</option>
                  <option value="hi-IN">Hindi</option>
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">How Voice Activation Works</p>
                    <p className="text-sm text-blue-600 mt-1">
                      When enabled, Aura will continuously listen for the phrase "Help Aura" in the background. 
                      When detected, it will automatically trigger the emergency sequence without requiring 
                      confirmation. For privacy, all voice processing happens directly on your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ContactManager
              contacts={userProfile.emergencyContacts}
              onContactsUpdate={handleContactsUpdate}
              maxContacts={3}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-aura-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
                <p className="text-sm text-gray-600">This information is used in emergency alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aura-primary focus:border-transparent text-gray-900"
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="bg-aura-primary text-white py-2 px-4 rounded-md hover:bg-aura-primary-dark transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Privacy Notice</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Your personal information is stored locally on your device and only shared with your emergency contacts during alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">How to Use Aura</h3>
                <p className="text-sm text-gray-600">Your personal safety guide</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. Activate Aura</h4>
                <p className="text-sm text-gray-600">
                  Tap the central button to activate. Aura will start listening and can simulate a phone call.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. Speak Naturally</h4>
                <p className="text-sm text-gray-600">
                  Describe your situation. Aura will respond as if you're talking to a friend on the phone.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. Emergency Detection</h4>
                <p className="text-sm text-gray-600">
                  If Aura detects distress keywords, it will become assertive and automatically alert your emergency contacts.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">4. Automatic Alerts</h4>
                <p className="text-sm text-gray-600">
                  Emergency contacts receive SMS alerts with your location when threats are detected.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Important</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    Aura is a deterrent tool. In real emergencies, always call 911 or your local emergency services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
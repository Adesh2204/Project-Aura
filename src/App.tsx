import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
// Removed AuraButton import
// Removed unused component imports
import { FakeCallScreen } from './Components/FakeCallScreen';
import { Settings as SettingsComponent } from './Components/Settings';
import { PermissionPrompt } from './Components/PermissionPrompt';
import { AlertConfirmationScreen } from './Components/AlertConfirmationScreen';
import { useAuraState } from './hooks/useAuraState';
import { useAudioCapture } from './hooks/useAudioCapture';
import { useLocation } from './hooks/useLocation';
import { useVoiceActivation } from './hooks/useVoiceActivation';
import { apiService } from './services/apiService';
import { storageService } from './services/storageService';
import { UserProfile, AuraState } from './types';
import { AnimatedOrb } from './Components/AnimatedOrb';
import { CityMap } from './Components/CityMap';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'settings' | 'permissions' | 'sos-confirmation' | 'fake-call'>('permissions');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const profile = storageService.getUserProfile();
    return {
      ...profile,
      voiceActivationEnabled: profile.voiceActivationEnabled ?? false,
      voiceActivationLanguage: profile.voiceActivationLanguage ?? 'en-US'
    };
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [sosProcessing, setSOSProcessing] = useState(false);
  const [emergencyVoiceActive, setEmergencyVoiceActive] = useState(false);

  const aura = useAuraState();
  const audio = useAudioCapture();
  const location = useLocation();
  
  // Define handleSOSActivate function
  const handleSOSActivate = async () => {
    setSOSProcessing(true);
    
    try {
      // Trigger SOS state immediately for UI feedback
      aura.triggerSOS();
      
      // Get current location
      const currentLocation = await location.getCurrentLocation();
      
      // Send SOS alert
      const result = await apiService.triggerSOSAlert(userProfile.id, currentLocation);
      
      // Update SOS result
      aura.updateSOSResult(result);
      
      // Navigate to confirmation screen
      setCurrentView('sos-confirmation');
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      // Still show confirmation screen with error state
      aura.updateSOSResult({
        success: false,
        message: 'Error sending alert, but emergency contacts may have been notified',
        data: { contactsNotified: 0, timestamp: new Date().toISOString() }
      });
      setCurrentView('sos-confirmation');
    } finally {
      setSOSProcessing(false);
    }
  };
  
  // Initialize voice activation
  const voice = useVoiceActivation({
    triggerPhrase: 'Help Aura',
    onActivate: handleSOSActivate,
    enabled: userProfile.voiceActivationEnabled ?? false,
    language: userProfile.voiceActivationLanguage ?? 'en-US'
  });

  // Check if onboarding is complete and handle voice activation changes
  useEffect(() => {
    if (storageService.isOnboardingComplete()) {
      setCurrentView('home');
    }
    
    // Request microphone permission if voice activation is enabled
    if (userProfile.voiceActivationEnabled && voice.permissionStatus === 'prompt') {
      voice.requestPermission();
    }
  }, [userProfile.voiceActivationEnabled]);

  // Handle audio processing workflow
  useEffect(() => {
    const processAudio = async () => {
      if (audio.audioBlob && aura.isListening) {
        setIsProcessing(true);
        
        try {
          // Process audio through the complete workflow
          const result = await apiService.processAudioWorkflow(audio.audioBlob);
          
          // Update transcription and AI response
          aura.updateTranscription(result.transcription);
          aura.updateAiResponse(result.ai_response);
          
          // Play the AI response
          await apiService.playAudioResponse(result.ai_response);
          
          // Handle threat detection
          if (result.threat_detected) {
            aura.triggerAlert();
            
            // Get location and send alert
            try {
              const currentLocation = await location.getCurrentLocation();
              await apiService.triggerSmsAlert(userProfile.id, currentLocation);
            } catch (locationError) {
              console.error('Error getting location for alert:', locationError);
              // Still send alert without precise location
              await apiService.triggerSmsAlert(userProfile.id, { latitude: 0, longitude: 0 });
            }
          }
          
          // Clear the processed audio
          audio.clearAudio();
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    processAudio();
  }, [audio.audioBlob, aura.isListening]);



  // const handleEmergencyVoiceActivate = async () => {
  //   try {
  //     // Trigger emergency voice state
  //     aura.triggerEmergencyVoice();
  //     setEmergencyVoiceActive(true);
  //     
  //     // Navigate to fake call screen
  //     setCurrentView('fake-call');
  //     
  //     // Send silent location alert to emergency contacts
  //     const currentLocation = await location.getCurrentLocation();
  //     await apiService.triggerSmsAlert(userProfile.id, currentLocation);
  //   } catch (error) {
  //     console.error('Error activating emergency voice:', error);
  //   }
  // };

  const handleCallAnswered = async () => {
    try {
      // Start playing emergency warnings
      await apiService.playEmergencyWarnings();
    } catch (error) {
      console.error('Error playing emergency warnings:', error);
    }
  };

  const handleEndCall = () => {
    // Stop any ongoing warnings
    apiService.stopEmergencyWarnings();
    
    // Reset state and return to home
    aura.resetToIdle();
    setEmergencyVoiceActive(false);
    setCurrentView('home');
  };

  const handleAllClear = async () => {
    try {
      // Send all-clear message to contacts
      const currentLocation = await location.getCurrentLocation();
      await apiService.triggerSmsAlert(userProfile.id, currentLocation);
      
      // Reset to home
      aura.resetToIdle();
      setCurrentView('home');
    } catch (error) {
      console.error('Error sending all-clear:', error);
      // Still return to home
      aura.resetToIdle();
      setCurrentView('home');
    }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);
    storageService.saveUserProfile(updatedProfile);
    
    // Update emergency contacts separately
    if (updates.emergencyContacts) {
      storageService.saveEmergencyContacts(updates.emergencyContacts);
    }
  };

  const handlePermissionsComplete = () => {
    if (storageService.isOnboardingComplete()) {
      setCurrentView('home');
    } else {
      setCurrentView('settings');
    }
  };

  // Render permission prompt
  if (currentView === 'permissions') {
    return <PermissionPrompt onComplete={handlePermissionsComplete} />;
  }

  // Render settings
  if (currentView === 'settings') {
    return (
      <SettingsComponent
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  // Render SOS confirmation screen
  if (currentView === 'sos-confirmation') {
    return (
      <AlertConfirmationScreen
        alertResult={aura.sosAlertResult}
        userLocation={location.location}
        onBack={() => setCurrentView('home')}
        onAllClear={handleAllClear}
      />
    );
  }

  // Render fake call screen
  if (currentView === 'fake-call') {
    return (
      <FakeCallScreen
        callerName="Dad"
        onEndCall={handleEndCall}
        onCallAnswered={handleCallAnswered}
      />
    );
  }

  // Render main home screen
  return (
    <div className="min-h-screen bg-aura-background">
      {/* Header */}
      <div className="bg-gray-900 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Aura</h1>
              <p className="text-sm text-gray-300">Personal Safety AI</p>
            </div>
            <button
              onClick={() => setCurrentView('settings')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-8 flex flex-col items-center">
          {/* Animated Orb as Central Visual */}
          <AnimatedOrb
            auraState={aura.state}
            isListening={voice.isListening}
            permissionStatus={voice.permissionStatus}
            onRequestPermission={voice.requestPermission}
          />

          {/* Status Text Below Orb */}
          <div className="text-center">
            {voice.permissionStatus === 'prompt' && (
              <>
                <p className="text-sm text-orange-600 font-medium mb-2">Aura needs microphone & location. Click settings to enable.</p>
                <button
                  onClick={voice.requestPermission}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors mb-2"
                >
                  Grant Microphone Permission
                </button>
              </>
            )}
            {voice.permissionStatus === 'granted' && aura.state === AuraState.IDLE && (
              <p className="text-sm text-gray-600">Aura is listening for 'Help Aura'...</p>
            )}
            {aura.state === AuraState.ACTIVE && (
              <p className="text-sm text-blue-700 font-medium">Aura is active: Threat detected!</p>
            )}
            {aura.state === AuraState.ALERT && (
              <p className="text-sm text-red-600 font-semibold">Codeword detected! Sending alert...</p>
            )}
            {aura.state === AuraState.SOS_ACTIVE && (
              <p className="text-sm text-green-600 font-semibold">Emergency Alert Sent!</p>
            )}
          </div>

          {/* New Delhi Map with family/friends */}
          <div className="w-full">
            <h2 className="text-sm text-gray-300 mb-2">Relatives & Friends in New Delhi</h2>
            <CityMap height={320} />
          </div>

          {/* Activate Aura Button */}
          {aura.state === AuraState.IDLE && voice.permissionStatus === 'granted' && (
            <div className="flex justify-center">
              <button
                onClick={voice.startListening}
                disabled={isProcessing || sosProcessing || emergencyVoiceActive}
                className="w-full bg-aura-primary hover:bg-aura-calm text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Start Aura Monitoring</span>
              </button>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-aura-primary">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-300">Processing audio...</span>
              </div>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-300 text-center">
              Aura is a safety deterrent. In real emergencies, always call 911.<br />Your conversations are processed securely and not stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
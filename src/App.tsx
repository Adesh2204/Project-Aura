import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { FakeCallScreen } from './Components/FakeCallScreen';
import { Settings as SettingsComponent } from './Components/Settings';
import { PermissionPrompt } from './Components/PermissionPrompt';
import { AlertConfirmationScreen } from './Components/AlertConfirmationScreen';
import { useAuraState } from './hooks/useAuraState';
import { useAudioCapture } from './hooks/useAudioCapture';
import { useLocation as useGeoLocation } from './hooks/useLocation';
import { useVoiceActivation } from './hooks/useVoiceActivation';
import { apiService } from './services/apiService';
import { storageService } from './services/storageService';
import { UserProfile, AuraState } from './types';
import { AnimatedOrb } from './Components/AnimatedOrb';
import { CityMap } from './Components/CityMap';
import { MonitoringScreen } from './Components/MonitoringScreen';
import MenuBar from './Components/MenuBar';
import ChatSection from './Components/ChatSection';
import SafeRoute from './Components/SafeRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './Components/Login';
import { SignUp } from './Components/SignUp';

// Main App component with router
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/chat" element={<ChatSection />} />
          <Route path="/safe-route" element={<SafeRoute />} />
          <Route path="/monitoring" element={
            <MonitoringScreen 
              onBack={() => window.history.back()} 
              userLocation={{ latitude: 28.6139, longitude: 77.2090 }} 
            />} 
          />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Main content component that uses router hooks
const AppContent = () => {
  const navigate = useNavigate();
  const location = useGeoLocation();
  const { user, userProfile, loading, updateUserProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'settings' | 'permissions' | 'sos-confirmation' | 'fake-call' | 'monitoring' | 'auth'>(
    'auth'
  );
  const aura = useAuraState();
  const audio = useAudioCapture();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sosProcessing, setSOSProcessing] = useState(false);
  const [emergencyVoiceActive, setEmergencyVoiceActive] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Define handleSOSActivate function
  const handleSOSActivate = async () => {
    if (!userProfile) {
      console.error('No user profile available for SOS alert');
      return;
    }
    
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
    enabled: userProfile?.voiceActivationEnabled ?? false,
    language: userProfile?.voiceActivationLanguage ?? 'en-US'
  });

  // Handle authentication state changes
  useEffect(() => {
    console.log('App auth state changed:', { loading, user: !!user, userProfile: !!userProfile });
    
    if (loading) return;
    
    if (user && userProfile) {
      console.log('User authenticated, checking onboarding status');
      // User is authenticated, check if onboarding is complete
      if (storageService.isOnboardingComplete()) {
        console.log('Onboarding complete, setting view to home');
        setCurrentView('home');
      } else {
        console.log('Onboarding incomplete, setting view to permissions');
        setCurrentView('permissions');
      }
    } else {
      console.log('User not authenticated, setting view to auth');
      // User is not authenticated
      setCurrentView('auth');
    }
  }, [user, userProfile, loading]);

  // Show loading state
  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if user is not authenticated
  if (currentView === 'auth') {
    console.log('Rendering auth screen, mode:', authMode);
    return (
      <div>
        {authMode === 'login' ? (
          <Login onSwitchToSignUp={() => setAuthMode('signup')} />
        ) : (
          <SignUp onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  // Check if onboarding is complete and handle voice activation changes
  useEffect(() => {
    if (!userProfile) return;
    
    if (storageService.isOnboardingComplete()) {
      setCurrentView('home');
    }
    
    // Request microphone permission if voice activation is enabled
    if (userProfile.voiceActivationEnabled && voice.permissionStatus === 'prompt') {
      voice.requestPermission();
    }
  }, [userProfile?.voiceActivationEnabled]);

  // Handle audio processing workflow
  useEffect(() => {
    if (!userProfile) return;
    
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
  }, [audio.audioBlob, aura.isListening, userProfile]);



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
    if (!userProfile) {
      console.error('No user profile available for all-clear');
      return;
    }
    
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

  const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    try {
      const updatedProfile = { ...userProfile, ...updates };
      await updateUserProfile(updates);
      storageService.saveUserProfile(updatedProfile);
      
      // Update emergency contacts separately
      if (updates.emergencyContacts) {
        storageService.saveEmergencyContacts(updates.emergencyContacts);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
    if (!userProfile) {
      setCurrentView('auth');
      return null;
    }
    
    return <PermissionPrompt onComplete={handlePermissionsComplete} />;
  }

  // Render settings
  if (currentView === 'settings') {
    if (!userProfile) {
      setCurrentView('home');
      return null;
    }
    
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

  // Navigate to monitoring route
  if (currentView === 'monitoring') {
    navigate('/monitoring');
    return null;
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
  if (currentView === 'home') {
    if (!userProfile) {
      setCurrentView('auth');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-aura-background">
        <div className="bg-gray-900 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MenuBar placement="inline" />
              <div>
                <h1 className="text-xl font-semibold text-white">Aura</h1>
                <p className="text-sm text-gray-300">Personal Safety AI</p>
              </div>
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
            <div className="w-full max-w-md mx-auto">
              <CityMap height={320} />
            </div>
          </div>

          {/* Monitor AURA Button */}
          <div className="w-full">
            <button
              onClick={() => setCurrentView('monitoring')}
              className="w-full bg-aura-primary hover:bg-aura-calm text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <span>Monitor AURA</span>
            </button>
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
  
  // Fallback render to satisfy function return type
  return null;
};

export default App;
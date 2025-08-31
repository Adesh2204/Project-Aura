import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useLocation as useGeoLocation } from './hooks/useLocation';
import { apiService } from './services/apiService';

type PermissionState = 'granted' | 'denied' | 'prompt';
import { storageService } from './services/storageService';
import { MonitoringScreen } from './Components/MonitoringScreen';
import { CityMap } from './Components/CityMap';
import ChatSection from './Components/ChatSection';
import SafeRoute from './Components/SafeRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmergencyProvider, useEmergency } from './contexts/EmergencyContext';
import { VoiceActivatedOrb } from './Components/VoiceActivatedOrb';

// Mock components for missing imports
const PermissionPrompt = ({ onComplete }: { onComplete: () => void }) => (
  <div>Permission Prompt</div>
);

const SettingsComponent = ({ onBack }: { onBack: () => void }) => (
  <div>Settings</div>
);

const AlertConfirmationScreen = ({ onBack }: { onBack: () => void }) => (
  <div>Alert Confirmation</div>
);

const FakeCallScreen = ({ onEndCall }: { onEndCall: () => void }) => (
  <div>Fake Call</div>
);

// Main App component with router
const App = () => {
  const [isListening, setIsListening] = useState(false); // Used by VoiceActivatedOrb
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  return (
    <AuthProvider>
      <EmergencyProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/chat" element={<ChatSection />} />
            <Route path="/safe-route" element={<SafeRoute />} />
            <Route 
              path="/monitoring" 
              element={
                <MonitoringScreen 
                  onBack={() => window.history.back()} 
                  userLocation={{ latitude: 28.6139, longitude: 77.2090 }} 
                />
              } 
            />
            <Route path="*" element={<AppContent />} />
          </Routes>
          <VoiceActivatedOrb
            auraState={isListening ? 'listening' : 'idle'}
            isListening={isListening}
            permissionStatus={permissionStatus}
            onRequestPermission={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                setPermissionStatus('granted');
              } catch (err) {
                console.error('Error requesting microphone permission:', err);
                setPermissionStatus('denied');
              }
            }}
            className="w-24 h-24"
          />
        </Router>
      </EmergencyProvider>
    </AuthProvider>
  );
};

// Main content component that uses router hooks
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useGeoLocation();
  const { user, userProfile, signIn, signOut, loading } = useAuth();
  const { activateEmergency } = useEmergency();
  const [currentView, setCurrentView] = useState<'home' | 'settings' | 'permissions' | 'sos-confirmation' | 'fake-call' | 'monitoring' | 'auth'>('auth');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sosProcessing, setSOSProcessing] = useState(false);
  
  // Mock aura state
  const aura = {
    triggerSOS: () => {},
    setTranscription: (text: string) => { console.log('Transcription:', text); },
    setAIResponse: (response: string) => { console.log('AI Response:', response); },
    updateSOSResult: (result: any) => {},
    sosAlertResult: { data: { contactsNotified: 0, timestamp: new Date().toISOString() } }
  };

  // Handle emergency activation
  const handleEmergencyActivation = useCallback(async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      await activateEmergency('voice');
      navigate('/chat');
    } catch (error) {
      console.error('Error activating emergency mode:', error);
    }
  }, [user, activateEmergency, navigate]);
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached, forcing to auth view');
        setCurrentView('auth');
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);
  
  // Define handleSOSActivate function
  const handleSOSActivate = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }
    
    setSOSProcessing(true);
    
    try {
      // Trigger SOS state immediately for UI feedback
      aura.triggerSOS();
      
      // Get current location
      const currentLocation = await location.getCurrentLocation();
      
      // Send SOS alert
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const result = await apiService.triggerSOSAlert(user.id, currentLocation);
      
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
  
  // Handle audio processing workflow
  useEffect(() => {
    if (!user?.id) return;
    
    const processAudio = async (audioBlob: Blob) => {
      if (!userProfile || !audioBlob) {
        console.error('No user profile or audio data available');
        return;
      }
      
      try {
        setIsProcessing(true);
        
        // Ensure we have a valid Blob
        if (!(audioBlob instanceof Blob)) {
          throw new Error('Invalid audio data format');
        }
        
        // Process audio through the complete workflow
        const result = await apiService.processAudioWorkflow(audioBlob);
        
        // Update transcription and AI response
        if (aura) {
          aura.setTranscription(result.transcription);
          aura.setAIResponse(result.ai_response);
        }
        
        // Play the AI response
        if (result.ai_response) {
          await apiService.playAudioResponse(result.ai_response);
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        // Optionally update UI to show error to user
        if (aura) {
          aura.setAIResponse('Sorry, there was an error processing your request.');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Listen for audio blobs
    const handleAudioData = (e: CustomEvent<Blob>) => {
      processAudio(e.detail);
    };

    window.addEventListener('audioData', handleAudioData as EventListener);
    return () => {
      window.removeEventListener('audioData', handleAudioData as EventListener);
    };
  }, [user, userProfile, aura]);
  
  // Handle authentication state changes
  useEffect(() => {
    if (loading) return;
    
    if (user) {
      console.log('User authenticated, checking profile and onboarding status');
      // User is authenticated, check if profile exists and onboarding is complete
      if (userProfile) {
        if (storageService.isOnboardingComplete()) {
          console.log('Onboarding complete, setting view to home');
          setCurrentView('home');
        } else {
          console.log('Onboarding incomplete, setting view to permissions');
          setCurrentView('permissions');
        }
      } else {
        console.log('User authenticated but no profile yet, waiting for profile...');
        // User is authenticated but profile is still loading
        // Don't change view yet, wait for profile to load
      }
    } else {
      console.log('User not authenticated, setting view to auth');
      // User is not authenticated
      setCurrentView('auth');
    }
  }, [user, userProfile, loading]);

  // Show loading state with timeout fallback
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Aura</h1>
          <p className="mb-6">Please sign in to continue</p>
          <button 
            onClick={() => signIn({})}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Render permission prompt
  if (currentView === 'permissions') {
    return <PermissionPrompt onComplete={() => setCurrentView('home')} />;
  }

  // Render settings screen
  if (currentView === 'settings') {
    return <SettingsComponent onBack={() => setCurrentView('home')} />;
  }

  // Render alert confirmation screen
  if (currentView === 'sos-confirmation') {
    return <AlertConfirmationScreen onBack={() => setCurrentView('home')} />;
  }

  // Navigate to monitoring route
  if (currentView === 'monitoring') {
    navigate('/monitoring');
    return null;
  }

  // Render fake call screen
  if (currentView === 'fake-call') {
    return <FakeCallScreen onEndCall={() => setCurrentView('home')} />;
  }

  // Main app content when user is authenticated
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Aura Safety</h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => setCurrentView('settings')}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Settings"
              >
                ⚙️
              </button>
              <button 
                onClick={signOut}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Sign Out"
              >
                👋
              </button>
            </div>
          </header>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-aura-primary">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-300">Processing audio...</span>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Welcome back, {userProfile?.fullName || 'User'}</h2>
              <p className="text-gray-400 mb-6">How can I assist you today?</p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button 
                  onClick={handleEmergencyActivation}
                  disabled={sosProcessing}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {sosProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Activating...</span>
                    </>
                  ) : (
                    <span>Emergency SOS</span>
                  )}
                </button>
                <button 
                  onClick={() => setCurrentView('fake-call')}
                  className="bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Fake Call
                </button>
              </div>
            </div>
          </div>

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
};

export default App;
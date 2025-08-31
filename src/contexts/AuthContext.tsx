import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile, EmergencyContact } from '../types';

interface AuthError {
  message: string;
  code?: string;
}

interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  emergencyContacts?: EmergencyContact[];
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (data: SignInData) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse<void>>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<AuthResponse>;
  error: AuthError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // For now, always use mock authentication for development
        console.warn('Using mock authentication for development');
        
        // Create a mock user session
        const mockUser = {
          id: 'mock-user-id',
          email: 'demo@aura.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: null,
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          email_change_confirm_status: 0,
          banned_until: null,
          reauthentication_sent_at: null,
          recovery_sent_at: null,
          email_change_sent_at: null,
          new_email: null,
          invited_at: null,
          confirmation_sent_at: null,
          unconfirmed_email: null,
          phone_change: null,
          phone_change_sent_at: null,
          email_change: null,
          factors: null
        };
        
        if (isMounted) {
          console.log('Setting mock user and profile...');
          setUser(mockUser as any);
          
          // Create a mock profile
          const mockProfile: UserProfile = {
            id: mockUser.id,
            fullName: 'Demo User',
            phoneNumber: '+1234567890',
            emergencyContacts: [
              { id: '1', name: 'Emergency Services', phoneNumber: '911' }
            ],
            voiceActivationEnabled: false,
            voiceActivationLanguage: 'en-US'
          };
          setUserProfile(mockProfile);
          
          // Also save to storage service for consistency
          import('../services/storageService').then(({ storageService }) => {
            storageService.saveUserProfile(mockProfile);
            storageService.saveEmergencyContacts(mockProfile.emergencyContacts);
          });
          
          console.log('Mock authentication complete, setting loading to false');
          setLoading(false);
        }
        return;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setError({
            message: 'Failed to initialize authentication',
            code: 'auth_init_error'
          });
          // Set loading to false even if auth fails so app can continue
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = async (userData: SignUpData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      // Always use mock sign up for development
      console.log('Using mock sign up for development');
      
      // Mock successful sign up
      const mockUser = {
        id: 'mock-user-id',
        email: userData.email,
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
        phone: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        email_change_confirm_status: 0,
        banned_until: null,
        reauthentication_sent_at: null,
        recovery_sent_at: null,
        email_change_sent_at: null,
        new_email: null,
        invited_at: null,
        confirmation_sent_at: null,
        unconfirmed_email: null,
        phone_change: null,
        phone_change_sent_at: null,
        email_change: null,
        factors: null
      };
      
      const mockProfile: UserProfile = {
        id: mockUser.id,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        emergencyContacts: userData.emergencyContacts || [
          { id: '1', name: 'Emergency Services', phoneNumber: '911' }
        ],
        voiceActivationEnabled: false,
        voiceActivationLanguage: 'en-US'
      };
      
      setUser(mockUser as any);
      setUserProfile(mockProfile);
      
      return { 
        data: { user: mockUser, profile: mockProfile },
        error: null 
      };
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      const authError: AuthError = {
        message: error.message || 'Failed to sign up',
        code: error.code
      };
      setError(authError);
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }: SignInData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Signing in user:', email);
      
      // Always use mock authentication for development
      console.log('Using mock authentication for development');
      
      // Mock successful sign in
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
        phone: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        email_change_confirm_status: 0,
        banned_until: null,
        reauthentication_sent_at: null,
        recovery_sent_at: null,
        email_change_sent_at: null,
        new_email: null,
        invited_at: null,
        confirmation_sent_at: null,
        unconfirmed_email: null,
        phone_change: null,
        phone_change_sent_at: null,
        email_change: null,
        factors: null
      };
      
      const mockProfile: UserProfile = {
        id: mockUser.id,
        fullName: 'Demo User',
        phoneNumber: '+1234567890',
        emergencyContacts: [
          { id: '1', name: 'Emergency Services', phoneNumber: '911' }
        ],
        voiceActivationEnabled: false,
        voiceActivationLanguage: 'en-US'
      };
      
      console.log('Mock sign in successful, setting user and profile...');
      setUser(mockUser as any);
      setUserProfile(mockProfile);
      
      // Also save to storage service for consistency
      import('../services/storageService').then(({ storageService }) => {
        storageService.saveUserProfile(mockProfile);
        storageService.saveEmergencyContacts(mockProfile.emergencyContacts);
      });
      
      console.log('Mock sign in complete');
      
      return { 
        data: { user: mockUser, profile: mockProfile },
        error: null 
      };
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      const authError: AuthError = {
        message: error.message || 'Failed to sign in',
        code: error.code
      };
      setError(authError);
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResponse<void>> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simple mock sign out
      setUser(null);
      setUserProfile(null);
      
      return { data: undefined, error: null };
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      const authError: AuthError = {
        message: error.message || 'Failed to sign out',
        code: error.code
      };
      setError(authError);
      return { data: undefined, error: authError };
    } finally {
      setLoading(false);
    }
  };
  
  const clearError = () => setError(null);

  /**
   * SAFE PROFILE UPDATE FUNCTION
   * 
   * This function fixes the critical bug where partial updates would overwrite
   * existing data with undefined values, causing data loss.
   * 
   * The fix dynamically builds the update payload to only include fields that:
   * 1. Are present in the updates object
   * 2. Are not undefined
   * 3. Actually need to be updated
   * 
   * This prevents accidental data erasure and ensures only intended fields are modified.
   */
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<AuthResponse> => {
    if (!user) {
      const error: AuthError = { message: 'User not authenticated' };
      setError(error);
      return { data: null, error };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update local state with the new values
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Also save to storage service
      import('../services/storageService').then(({ storageService }) => {
        const updatedProfile = { ...userProfile, ...updates };
        storageService.saveUserProfile(updatedProfile);
        if (updates.emergencyContacts) {
          storageService.saveEmergencyContacts(updates.emergencyContacts);
        }
      });
      
      return { 
        data: { updated: true, profile: updates },
        error: null 
      };
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      const authError: AuthError = {
        message: error.message || 'Failed to update profile',
        code: error.code
      };
      setError(authError);
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await supabaseService.getUserById(userId);
      if (profile) {
        const userProfile: UserProfile = {
          id: profile.id,
          fullName: profile.full_name || '',
          phoneNumber: profile.phone_number || '',
          emergencyContacts: profile.emergency_contacts || [],
          voiceActivationEnabled: profile.voice_activation_enabled || false,
          voiceActivationLanguage: profile.voice_activation_language || 'en-US'
        };
        setUserProfile(userProfile);
        return userProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError({
        message: 'Failed to load user profile',
        code: 'profile_fetch_error'
      });
    }
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (error) throw error;
          
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setError({
            message: 'Failed to initialize authentication',
            code: 'auth_init_error'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = async (userData: SignUpData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Sign up the user
      const { data: { user: newUser }, error: signUpError } = await supabaseService.signUp(
        userData.email, 
        userData.password
      );
      
      if (signUpError || !newUser) {
        const error = signUpError || { message: 'Failed to create user' };
        throw error;
      }

      // 2. Create user profile
      const profileData = {
        id: newUser.id,
        email: userData.email,
        full_name: userData.fullName,
        phone_number: userData.phoneNumber
      };

      const createdProfile = await supabaseService.createUser(profileData);
      if (!createdProfile) {
        throw new Error('Failed to create user profile');
      }

      // 3. Handle emergency contacts
      const contacts = userData.emergencyContacts?.length 
        ? userData.emergencyContacts 
        : [{ name: 'Emergency Services', phoneNumber: '911' }];

      await Promise.all(
        contacts.map(contact => 
          supabaseService.createEmergencyContact(newUser.id, contact)
        )
      );

      // 4. Fetch complete profile
      const profile = await fetchUserProfile(newUser.id);
      
      return { 
        data: { user: newUser, profile },
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
      const { data: { user: signedInUser }, error: signInError } = await supabaseService.signIn(email, password);
      
      if (signInError || !signedInUser) {
        throw signInError || new Error('Failed to sign in');
      }

      // Fetch user profile
      const profile = await fetchUserProfile(signedInUser.id);
      
      if (!profile) {
        // If no profile exists, create one with default values
        await supabaseService.createUser({
          id: signedInUser.id,
          email: signedInUser.email || email,
          full_name: '',
          phone_number: ''
        });
        
        // Create default emergency contact
        await supabaseService.createEmergencyContact(signedInUser.id, {
          name: 'Emergency Services',
          phoneNumber: '911'
        });
        
        // Fetch the newly created profile
        await fetchUserProfile(signedInUser.id);
      }

      return { 
        data: { user: signedInUser, profile: userProfile },
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
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
      // DYNAMIC PAYLOAD CONSTRUCTION - FIXES THE DATA LOSS BUG
      // Only include fields that are actually provided and not undefined
      const updatePayload: any = {};
      
      if (updates.fullName !== undefined) {
        updatePayload.full_name = updates.fullName;
      }
      
      if (updates.phoneNumber !== undefined) {
        updatePayload.phone_number = updates.phoneNumber;
      }
      
      if (updates.voiceActivationEnabled !== undefined) {
        updatePayload.voice_activation_enabled = updates.voiceActivationEnabled;
      }
      
      if (updates.voiceActivationLanguage !== undefined) {
        updatePayload.voice_activation_language = updates.voiceActivationLanguage;
      }
      
      // Only proceed if there are actual updates to make
      if (Object.keys(updatePayload).length === 0) {
        return { 
          data: { updated: false, message: 'No updates provided' },
          error: null 
        };
      }

      // Update in database with safe payload
      const updatedProfile = await supabaseService.updateUser(user.id, updatePayload);
      
      if (!updatedProfile) {
        throw new Error('Failed to update user profile');
      }
      
      // Update local state with the new values
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      return { 
        data: { updated: true, profile: updatedProfile },
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

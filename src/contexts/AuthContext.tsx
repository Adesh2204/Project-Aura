import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ user: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await supabaseService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          try {
            // Fetch user profile from database
            const profile = await supabaseService.getUserById(currentUser.id);
            if (profile) {
              setUserProfile({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                phoneNumber: profile.phone_number,
                emergencyContacts: profile.emergency_contacts || [],
                voiceActivationEnabled: false,
                voiceActivationLanguage: 'en-US'
              });
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Continue without profile for now
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // This is expected for new users or when not authenticated
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            // Fetch user profile
            const profile = await supabaseService.getUserById(session.user.id);
            if (profile) {
              setUserProfile({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                phoneNumber: profile.phone_number,
                emergencyContacts: profile.emergency_contacts || [],
                voiceActivationEnabled: false,
                voiceActivationLanguage: 'en-US'
              });
            } else {
              console.log('No profile found for user, will create one on first action');
            }
          } catch (profileError) {
            console.error('Error fetching user profile on auth change:', profileError);
            // Continue without profile for now
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { user: newUser, error } = await supabaseService.signUp(email, password, {
        full_name: userData.fullName || '',
        phone_number: userData.phoneNumber || '',
        emergency_contacts: userData.emergencyContacts || []
      });

      if (error) {
        console.error('SignUp error:', error);
        return { user: null, error };
      }

      if (newUser) {
        try {
          // Create user profile in database
          const profile = await supabaseService.createUser({
            id: newUser.id,
            email: newUser.email!,
            full_name: userData.fullName || '',
            phone_number: userData.phoneNumber || '',
            emergency_contacts: userData.emergencyContacts || []
          });

          if (profile) {
            setUserProfile({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              phoneNumber: profile.phone_number,
              emergencyContacts: profile.emergency_contacts || [],
              voiceActivationEnabled: false,
              voiceActivationLanguage: 'en-US'
            });
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Still return success for auth, but log the profile creation error
        }
      }

      return { user: newUser, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: signedInUser, error } = await supabaseService.signIn(email, password);
      
      if (signedInUser && !error) {
        // Fetch user profile
        const profile = await supabaseService.getUserById(signedInUser.id);
        if (profile) {
          setUserProfile({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            phoneNumber: profile.phone_number,
            emergencyContacts: profile.emergency_contacts || [],
            voiceActivationEnabled: false,
            voiceActivationLanguage: 'en-US'
          });
        }
      }

      return { user: signedInUser, error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile?.id) return;

    try {
      const updatedProfile = await supabaseService.updateUser(userProfile.id, {
        full_name: updates.fullName,
        phone_number: updates.phoneNumber,
        emergency_contacts: updates.emergencyContacts
      });

      if (updatedProfile) {
        setUserProfile(prev => prev ? {
          ...prev,
          ...updates
        } : null);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

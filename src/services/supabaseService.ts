import { supabase, Database } from '../lib/supabase';
import { UserProfile, Location } from '../types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type SOSAlert = Database['public']['Tables']['sos_alerts']['Row'];
type SOSAlertInsert = Database['public']['Tables']['sos_alerts']['Insert'];
type SOSAlertUpdate = Database['public']['Tables']['sos_alerts']['Update'];

type EmergencyContact = Database['public']['Tables']['emergency_contacts']['Row'];
type EmergencyContactInsert = Database['public']['Tables']['emergency_contacts']['Insert'];

export class SupabaseService {
  /**
   * User Management
   */
  async createUser(userData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  /**
   * SOS Alerts
   */
  async createSOSAlert(alertData: SOSAlertInsert): Promise<SOSAlert | null> {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating SOS alert:', error);
      return null;
    }
  }

  async getSOSAlertsByUserId(userId: string): Promise<SOSAlert[]> {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
      return [];
    }
  }

  async updateSOSAlert(alertId: string, updates: SOSAlertUpdate): Promise<SOSAlert | null> {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .update(updates)
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating SOS alert:', error);
      return null;
    }
  }

  async getActiveSOSAlerts(): Promise<SOSAlert[]> {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active SOS alerts:', error);
      return [];
    }
  }

  /**
   * Emergency Contacts
   */
  async createEmergencyContact(contactData: EmergencyContactInsert): Promise<EmergencyContact | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      return null;
    }
  }

  async getEmergencyContactsByUserId(userId: string): Promise<EmergencyContact[]> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }
  }

  async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      return null;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      return false;
    }
  }

  /**
   * Authentication
   */
  async signUp(email: string, password: string, userData: Partial<UserInsert>): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      return { user: data.user, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, error };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { user: data.user, error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error };
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * File Upload
   */
  async uploadAudioFile(file: File, userId: string): Promise<string | null> {
    try {
      const fileName = `${userId}/${Date.now()}_audio.webm`;
      const { data, error } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();

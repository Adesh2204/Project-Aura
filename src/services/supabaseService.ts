import { supabase, Database } from '../lib/supabase';
import { EmergencyContact } from '../types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type SOSAlert = Database['public']['Tables']['sos_alerts']['Row'];
type SOSAlertInsert = Database['public']['Tables']['sos_alerts']['Insert'];
type SOSAlertUpdate = Database['public']['Tables']['sos_alerts']['Update'];

type EmergencyContactDB = Database['public']['Tables']['emergency_contacts']['Row'];


export interface UserWithContacts extends User {
  emergency_contacts: EmergencyContact[];
}

class SupabaseService {
  // Authentication
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await supabase.auth.signOut();
  }

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

  async getUserById(userId: string): Promise<UserWithContacts | null> {
    try {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get emergency contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);

      if (contactsError) throw contactsError;

      // Transform contacts to match EmergencyContact interface
      const emergencyContacts: EmergencyContact[] = (contacts || []).map(contact => ({
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phone_number
      }));

      return {
        ...user,
        emergency_contacts: emergencyContacts
      };
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

  // Emergency Contacts
  async createEmergencyContact(userId: string, contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContactDB | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: userId,
          name: contact.name,
          phone_number: contact.phoneNumber,
          relationship: 'Emergency Contact'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      return null;
    }
  }

  async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContactDB | null> {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber;

      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updateData)
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

  // SOS Alerts
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
}

export const supabaseService = new SupabaseService();

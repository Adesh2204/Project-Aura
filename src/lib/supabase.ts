import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}

console.log('Supabase configuration check:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone_number: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone_number: string;
          relationship: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone_number: string;
          relationship?: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone_number?: string;
          relationship?: string;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string;
          location: {
            latitude: number;
            longitude: number;
          };
          status: 'active' | 'resolved' | 'false_alarm';
          created_at: string;
          resolved_at?: string;
          audio_url?: string;
          transcription?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location: {
            latitude: number;
            longitude: number;
          };
          status?: 'active' | 'resolved' | 'false_alarm';
          created_at?: string;
          resolved_at?: string;
          audio_url?: string;
          transcription?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location?: {
            latitude: number;
            longitude: number;
          };
          status?: 'active' | 'resolved' | 'false_alarm';
          created_at?: string;
          resolved_at?: string;
          audio_url?: string;
          transcription?: string;
        };
      };
    };
  };
}

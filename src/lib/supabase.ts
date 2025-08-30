import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config check:', { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          emergency_contacts: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone_number: string;
          emergency_contacts?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone_number?: string;
          emergency_contacts?: string[];
          created_at?: string;
          updated_at?: string;
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
          relationship: string;
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
    };
  };
}

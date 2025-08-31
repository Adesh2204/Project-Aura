export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  emergencyContacts: EmergencyContact[];
  voiceActivationEnabled: boolean;
  voiceActivationLanguage: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export enum AuraState {
  IDLE = 'idle',
  ACTIVE = 'active',
  ALERT = 'alert',
  SOS_ACTIVE = 'sos_active',
  EMERGENCY_VOICE = 'emergency_voice'
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface AudioProcessingResult {
  transcription: string;
  threat_detected: boolean;
  ai_response: string;
}

export interface SOSAlertResult {
  success: boolean;
  message: string;
  contactsNotified: number;
  location: Location;
  timestamp: string;
}
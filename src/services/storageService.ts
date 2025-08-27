import { EmergencyContact, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'aura_user_profile',
  EMERGENCY_CONTACTS: 'aura_emergency_contacts',
  USER_ID: 'aura_user_id'
} as const;

class StorageService {
  /**
   * Generate a unique user ID
   */
  generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create user ID
   */
  getUserId(): string {
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = this.generateUserId();
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  }

  /**
   * Save emergency contacts
   */
  saveEmergencyContacts(contacts: EmergencyContact[]): void {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts(): EmergencyContact[] {
    const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Save user profile
   */
  saveUserProfile(profile: Partial<UserProfile>): void {
    const existing = this.getUserProfile();
    const updated = { ...existing, ...profile };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
  }

  /**
   * Get user profile
   */
  getUserProfile(): UserProfile {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const defaultProfile: UserProfile = {
      id: this.getUserId(),
      name: '',
      emergencyContacts: this.getEmergencyContacts(),
      voiceActivationEnabled: false,
      voiceActivationLanguage: 'en-US'
    };
    
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  }

  /**
   * Check if onboarding is complete
   */
  isOnboardingComplete(): boolean {
    const profile = this.getUserProfile();
    return profile.emergencyContacts.length > 0;
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
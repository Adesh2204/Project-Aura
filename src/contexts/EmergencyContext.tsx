import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  distance?: number;
}

interface EmergencyState {
  isActive: boolean;
  isSharingLocation: boolean;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  triggeredBy: 'voice' | 'manual' | null;
  status: 'idle' | 'activating' | 'active' | 'error';
  error: string | null;
  contactedMembers: EmergencyContact[];
}

interface EmergencyContextType extends EmergencyState {
  activateEmergency: (triggeredBy: 'voice' | 'manual') => Promise<void>;
  deactivateEmergency: () => void;
  addContactedMember: (contact: EmergencyContact) => void;
  updateLocation: (location: { latitude: number; longitude: number; accuracy?: number }) => void;
  setError: (error: string | null) => void;
}

const initialState: EmergencyState = {
  isActive: false,
  isSharingLocation: false,
  triggeredBy: null,
  status: 'idle',
  error: null,
  contactedMembers: [],
};

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EmergencyState>(initialState);

  const activateEmergency = async (triggeredBy: 'voice' | 'manual') => {
    try {
      setState(prev => ({
        ...prev,
        status: 'activating',
        triggeredBy,
        error: null,
      }));

      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setState(prev => ({
        ...prev,
        isActive: true,
        isSharingLocation: true,
        location,
        status: 'active',
      }));

    } catch (error) {
      console.error('Error activating emergency mode:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get location',
      }));
    }
  };

  const deactivateEmergency = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isSharingLocation: false,
      status: 'idle',
      triggeredBy: null,
      error: null,
    }));
  };

  const addContactedMember = (contact: EmergencyContact) => {
    setState(prev => ({
      ...prev,
      contactedMembers: [...prev.contactedMembers, contact],
    }));
  };

  const updateLocation = (location: { latitude: number; longitude: number; accuracy?: number }) => {
    setState(prev => ({
      ...prev,
      location: {
        ...prev.location,
        ...location,
      },
    }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      status: error ? 'error' : prev.status,
    }));
  };

  return (
    <EmergencyContext.Provider
      value={{
        ...state,
        activateEmergency,
        deactivateEmergency,
        addContactedMember,
        updateLocation,
        setError,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = (): EmergencyContextType => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};

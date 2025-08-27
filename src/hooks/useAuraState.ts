import { useState, useCallback } from 'react';
import { AuraState } from '../types';

export const useAuraState = () => {
  const [state, setState] = useState<AuraState>(AuraState.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [sosAlertResult, setSOSAlertResult] = useState<any>(null);

  const activateAura = useCallback(() => {
    setState(AuraState.ACTIVE);
    setIsListening(true);
  }, []);

  const deactivateAura = useCallback(() => {
    setState(AuraState.IDLE);
    setIsListening(false);
    setTranscription('');
    setAiResponse('');
  }, []);

  const triggerAlert = useCallback(() => {
    setState(AuraState.ALERT);
  }, []);

  const triggerSOS = useCallback(() => {
    setState(AuraState.SOS_ACTIVE);
  }, []);

  const triggerEmergencyVoice = useCallback(() => {
    setState(AuraState.EMERGENCY_VOICE);
  }, []);

  const resetToIdle = useCallback(() => {
    setState(AuraState.IDLE);
    setIsListening(false);
    setTranscription('');
    setAiResponse('');
    setSOSAlertResult(null);
  }, []);

  const updateTranscription = useCallback((text: string) => {
    setTranscription(text);
  }, []);

  const updateAiResponse = useCallback((response: string) => {
    setAiResponse(response);
  }, []);

  const updateSOSResult = useCallback((result: any) => {
    setSOSAlertResult(result);
  }, []);
  return {
    state,
    isListening,
    transcription,
    aiResponse,
    sosAlertResult,
    activateAura,
    deactivateAura,
    triggerAlert,
    triggerSOS,
    triggerEmergencyVoice,
    resetToIdle,
    updateTranscription,
    updateAiResponse,
    updateSOSResult
  };
};
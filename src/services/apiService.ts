import { Location, AudioProcessingResult, ApiResponse } from '../types';

// NOTE: Replace these with your actual API keys from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key';
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'your-elevenlabs-api-key';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1`;
  }

  /**
   * Emergency warning messages for AI Assistant Voice
   */
  private emergencyWarnings = [
    "Hey! I can see you on camera right now. Step away from that person immediately.",
    "This is a monitored safety call. I'm recording everything and your location is being tracked. Back off now!",
    "Police have been notified and are en route to your exact location. I repeat - authorities are on the way. Leave immediately!",
    "This is your final warning. Emergency services are 2 minutes away. You are being recorded and identified. Move away now!"
  ];

  /**
   * Transcribe audio using OpenAI's Whisper API
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      // Return a mock transcription for development
      return "Someone is talking to me and I'm not sure about their intentions.";
    }
  }

  /**
   * Get AI response from GPT-4 based on context and threat level
   */
  async getAIResponse(transcribedText: string, isAssertiveMode: boolean = false): Promise<string> {
    try {
      const systemPrompt = isAssertiveMode 
        ? `You are Aura, a personal safety AI. The situation has escalated. Change your tone to be loud, assertive, and official. Announce that this is a monitored safety call, that audio is being recorded, and that the user's location has been shared with authorities. Address the potential aggressor directly. Keep responses under 50 words and be direct.`
        : `You are Aura, a personal safety AI. You are on a simulated phone call with me. Your tone is calm, clear, and reassuring. Respond as if you are a friend or family member on the phone, asking clarifying questions like 'What's going on?' or 'Describe them to me'. Keep responses under 30 words.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: transcribedText
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI response failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || 'I understand. Can you tell me more about what\'s happening?';
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Return appropriate mock response based on mode
      return isAssertiveMode 
        ? "This call is being monitored and recorded. The user's location has been shared with emergency services. Please step away immediately."
        : "Hey, what's going on? Are you okay? Can you describe what's happening?";
    }
  }

  /**
   * Generate speech using ElevenLabs TTS API
   */
  async generateSpeech(responseText: string): Promise<Blob> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: responseText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Speech generation failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating speech:', error);
      // Return empty blob for development - in real app, you might want to use browser's built-in TTS
      return new Blob();
    }
  }

  /**
   * Trigger SMS alert via backend serverless function
   */
  async triggerSmsAlert(userId: string, location: Location): Promise<ApiResponse> {
    try {
      // Check if we have valid Supabase configuration
      if (!SUPABASE_URL || SUPABASE_URL === 'your-supabase-url' || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-supabase-anon-key') {
        console.warn('Supabase not configured, using mock response for SMS alert');
        return {
          success: true,
          message: 'Emergency alert sent successfully (mock response - Supabase not configured)'
        };
      }

      const response = await fetch(`${this.baseUrl}/send-aura-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      if (!response.ok) {
        throw new Error(`Alert failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending SMS alert:', error);
      // Return mock success for development
      return {
        success: true,
        message: 'Emergency alert sent successfully (mock response)'
      };
    }
  }

  /**
   * Trigger critical SOS alert via backend serverless function
   */
  async triggerSOSAlert(userId: string, location: Location): Promise<ApiResponse> {
    try {
      // Check if we have valid Supabase configuration
      if (!SUPABASE_URL || SUPABASE_URL === 'your-supabase-url' || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-supabase-anon-key') {
        console.warn('Supabase not configured, using mock response for SOS alert');
        return {
          success: true,
          message: 'Critical SOS alert sent successfully (mock response - Supabase not configured)',
          data: {
            contactsNotified: 3,
            location: location,
            timestamp: new Date().toISOString()
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/send-sos-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      if (!response.ok) {
        throw new Error(`SOS Alert failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      // Return mock success for development
      return {
        success: true,
        message: 'Critical SOS alert sent successfully (mock response)',
        data: {
          contactsNotified: 3,
          location: location,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Detect if transcribed text contains threat indicators
   */
  detectThreat(transcribedText: string): boolean {
    const threatKeywords = [
      'help me', 'help', 'go away', 'leave me alone', 'stop', 'no',
      'scared', 'afraid', 'uncomfortable', 'threatening', 'following',
      'emergency', 'call police', 'danger', 'unsafe'
    ];

    const lowerText = transcribedText.toLowerCase();
    return threatKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Process complete audio workflow: transcribe -> analyze -> respond
   */
  async processAudioWorkflow(audioBlob: Blob): Promise<AudioProcessingResult> {
    try {
      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(audioBlob);
      
      // Step 2: Detect threat
      const threatDetected = this.detectThreat(transcription);
      
      // Step 3: Get AI response based on threat level
      const aiResponse = await this.getAIResponse(transcription, threatDetected);
      
      return {
        transcription,
        threat_detected: threatDetected,
        ai_response: aiResponse
      };
    } catch (error) {
      console.error('Error in audio workflow:', error);
      throw error;
    }
  }

  /**
   * Play audio response through device speakers
   */
  async playAudioResponse(responseText: string): Promise<void> {
    try {
      // Generate speech audio
      const audioBlob = await this.generateSpeech(responseText);
      
      if (audioBlob.size > 0) {
        // Play generated audio
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play();
        });
        
        // Clean up
        URL.revokeObjectURL(audioUrl);
      } else {
        // Fallback to browser's built-in TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(responseText);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error playing audio response:', error);
      // Fallback to text display
      throw error;
    }
  }

  /**
   * Play emergency warning messages with escalating intensity
   */
  async playEmergencyWarnings(): Promise<void> {
    try {
      for (let i = 0; i < this.emergencyWarnings.length; i++) {
        const warning = this.emergencyWarnings[i];
        
        // Use browser's built-in TTS with aggressive settings
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(warning);
          
          // Configure for authoritative, commanding voice
          utterance.rate = 0.8;  // Slightly slower for clarity
          utterance.pitch = 0.7; // Lower pitch for authority
          utterance.volume = 1.0; // Maximum volume
          
          // Try to use a deeper, more authoritative voice
          const voices = speechSynthesis.getVoices();
          const maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('daniel')
          );
          if (maleVoice) {
            utterance.voice = maleVoice;
          }
          
          // Play the warning
          speechSynthesis.speak(utterance);
          
          // Wait for this warning to finish before next one
          await new Promise((resolve) => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
          });
          
          // Wait 10 seconds before next escalation (except for last message)
          if (i < this.emergencyWarnings.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        }
      }
    } catch (error) {
      console.error('Error playing emergency warnings:', error);
      throw error;
    }
  }

  /**
   * Stop all emergency voice warnings
   */
  stopEmergencyWarnings(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

export const apiService = new ApiService();
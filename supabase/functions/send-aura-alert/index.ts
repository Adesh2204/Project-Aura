/*
  # Aura Emergency Alert Function
  
  1. Function Purpose
    - Sends emergency SMS alerts to user's emergency contacts
    - Triggered when threat is detected by the AI system
    - Includes user's location and emergency message
  
  2. Input Parameters
    - `userId` - Unique identifier for the user
    - `latitude` - User's current latitude
    - `longitude` - User's current longitude
  
  3. Process
    - Fetch user profile and emergency contacts from database
    - Construct alert message with location link
    - Send SMS to all emergency contacts via Twilio
    - Return success/failure response
*/

import { createClient } from 'npm:@supabase/supabase-js@2';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AlertRequest {
  userId: string;
  latitude: number;
  longitude: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
}

interface UserProfile {
  id: string;
  name: string;
  emergencyContacts: EmergencyContact[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { userId, latitude, longitude }: AlertRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user profile and emergency contacts
    const { data: userProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        name,
        emergency_contacts (
          id,
          name,
          phone_number
        )
      `)
      .eq('id', userId)
      .single();

    if (fetchError || !userProfile) {
      console.error('Error fetching user profile:', fetchError);
      return new Response(
        JSON.stringify({ success: false, message: "User profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emergencyContacts = userProfile.emergency_contacts || [];

    if (emergencyContacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No emergency contacts found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Construct alert message
    const userName = userProfile.name || 'Aura User';
    const locationLink = latitude && longitude 
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : 'Location unavailable';
    
    const alertMessage = `🚨 EMERGENCY ALERT from Aura 🚨\n\n${userName} may be in danger and needs immediate assistance.\n\nLive location: ${locationLink}\n\nThis is an automated safety alert. Please check on them immediately or contact emergency services if you cannot reach them.\n\n- Aura Personal Safety`;

    // Initialize Twilio (you'll need to add these environment variables)
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "SMS service not configured" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send SMS to each emergency contact
    const results: any[] = [];
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    for (const contact of emergencyContacts) {
      try {
        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${twilioAuth}`,
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: contact.phone_number,
            Body: alertMessage,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            status: 'sent',
            messageId: result.sid
          });
        } else {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            status: 'failed',
            error: result.message || 'Unknown error'
          });
        }
      } catch (error) {
        results.push({
          contact: contact.name,
          phone: contact.phone_number,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Log alert in database for record keeping
    try {
      await supabase
        .from('emergency_alerts')
        .insert({
          user_id: userId,
          latitude: latitude || null,
          longitude: longitude || null,
          message: alertMessage,
          contacts_notified: results.filter(r => r.status === 'sent').length,
          alert_data: results,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Error logging alert:', logError);
      // Don't fail the request if logging fails
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const totalCount = results.length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Emergency alert sent to ${successCount}/${totalCount} contacts`,
        results: results,
        location: { latitude, longitude },
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in send-aura-alert function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
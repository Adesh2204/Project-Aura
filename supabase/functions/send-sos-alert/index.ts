/*
  # SOS Emergency Alert Function
  
  1. Function Purpose
    - Sends critical SOS emergency alerts to user's emergency contacts
    - Triggered when user performs long-press SOS action
    - Includes user's location and high-priority emergency message
    - More urgent than standard Aura threat detection alerts
  
  2. Input Parameters
    - `userId` - Unique identifier for the user
    - `latitude` - User's current latitude
    - `longitude` - User's current longitude
  
  3. Process
    - Fetch user profile and emergency contacts from database
    - Construct critical SOS alert message with location link
    - Send high-priority SMS to all emergency contacts via Twilio
    - Log the SOS alert in database with special priority flag
    - Return success/failure response with contact notification count
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SOSAlertRequest {
  userId: string;
  latitude: number;
  longitude: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
}

interface UserProfile {
  id: string;
  name: string;
  emergency_contacts: EmergencyContact[];
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
    const { userId, latitude, longitude }: SOSAlertRequest = await req.json();

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

    // Construct critical SOS alert message
    const userName = userProfile.name || 'Aura User';
    const locationLink = latitude && longitude 
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : 'Location unavailable';
    
    const sosMessage = `🚨 CRITICAL SOS ALERT from Aura 🚨\n\n${userName} has triggered an emergency panic button and needs immediate help.\n\nTheir current location is: ${locationLink}\n\nThis is a high-priority emergency alert. Please contact them immediately or call emergency services if you cannot reach them.\n\nTime: ${new Date().toLocaleString()}\n\n- Aura Personal Safety System`;

    // Initialize Twilio
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

    // Send SMS to each emergency contact with high priority
    const results = [];
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
            Body: sosMessage,
            // Set high priority for SOS messages
            StatusCallback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/sms-status-callback`,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            status: 'sent',
            messageId: result.sid,
            priority: 'high'
          });
        } else {
          results.push({
            contact: contact.name,
            phone: contact.phone_number,
            status: 'failed',
            error: result.message || 'Unknown error',
            priority: 'high'
          });
        }
      } catch (error) {
        results.push({
          contact: contact.name,
          phone: contact.phone_number,
          status: 'failed',
          error: error.message,
          priority: 'high'
        });
      }
    }

    // Log SOS alert in database with special priority flag
    try {
      await supabase
        .from('emergency_alerts')
        .insert({
          user_id: userId,
          latitude: latitude || null,
          longitude: longitude || null,
          message: sosMessage,
          contacts_notified: results.filter(r => r.status === 'sent').length,
          alert_data: {
            ...results,
            alert_type: 'SOS_PANIC',
            priority: 'CRITICAL',
            trigger_method: 'long_press'
          },
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Error logging SOS alert:', logError);
      // Don't fail the request if logging fails
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const totalCount = results.length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Critical SOS alert sent to ${successCount}/${totalCount} contacts`,
        data: {
          contactsNotified: successCount,
          totalContacts: totalCount,
          results: results,
          location: { latitude, longitude },
          timestamp: new Date().toISOString(),
          alertType: 'SOS_PANIC',
          priority: 'CRITICAL'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in send-sos-alert function:', error);
    
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
// Supabase Edge Function: send-sms
// -----------------------------------------------------------------------------
// Deploy with:
//   supabase functions deploy send-sms --no-verify-jwt
//   supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=+1...
//
// Then create a Database Webhook (Dashboard → Database → Webhooks):
//   Table: notifications | Event: INSERT | Function: send-sms
//
// The webhook payload contains `record.channel === 'sms'` rows created by the
// notify_appointment_event() trigger. In-app notifications are ignored.
// -----------------------------------------------------------------------------

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    user_id: string;
    channel: 'in_app' | 'sms' | 'email';
    title: string;
    body: string;
    metadata: {
      phone_country_code?: string;
      phone_number?: string;
      reference_id?: string;
    } | null;
  } | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as WebhookPayload;
    const record = payload.record;

    if (!record || record.channel !== 'sms') {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'not an SMS notification' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const countryCode = record.metadata?.phone_country_code ?? '';
    const rawPhone = record.metadata?.phone_number ?? '';
    const to = `${countryCode}${rawPhone}`.replace(/[^\d+]/g, '');

    if (!to || to.length < 8) {
      return new Response(
        JSON.stringify({ error: 'missing phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !from) {
      return new Response(
        JSON.stringify({ error: 'Twilio secrets are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = new URLSearchParams({
      To: to,
      From: from,
      Body: `${record.title}\n${record.body}`,
    });

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Twilio rejected the message', detail: twilioResult }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ sent: true, sid: twilioResult.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

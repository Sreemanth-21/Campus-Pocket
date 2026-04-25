# Deploy whatsapp-notify Edge Function

## 1. Set secrets (one-time)

```bash
supabase secrets set \
  TWILIO_ACCOUNT_SID=your_twilio_account_sid \
  TWILIO_AUTH_TOKEN=your_twilio_auth_token \
  TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number \
  GEMINI_API_KEY=your_gemini_api_key
```

## 2. Deploy the function

```bash
supabase functions deploy whatsapp-notify --no-verify-jwt
```

> `--no-verify-jwt` lets the React app call it without passing a user JWT.
> Safe for a demo — add auth back for production.

## 3. Add phone number to Supabase

Run `supabase/add_phone_number.sql` in the Supabase SQL Editor.
Replace `+919999999999` with your real WhatsApp number (E.164 format).

## 4. Update mock data phone number

In `src/services/mockData.js`, update:
```js
{ id:'parent-1', ..., phone_number: '+91XXXXXXXXXX' }
```
Use the same number you registered with the Twilio WhatsApp sandbox.

## 5. Test locally (optional)

```bash
supabase functions serve whatsapp-notify --env-file .env
```

Then POST to `http://localhost:54321/functions/v1/whatsapp-notify`:
```json
{
  "parent_phone": "+91XXXXXXXXXX",
  "student_name": "Priya Sharma",
  "alert_type": "attendance",
  "details": { "percentage": 68, "class": "10B" }
}
```

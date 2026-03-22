# 🔐 GOOGLE OAUTH SETUP GUIDE

**Step-by-step guide to enable Google Sign-In for BitTaxly**

---

## 📋 OVERVIEW

This guide will help you set up Google OAuth authentication in Supabase, allowing users to sign in with their Google accounts.

**Time Required**: 15-20 minutes
**Difficulty**: Easy

---

## STEP 1: ENABLE GOOGLE AUTH IN SUPABASE

1. Go to your Supabase Dashboard: https://kftelisaaoxqyhwgtklg.supabase.co

2. Click **"Authentication"** in the left sidebar

3. Click **"Providers"** tab

4. Scroll down to **"Google"**

5. Toggle **"Enable Sign in with Google"** to ON

6. Keep this tab open - you'll need to paste credentials here later

---

## STEP 2: CREATE GOOGLE OAUTH CREDENTIALS

### A. Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/

2. Sign in with your Google account

### B. Create or Select a Project

1. Click the project dropdown in the top nav bar

2. Either:
   - Click **"NEW PROJECT"** to create a new one
   - Or select an existing project

3. If creating new project:
   - **Project name**: "BitTaxly" (or any name you prefer)
   - Click **"CREATE"**
   - Wait for project creation (~30 seconds)

### C. Configure OAuth Consent Screen

1. In the left sidebar, go to: **"APIs & Services"** → **"OAuth consent screen"**

2. Choose **"External"** (allows anyone with a Google account to sign in)

3. Click **"CREATE"**

4. Fill in the required fields:
   - **App name**: `BitTaxly`
   - **User support email**: Your email address
   - **App logo**: (optional for now)
   - **Developer contact information**: Your email address

5. Under **"Authorized domains"** (later, add your production domain):
   - For now, leave empty (localhost works without this)
   - When you deploy: Add `your-domain.com`

6. Click **"SAVE AND CONTINUE"**

7. **Scopes page**: Click **"ADD OR REMOVE SCOPES"**
   - Check: `../auth/userinfo.email`
   - Check: `../auth/userinfo.profile`
   - Check: `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

8. **Test users page** (if app is in testing mode):
   - Click **"ADD USERS"**
   - Add your email address (and any test users)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

9. **Summary page**:
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

### D. Create OAuth Credentials

1. In the left sidebar: **"APIs & Services"** → **"Credentials"**

2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

3. **Application type**: Select **"Web application"**

4. **Name**: `BitTaxly Web Client`

5. **Authorized JavaScript origins**: Click **"+ ADD URI"**
   ```
   http://localhost:3002
   https://your-production-domain.com
   ```
   (Add production domain when you deploy)

6. **Authorized redirect URIs**: Click **"+ ADD URI"**
   ```
   https://kftelisaaoxqyhwgtklg.supabase.co/auth/v1/callback
   ```
   ⚠️ **IMPORTANT**: This is your Supabase callback URL. Copy it EXACTLY from Step 1.

7. Click **"CREATE"**

8. A popup will appear with your credentials:
   - **Client ID**: `1234567890-abcdefg.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxx`

9. **COPY BOTH VALUES** - you'll need them in the next step

   ⚠️ **SECURITY**: Never commit these to GitHub or share them publicly!

---

## STEP 3: CONFIGURE SUPABASE WITH GOOGLE CREDENTIALS

1. Go back to your Supabase Dashboard (the tab from Step 1)

2. In the **Google provider settings**:

3. Paste your Google credentials:
   - **Client ID (for OAuth)**: Paste the Client ID from Step 2
   - **Client Secret (for OAuth)**: Paste the Client Secret from Step 2

4. Click **"Save"**

---

## STEP 4: UPDATE ENVIRONMENT VARIABLES (Optional)

Your app is already configured to use Supabase Auth. No additional environment variables needed!

The Google OAuth will work automatically through Supabase.

---

## STEP 5: TEST GOOGLE SIGN-IN

### Local Testing

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3002/auth/login

3. Click **"Continue with Google"**

4. You should be redirected to Google's login page

5. Sign in with your Google account

6. Grant permissions when prompted

7. You should be redirected back to BitTaxly and be logged in!

### Verify Authentication

1. Check browser DevTools → Application → Local Storage
2. You should see Supabase auth tokens

---

## STEP 6: PRODUCTION DEPLOYMENT (When Ready)

### A. Update Google OAuth Credentials

1. Go back to Google Cloud Console → Credentials

2. Edit your OAuth Client ID

3. Under **Authorized JavaScript origins**, add:
   ```
   https://your-production-domain.vercel.app
   ```

4. Under **Authorized redirect URIs**, verify:
   ```
   https://kftelisaaoxqyhwgtklg.supabase.co/auth/v1/callback
   ```
   (Should already be there)

5. Click **"SAVE"**

### B. Update Supabase Redirect URLs

1. In Supabase Dashboard: **Authentication** → **URL Configuration**

2. Add your production domain to **"Redirect URLs"**:
   ```
   https://your-production-domain.vercel.app/auth/callback
   https://your-production-domain.vercel.app
   ```

3. Click **"Save"**

### C. Verify OAuth Consent Screen

1. Go to Google Cloud Console → **OAuth consent screen**

2. Click **"PUBLISH APP"** to make it available to all Google users

3. Alternatively, keep it in "Testing" mode and add users manually

---

## ✅ TESTING CHECKLIST

Before going live, test these scenarios:

- [ ] Sign up with Google (new account)
- [ ] Sign in with Google (existing account)
- [ ] Sign out and sign back in
- [ ] Try from different browsers
- [ ] Test on mobile devices
- [ ] Verify user data is saved in Supabase users table

---

## 🔒 SECURITY BEST PRACTICES

### 1. Keep Credentials Secure

✅ **DO:**
- Store Client ID and Client Secret in Supabase Dashboard only
- Use environment variables for any additional config
- Never commit credentials to GitHub

❌ **DON'T:**
- Share credentials publicly
- Commit `.env.local` to git (it's already in .gitignore)
- Expose credentials in client-side code

### 2. Configure OAuth Consent Screen Properly

- ✅ Use a clear, professional app name
- ✅ Add a privacy policy URL (required for production)
- ✅ Add terms of service URL
- ✅ Use a professional logo
- ✅ Provide accurate developer contact information

### 3. Monitor Usage

- Review Google Cloud Console regularly
- Check for unusual authentication patterns
- Monitor Supabase auth logs

---

## 🐛 TROUBLESHOOTING

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI doesn't match what's configured in Google

**Fix**:
1. Check Google Cloud Console → Credentials
2. Verify redirect URI is EXACTLY:
   ```
   https://kftelisaaoxqyhwgtklg.supabase.co/auth/v1/callback
   ```
3. No trailing slashes, must be HTTPS

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured

**Fix**:
1. Complete Step 2C (Configure OAuth Consent Screen)
2. Add your email as a test user (if in testing mode)
3. Or publish the app to make it public

### Error: "invalid_client"

**Cause**: Client ID or Secret is incorrect

**Fix**:
1. Re-copy credentials from Google Cloud Console
2. Paste carefully into Supabase (no extra spaces)
3. Click "Save" in Supabase

### Google sign-in button does nothing

**Cause**: Supabase URL or keys not configured

**Fix**:
1. Check `.env.local` has correct Supabase credentials
2. Restart dev server: `npm run dev`
3. Clear browser cache and cookies

### Users not appearing in Supabase

**Cause**: Database trigger not creating user records

**Fix**:
1. Check `supabase-schema.sql` was run
2. Verify users table exists in Supabase
3. Check Supabase logs for errors

---

## 📊 MONITORING OAUTH USAGE

### In Google Cloud Console

1. Go to **APIs & Services** → **OAuth consent screen**
2. View metrics for sign-ins and user consent

### In Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Filter by provider: "google"
3. Monitor sign-up and login rates

---

## 🎯 PRODUCTION CHECKLIST

Before launching to production:

- [ ] OAuth consent screen fully configured
- [ ] Privacy Policy published and linked
- [ ] Terms of Service published and linked
- [ ] Production domain added to authorized origins
- [ ] App published (or test users added)
- [ ] Email verification enabled in Supabase
- [ ] Rate limiting configured
- [ ] Error tracking setup (Sentry)
- [ ] Test Google sign-in on production URL

---

## 📚 ADDITIONAL RESOURCES

- **Google OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Supabase Auth Documentation**: https://supabase.com/docs/guides/auth
- **OAuth 2.0 Explained**: https://oauth.net/2/

---

## 🆘 NEED HELP?

If you encounter issues:

1. **Supabase Discord**: https://discord.supabase.com/
2. **Stack Overflow**: Tag questions with `supabase` and `google-oauth`
3. **Google OAuth Support**: https://support.google.com/cloud/

---

**Setup completed!** 🎉

Users can now sign in with both:
- ✅ Email and Password
- ✅ Google Account

Your authentication is now enterprise-grade, secure, and GDPR compliant!

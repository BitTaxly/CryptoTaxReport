# PRE-LAUNCH CHECKLIST FOR BITTAXLY

**Last Updated:** March 22, 2026

This document outlines everything that needs to be completed before launching BitTaxly with a custom domain.

---

## COMPLETED ITEMS

### 1. Core Features
- [x] Wallet analysis for Ethereum, Solana, Base, Arbitrum, Optimism, Polygon
- [x] Token balance fetching and price calculation
- [x] Excel report generation
- [x] DeFi position detection
- [x] Saved wallet sets
- [x] Dark/Light mode theme
- [x] Mobile responsive design

### 2. Security & Authentication
- [x] Supabase Auth (Email/Password + Google OAuth)
- [x] Enterprise-grade password hashing (bcrypt, 12 rounds)
- [x] Rate limiting with privacy-preserving IP hashing
- [x] Security headers (HSTS, CSP, X-Frame-Options, etc.)
- [x] Row Level Security (RLS) in database
- [x] AES-256 encryption at rest
- [x] TLS 1.3 encryption in transit
- [x] Input validation and sanitization

### 3. GDPR & Legal Compliance
- [x] Privacy Policy (GDPR & Swiss FADP compliant)
- [x] Terms of Service (strong liability protection)
- [x] Legal Disclaimer page
- [x] Legal acceptance modal (first-time visitors)
- [x] GDPR data export API
- [x] GDPR data deletion API (Right to Erasure)
- [x] Data retention policies
- [x] Cookie disclosure

### 4. Documentation
- [x] Security implementation documentation (600+ lines)
- [x] Google OAuth setup guide
- [x] Supabase database schema
- [x] Environment variable configuration

---

## TODO BEFORE LAUNCH

### 1. Email Templates (HIGH PRIORITY)

#### A. Confirm Signup Email
**Status:** HTML template created (needs to be added to Supabase)

**Action Required:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select "Confirm signup" template
3. Replace with beautiful HTML template (see `GOOGLE_OAUTH_SETUP.md` section on email templates)
4. Test by creating a new account

#### B. Other Email Templates (MEDIUM PRIORITY)
- [ ] Password reset email
- [ ] Magic link email
- [ ] Change email confirmation
- [ ] Account deletion confirmation

**Action:** Create similar branded HTML templates for all email types

---

### 2. Production Domain Setup (HIGH PRIORITY)

#### A. Update Google OAuth Credentials
1. [ ] Go to Google Cloud Console → APIs & Services → Credentials
2. [ ] Edit OAuth Client ID
3. [ ] Add production domain to **Authorized JavaScript origins:**
   ```
   https://your-domain.com
   https://www.your-domain.com
   ```
4. [ ] Verify Supabase callback URL is still present:
   ```
   https://kftelisaaoxqyhwgtklg.supabase.co/auth/v1/callback
   ```
5. [ ] Click **Save**

#### B. Update Supabase Redirect URLs
1. [ ] Go to Supabase Dashboard → Authentication → URL Configuration
2. [ ] Add production domains to **Redirect URLs:**
   ```
   https://your-domain.com
   https://www.your-domain.com
   https://your-domain.com/auth/callback
   https://www.your-domain.com/auth/callback
   ```
3. [ ] Set **Site URL** to: `https://your-domain.com`
4. [ ] Click **Save**

#### C. OAuth Consent Screen (if needed)
1. [ ] Go to Google Cloud Console → OAuth consent screen
2. [ ] Add production domain to **Authorized domains:**
   ```
   your-domain.com
   ```
3. [ ] Click **PUBLISH APP** (if still in testing mode)
4. [ ] Add Privacy Policy URL: `https://your-domain.com/privacy`
5. [ ] Add Terms of Service URL: `https://your-domain.com/terms`

---

### 3. Vercel Deployment (HIGH PRIORITY)

#### A. Initial Deployment
1. [ ] Push all code to GitHub repository
   - GitHub repo: https://github.com/BitTaxly/CryptoTaxReport.git
   - User needs to authenticate with GitHub first

2. [ ] Connect GitHub repo to Vercel
   - Go to https://vercel.com/new
   - Import Git Repository
   - Select BitTaxly/CryptoTaxReport

3. [ ] Configure environment variables in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://kftelisaaoxqyhwgtklg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Optional (if using analytics, error tracking, etc.)
   NEXT_PUBLIC_ANALYTICS_ID=...
   SENTRY_DSN=...
   ```

4. [ ] Deploy to production

#### B. Custom Domain
1. [ ] Go to Vercel → Project Settings → Domains
2. [ ] Add custom domain (e.g., `bittaxly.com`)
3. [ ] Configure DNS records as instructed by Vercel:
   - Add A record or CNAME record
   - Add `www` subdomain
4. [ ] Wait for SSL certificate provisioning (~1 hour)
5. [ ] Test domain: `https://your-domain.com`

---

### 4. Testing (CRITICAL)

#### A. Authentication Testing
- [ ] Sign up with email/password
- [ ] Verify email confirmation works
- [ ] Sign in with email/password
- [ ] Sign out and sign back in
- [ ] Sign up with Google OAuth
- [ ] Sign in with existing Google account
- [ ] Test password reset flow
- [ ] Test from incognito/private mode
- [ ] Test on mobile devices

#### B. Core Functionality Testing
- [ ] Analyze Ethereum wallet
- [ ] Analyze Solana wallet
- [ ] Analyze multiple wallets
- [ ] Save wallet set
- [ ] Load saved wallet set
- [ ] Delete wallet set
- [ ] Generate Excel report
- [ ] Download report file
- [ ] Test with different date ranges
- [ ] Test with wallets that have many tokens

#### C. Legal & GDPR Testing
- [ ] Legal acceptance modal appears on first visit
- [ ] Modal blocks access until accepted
- [ ] "Decline" button works correctly
- [ ] Acceptance is remembered (localStorage)
- [ ] Privacy Policy page loads correctly
- [ ] Terms of Service page loads correctly
- [ ] Disclaimer page loads correctly
- [ ] Data export API works (`/api/gdpr/export-data`)
- [ ] Data deletion API works (`/api/gdpr/delete-account`)

#### D. Security Testing
- [ ] Rate limiting kicks in after too many requests
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are prevented
- [ ] CSRF protection is active
- [ ] Security headers are present (check with https://securityheaders.com/)
- [ ] SSL/TLS is properly configured (check with https://www.ssllabs.com/ssltest/)

#### E. Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### F. Performance Testing
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No console errors or warnings

---

### 5. Monitoring & Analytics (MEDIUM PRIORITY)

#### A. Error Tracking
- [ ] Set up Sentry or similar error tracking
- [ ] Configure error alerts to email
- [ ] Test error reporting

#### B. Analytics (Optional)
- [ ] Set up privacy-focused analytics (e.g., Plausible, Fathom)
- [ ] Track page views and user flows
- [ ] Monitor signup/login conversion rates
- [ ] Add analytics opt-out in user settings

#### C. Uptime Monitoring
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure alerts for downtime
- [ ] Monitor API response times

---

### 6. Content & SEO (MEDIUM PRIORITY)

#### A. Metadata
- [x] Page title: "BitTaxly - Crypto Tax Reporting Tool"
- [x] Meta description
- [ ] Open Graph tags (for social media)
- [ ] Twitter Card tags
- [ ] Favicon (update if needed)
- [ ] Apple touch icon

#### B. Sitemap & Robots.txt
- [ ] Generate sitemap.xml
- [ ] Create robots.txt
- [ ] Submit sitemap to Google Search Console

#### C. Legal Pages - Final Review
- [ ] Have a lawyer review Terms of Service
- [ ] Have a lawyer review Privacy Policy
- [ ] Ensure all contact emails are valid:
  - [ ] legal@bittaxly.com
  - [ ] privacy@bittaxly.com
  - [ ] support@bittaxly.com
  - [ ] dpo@bittaxly.com

---

### 7. Security Hardening (HIGH PRIORITY)

#### A. Supabase Security
- [ ] Review RLS policies in Supabase
- [ ] Ensure all tables have proper RLS enabled
- [ ] Limit Supabase service role key access (server-side only)
- [ ] Enable 2FA on Supabase account
- [ ] Review API access logs

#### B. Environment Variables
- [ ] Ensure no secrets in GitHub repository
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Use environment variables in Vercel only
- [ ] Rotate any exposed API keys

#### C. Rate Limiting
- [ ] Test rate limits are working
- [ ] Adjust limits if needed (currently 5 auth requests per 15 min)
- [ ] Monitor for abuse patterns

---

### 8. Backup & Disaster Recovery (MEDIUM PRIORITY)

#### A. Database Backups
- [ ] Enable automated Supabase backups (daily)
- [ ] Test database restore process
- [ ] Document backup retention policy (30 days recommended)

#### B. Code Backups
- [x] Code is in GitHub repository
- [ ] Tag production releases (e.g., v1.0.0)
- [ ] Document rollback procedure

---

### 9. Legal & Business (HIGH PRIORITY)

#### A. Email Setup
- [ ] Set up professional email addresses:
  - legal@bittaxly.com
  - privacy@bittaxly.com
  - support@bittaxly.com
  - dpo@bittaxly.com
- [ ] Set up email forwarding or mailboxes
- [ ] Test all email addresses work

#### B. Legal Review
- [ ] Have a lawyer review Terms of Service
- [ ] Have a lawyer review Privacy Policy
- [ ] Have a lawyer review Disclaimer
- [ ] Ensure compliance with local laws (Switzerland, EU)
- [ ] If accepting payments in the future, review financial regulations

#### C. Data Protection Officer (GDPR Requirement for EU/Swiss)
- [ ] Designate a Data Protection Officer (DPO)
- [ ] Provide DPO contact info: dpo@bittaxly.com
- [ ] Document DPO responsibilities

#### D. Business Registration (If Applicable)
- [ ] Register business entity (if not already done)
- [ ] Obtain necessary licenses
- [ ] Set up business bank account (if accepting payments)

---

### 10. Documentation & Support (MEDIUM PRIORITY)

#### A. User Documentation
- [ ] Create "How to Use" guide
- [ ] Create FAQ page
- [ ] Document supported blockchains
- [ ] Explain report format

#### B. Support System
- [ ] Set up support email: support@bittaxly.com
- [ ] Create support ticket system (or use email)
- [ ] Document response time SLA
- [ ] Create troubleshooting guide

---

## CRITICAL REMINDERS

### Before Going Live:

1. **Test the Legal Acceptance Modal**
   - Clear localStorage
   - Visit site in incognito mode
   - Verify modal appears and blocks access
   - Accept terms and verify modal doesn't show again

2. **Test Google OAuth on Production**
   - After adding production domain to Google OAuth
   - Test signup with Google
   - Test login with Google
   - Verify user data is saved correctly

3. **Verify All Security Headers**
   - Use https://securityheaders.com/ to check
   - Should get at least A rating
   - Fix any missing headers

4. **Test GDPR Data Rights**
   - Export user data (JSON format)
   - Delete user account
   - Verify data is actually deleted from Supabase
   - Confirm deletion email is sent

5. **Performance Check**
   - Run Lighthouse audit
   - Fix any critical performance issues
   - Optimize images if needed
   - Enable Vercel analytics

---

## LAUNCH DAY CHECKLIST

### Final Checks (1-2 days before):
- [ ] All tests passing
- [ ] All environment variables configured
- [ ] Legal pages reviewed by lawyer
- [ ] All email addresses working
- [ ] Google OAuth working on production
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Database backups enabled

### Launch Day:
1. [ ] Deploy to production
2. [ ] Point domain to Vercel
3. [ ] Wait for DNS propagation (~1-24 hours)
4. [ ] Test production site thoroughly
5. [ ] Monitor error logs closely
6. [ ] Monitor analytics for traffic
7. [ ] Test all critical user flows

### Post-Launch (First Week):
- [ ] Monitor uptime and performance daily
- [ ] Check error logs daily
- [ ] Respond to user feedback
- [ ] Fix any critical bugs immediately
- [ ] Monitor security alerts
- [ ] Review analytics data

---

## SECURITY BEST PRACTICES

### Ongoing Security:
1. **Keep Dependencies Updated**
   - Run `npm audit` weekly
   - Update packages with known vulnerabilities
   - Test after each update

2. **Monitor Logs**
   - Check Supabase auth logs weekly
   - Look for suspicious login patterns
   - Investigate failed authentication attempts

3. **Regular Security Audits**
   - Run security scans monthly
   - Review access controls quarterly
   - Update security documentation

4. **Incident Response Plan**
   - Document what to do if breach occurs
   - Have contact info for security team
   - Test incident response annually

---

## SUPPORT CONTACTS

### Supabase Support:
- Dashboard: https://supabase.com/dashboard
- Discord: https://discord.supabase.com/

### Google Cloud Support:
- Console: https://console.cloud.google.com/
- Support: https://support.google.com/cloud/

### Vercel Support:
- Dashboard: https://vercel.com/dashboard
- Support: https://vercel.com/support

---

## SIGN-OFF

Before launching, ensure all critical items are checked:

- [ ] All authentication flows work
- [ ] Legal pages are live and accessible
- [ ] Legal acceptance modal works
- [ ] GDPR data rights are functional
- [ ] Security headers are present
- [ ] Error tracking is configured
- [ ] Production domain is working
- [ ] Google OAuth works on production
- [ ] Email addresses are set up
- [ ] Lawyer has reviewed legal documents

**Signed off by:** ________________
**Date:** ________________

---

## CONGRATULATIONS!

Once all items are checked, you're ready to launch BitTaxly!

**Remember:**
- Security is an ongoing process, not a one-time task
- Respond to user feedback and iterate
- Monitor your site regularly
- Keep legal documents up to date
- Stay compliant with GDPR and data protection laws

**Good luck with your launch!**

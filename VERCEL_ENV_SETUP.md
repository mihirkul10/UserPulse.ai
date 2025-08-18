# 🚨 URGENT: Set Environment Variables on Vercel

Your app is deployed but crashing because the environment variables are not configured on Vercel.

## Steps to Fix:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your **UserPulse.ai** project

### 2. Navigate to Settings → Environment Variables
- Click on the "Settings" tab
- Select "Environment Variables" from the left sidebar

### 3. Add ALL These Variables:
Copy the values from your `.env.local` file for each of these:

```
REDDIT_CLIENT_ID=(your Reddit client ID)
REDDIT_CLIENT_SECRET=(your Reddit client secret)
REDDIT_USERNAME=(your Reddit username)
REDDIT_PASSWORD=(your Reddit password)
REDDIT_USER_AGENT=competitor-insight/1.0 by (your username)
OPENAI_API_KEY=(your OpenAI API key starting with sk-)
OPENAI_MODEL=gpt-5
DEFAULT_DAYS=30
DEFAULT_MIN_SCORE_REDDIT=0
DEFAULT_MAX_THREADS=250
DEFAULT_LANGS=en
```

**Important:** Use the actual values from your `.env.local` file, not the placeholders above!

### 4. Important Settings:
- For each variable, select:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

### 5. Redeploy
After adding all variables:
- Click "Redeploy" from the Deployments tab
- Or push a small change to trigger a new deployment

## Why This Happens:
- Your `.env.local` file is NOT uploaded to GitHub (for security)
- Vercel needs these variables to be manually configured
- Without them, API calls fail and the app crashes

## Test After Setup:
1. Wait for redeployment to complete
2. Visit your app URL
3. Try the analysis again - it should work!

## Alternative: Quick Test
If you want to verify this is the issue, check the browser console:
1. Open your deployed app
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Submit the form
5. You'll likely see 500 errors or "undefined" API key errors

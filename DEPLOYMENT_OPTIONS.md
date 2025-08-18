# 🚀 Quick Deployment Options for UserPulse.AI

Your app is ready to deploy! Here are the **fastest options**:

## Option 1: Netlify (5 minutes)

### Step 1: Build (already done)
```bash
npm run build
```

### Step 2: Deploy
```bash
npx netlify deploy --prod --dir=.next
```

### Step 3: Set Environment Variables
Go to Netlify dashboard → Site settings → Environment variables and add:
```
REDDIT_CLIENT_ID=LF8BRMogbuDHyzACflLyBA
REDDIT_CLIENT_SECRET=HNxzDPZhoJ0boq7jobMO3fUU16Yucg
REDDIT_USERNAME=micool10
REDDIT_PASSWORD=Msktycoon0@.
REDDIT_USER_AGENT=competitor-insight/1.0 by micool10
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
DEFAULT_DAYS=30
DEFAULT_MIN_SCORE_REDDIT=0
DEFAULT_MAX_THREADS=250
DEFAULT_LANGS=en
```

## Option 2: Railway (3 minutes)

1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Connect your `UserPulse.ai` repository
4. Add the environment variables above
5. Deploy automatically

## Option 3: Render (5 minutes)

1. Go to [render.com](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub repo
4. Build Command: `npm run build`
5. Start Command: `npm start`
6. Add environment variables
7. Deploy

## Option 4: Heroku (10 minutes)

1. Install Heroku CLI
2. `heroku create your-app-name`
3. Set environment variables: `heroku config:set OPENAI_MODEL=gpt-4o`
4. `git push heroku main`

## Recommended: Railway or Render

Both are more reliable than Vercel for complex Next.js apps and handle environment variables better.

## Need Help?

If you need me to walk through any of these step-by-step, just ask!

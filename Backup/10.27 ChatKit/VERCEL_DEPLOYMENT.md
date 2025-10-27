# Vercel Deployment Guide

Google Apps Script has CORS limitations, so we're using Vercel instead for the backend. Vercel is free, fast, and handles CORS properly.

---

## Quick Setup (5 minutes)

### Step 1: Install Vercel CLI (Optional but helpful)

```bash
npm install -g vercel
```

Or skip this and use the web interface only.

### Step 2: Create Vercel Account & Deploy

**Via Web Interface (Easiest):**

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended - auto-connects your repo)
3. After signing in, click **"Add New"** → **"Project"**
4. Select **"Import Git Repository"**
5. Choose your `chatkit-assistant` repository
6. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
7. Click **"Deploy"**

### Step 3: Add Environment Variables

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add two variables:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-proj-...`)
   - **Environment**: Production, Preview, Development (check all)

   - **Name**: `CHATKIT_WORKFLOW_ID`
   - **Value**: Your workflow ID (starts with `wf_...`)
   - **Environment**: Production, Preview, Development (check all)

4. Click **Save**

### Step 4: Redeploy to Apply Environment Variables

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 5: Update Your Frontend

Your Vercel API endpoint will be:
```
https://YOUR_PROJECT_NAME.vercel.app/api/session
```

Example:
```
https://chatkit-assistant.vercel.app/api/session
```

Update `index.html` line 172:
```javascript
const GAS_BACKEND_URL = 'https://YOUR_PROJECT_NAME.vercel.app/api/session';
```

Then commit and push:
```bash
git add index.html
git commit -m "Switch to Vercel backend"
git push
```

---

## Alternative: Deploy via CLI

If you prefer command line:

```bash
cd "/Users/martinobo/Documents/Skunk Works/ChatKit"

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? chatkit-assistant
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add OPENAI_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

vercel env add CHATKIT_WORKFLOW_ID
# Paste your workflow ID when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

Your API will be live at: `https://chatkit-assistant.vercel.app/api/session`

---

## Testing the Vercel Function

Test it with curl:

```bash
curl -X POST https://YOUR_PROJECT_NAME.vercel.app/api/session
```

You should see:
```json
{
  "success": true,
  "client_secret": "ek_...",
  "session_id": "..."
}
```

---

## Why Vercel Instead of Google Apps Script?

| Feature | Google Apps Script | Vercel |
|---------|-------------------|--------|
| CORS Support | ❌ Poor | ✅ Excellent |
| Setup Time | 10 minutes | 5 minutes |
| Reliability | ⚠️ Sometimes slow | ✅ Fast |
| Free Tier | ✅ Yes | ✅ Yes |
| Custom Domains | ❌ No | ✅ Yes |

---

## Troubleshooting

**"Environment variable not found"**
- Make sure you added both `OPENAI_API_KEY` and `CHATKIT_WORKFLOW_ID`
- Make sure you redeployed after adding them

**"404 Not Found"**
- Check the URL is correct: `https://YOUR_PROJECT.vercel.app/api/session`
- Make sure `api/session.js` is in your repository

**"CORS error"**
- This shouldn't happen with Vercel, but if it does, check the `session.js` file has the CORS headers

**"Failed to create session"**
- Check Vercel logs: Project → Deployments → Click latest → Functions tab
- Look for error messages

---

## Next Steps

Once deployed:

1. ✅ Frontend on GitHub Pages: `https://martinapt8.github.io/chatkit-assistant/`
2. ✅ Backend on Vercel: `https://chatkit-assistant.vercel.app/api/session`
3. ✅ ChatKit workflow running via OpenAI

**Total cost: $0** (both platforms are free for this use case)

---

## File Structure

```
ChatKit/
├── index.html              # Frontend (GitHub Pages)
├── api/
│   └── session.js         # Backend API (Vercel)
├── vercel.json            # Vercel configuration
├── .env.example           # Example environment variables
└── README.md              # Repository docs
```

---

**Deployment Status:** Ready to deploy
**Estimated Setup Time:** 5 minutes

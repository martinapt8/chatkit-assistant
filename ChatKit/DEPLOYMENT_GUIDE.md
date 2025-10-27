# ChatKit Deployment Guide

This guide walks you through deploying your ChatKit proof of concept with GitHub Pages (frontend) and Google Apps Script (backend).

---

## Architecture Overview

```
┌─────────────────────┐
│   GitHub Pages      │ ← ChatKit web component (index.html)
│   (Frontend)        │   User interacts with chat interface
└──────────┬──────────┘
           │
           │ GET request for client_secret
           ▼
┌─────────────────────┐
│  Google Apps Script │ ← Creates ChatKit sessions
│  (Token Server)     │   Returns client_secret to frontend
└──────────┬──────────┘
           │
           │ POST /v1/chatkit/sessions
           ▼
┌─────────────────────┐
│   OpenAI API        │ ← Workflow execution
│   (ChatKit)         │   Agent Builder workflow
└─────────────────────┘
```

---

## Part 1: Google Apps Script Backend Setup

### Step 1: Create New Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. Rename project to **"ChatKit Backend"** (or similar)

### Step 2: Add Backend Code

1. Delete any default code in `Code.gs`
2. Copy the entire contents of `Code.gs` from this project
3. Paste into the Apps Script editor
4. Click **Save** (💾 icon)

### Step 3: Configure Script Properties

You mentioned you already have these set up:

1. Click **Project Settings** (⚙️ gear icon on left)
2. Scroll to **Script Properties**
3. Verify these properties exist:
   - `CHATKIT_WORKFLOW_ID` - Your workflow ID from Agent Builder
   - `OPENAI_API_KEY` - Your OpenAI API key

If not set, click **"Add script property"** and add them.

### Step 4: Test Backend Configuration

1. In the Apps Script editor, select the function dropdown (top middle)
2. Select **`testConfiguration`**
3. Click **Run** (▶️ icon)
4. **First time only**: You'll be prompted to authorize the script
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to ChatKit Backend (unsafe)**
   - Click **Allow**
5. Check **Execution log** (bottom) for results
   - Should see: `SUCCESS: Session created!`
   - Should see: `Client Secret: ek_...`

**If you see errors:**
- `OPENAI_API_KEY not found` → Add the script property
- `CHATKIT_WORKFLOW_ID not found` → Add the script property
- `401 Unauthorized` → Check your API key is correct
- `404 Not Found` → Check your workflow ID is correct

### Step 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click **⚙️ gear icon** next to "Select type"
3. Select **Web app**
4. Configure deployment:
   - **Description**: "ChatKit Token Server v1"
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone** (⚠️ important for GitHub Pages)
5. Click **Deploy**
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/...../exec`)
   - Save this URL - you'll need it for the frontend!
7. Click **Done**

**Security Note:** The "Anyone" access is safe because:
- The script only creates ChatKit sessions (read-only workflow access)
- No sensitive data is exposed
- OpenAI API key is never returned to the client
- You can add rate limiting if needed

---

## Part 2: GitHub Pages Frontend Setup

### Step 6: Initialize Git Repository

Open Terminal and navigate to your ChatKit folder:

```bash
cd "/Users/martinobo/Documents/Skunk Works/ChatKit"
```

Initialize Git repository:

```bash
# Initialize git
git init

# Create .gitignore to exclude unnecessary files
cat > .gitignore << 'EOF'
.DS_Store
*.gs
CHATKIT_LESSONS_LEARNED.md
DEPLOYMENT_GUIDE.md
ChatKitDocs
A8ProjectSearch.html
styles.html
EOF

# Add files
git add index.html
git commit -m "Initial commit: ChatKit frontend for GitHub Pages"
```

### Step 7: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click **"+"** (top right) → **"New repository"**
3. Configure repository:
   - **Repository name**: `chatkit-assistant` (or your preferred name)
   - **Description**: "ChatKit frontend for A8 Assistant"
   - **Visibility**: Choose **Public** or **Private**
     - Public: Anyone can see the code
     - Private: Only you (and collaborators) can see it
   - **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

### Step 8: Push to GitHub

GitHub will show you quick setup commands. Use the **"push an existing repository"** section:

```bash
# Add GitHub as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push code
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/martinobo/chatkit-assistant.git
git branch -M main
git push -u origin main
```

**First time pushing?** GitHub will prompt you to authenticate:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope
  - Copy and use as password

### Step 9: Configure GitHub Pages

1. In your GitHub repository, click **Settings** (top tab)
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click **Save**
5. GitHub will show: **"Your site is live at https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"**
   - This may take 1-2 minutes to deploy
6. **Copy this URL** - this is your live frontend!

### Step 10: Update Frontend with Backend URL

Now connect the frontend to your backend:

1. Open `index.html` in a text editor
2. Find line with `const GAS_BACKEND_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';`
3. Replace with your Web App URL from **Step 5**:
   ```javascript
   const GAS_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```
4. Save the file
5. Commit and push the change:
   ```bash
   git add index.html
   git commit -m "Add Google Apps Script backend URL"
   git push
   ```
6. Wait 1-2 minutes for GitHub Pages to redeploy

---

## Part 3: Testing

### Step 11: Test the Full Integration

1. Open your GitHub Pages URL in a browser:
   - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
2. You should see:
   - A8 logo
   - "Initializing ChatKit session..." message
   - Then the ChatKit chat interface appears
3. **Send a test message** to verify the workflow works

**Open browser console** (F12 or Cmd+Option+I) to check for errors:
- Should see: `[ChatKit] Client secret received: ek_...`
- Should see: `[ChatKit] Chat component initialized`

### Common Issues & Fixes

#### ❌ "Failed to fetch" or CORS error
- **Cause**: Backend URL is wrong or not deployed
- **Fix**: Verify your GAS_BACKEND_URL in index.html matches your Web App URL
- **Fix**: Make sure Web App is deployed with "Who has access: Anyone"

#### ❌ "ChatKit failed to load"
- **Cause**: ChatKit CDN blocked or slow connection
- **Fix**: Refresh the page
- **Fix**: Check browser console for CDN errors

#### ❌ "Backend returned 401" or "API Error"
- **Cause**: OPENAI_API_KEY is invalid
- **Fix**: Check Script Properties in Apps Script

#### ❌ "Unknown parameter: workflow"
- **Cause**: Workflow ID is malformed
- **Fix**: Verify CHATKIT_WORKFLOW_ID in Script Properties

#### ❌ Chat loads but doesn't respond
- **Cause**: Workflow ID might be wrong or workflow is not published
- **Fix**: Check Agent Builder to ensure workflow is active

---

## Part 4: Updating & Maintenance

### Making Frontend Changes

```bash
# Edit index.html or other files
# Then commit and push:
git add .
git commit -m "Update chat interface styling"
git push

# Wait 1-2 minutes for GitHub Pages to update
```

### Making Backend Changes

1. Edit `Code.gs` in Apps Script editor
2. Click **Save**
3. Click **Deploy** → **Manage deployments**
4. Click **✏️ Edit** (pencil icon) on your deployment
5. Change **Version** to "New version"
6. Click **Deploy**
7. **No need to update index.html** (URL stays the same)

### Viewing Logs

**Frontend logs:**
- Open browser console (F12 or Cmd+Option+I)
- Look for `[ChatKit]` messages

**Backend logs:**
- Apps Script editor → **Executions** (left sidebar)
- Shows all requests, errors, and logs

---

## Security Best Practices

### ✅ What's Safe
- GitHub Pages hosting is safe (static HTML)
- Google Apps Script keeps API key secure (never exposed to frontend)
- ChatKit client_secret is session-specific and temporary

### ⚠️ Considerations
- Your GitHub repository code is visible (if public)
  - Does NOT expose API keys or secrets
  - Only shows frontend HTML/JS
- Web App URL is publicly accessible
  - Anyone with the URL can create sessions
  - Recommendation: Add rate limiting if this becomes a problem

### 🔒 Optional Enhancements
1. **Rate Limiting**: Track requests in Apps Script to prevent abuse
2. **Domain Whitelist**: Only allow requests from your GitHub Pages domain
3. **Analytics**: Log session creation for usage tracking

---

## Files Overview

### Frontend (GitHub Pages)
- **`index.html`** - Main chat interface
  - Loads ChatKit web component
  - Fetches client_secret from backend
  - Initializes chat session

### Backend (Google Apps Script)
- **`Code.gs`** - Token server
  - Creates ChatKit sessions via OpenAI API
  - Returns client_secret to frontend
  - Handles CORS for cross-origin requests

### Documentation
- **`DEPLOYMENT_GUIDE.md`** - This file
- **`CHATKIT_LESSONS_LEARNED.md`** - Background on why this architecture

### Legacy Files (Not Deployed)
- **`A8ProjectSearch.html`** - Old custom chat UI (reference)
- **`styles.html`** - Font styles (reference)
- **`ChatKitDocs`** - Documentation notes

---

## Quick Reference Commands

### Git Basics
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push

# View commit history
git log --oneline
```

### Useful Links
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
- **GitHub Pages Site**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
- **Apps Script Project**: `https://script.google.com`
- **OpenAI Platform**: `https://platform.openai.com`
- **ChatKit Docs**: `https://platform.openai.com/docs/guides/chatkit`

---

## Next Steps

Once deployed and tested:

1. **Share the GitHub Pages URL** with your team
2. **Monitor usage** via Apps Script Executions log
3. **Customize styling** in index.html to match your brand
4. **Add features** like:
   - Session persistence (save chat history)
   - Analytics tracking
   - Custom welcome messages
   - Feedback forms

---

## Support

If you run into issues:

1. Check browser console for frontend errors
2. Check Apps Script Executions for backend errors
3. Review ChatKit docs: https://platform.openai.com/docs/guides/chatkit
4. Test backend independently using `testConfiguration()` function

---

**Deployment Version:** 1.0
**Last Updated:** 2025-01-17
**Status:** Ready to deploy

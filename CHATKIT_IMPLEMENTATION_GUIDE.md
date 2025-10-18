# ChatKit Implementation Guide

**Complete guide for implementing OpenAI ChatKit with various hosting platforms**

Created: 2025-10-18
Status: Production-ready
Live Example: https://martinapt8.github.io/chatkit-assistant/

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Implementation Steps](#implementation-steps)
5. [Platform-Specific Guides](#platform-specific-guides)
6. [Troubleshooting](#troubleshooting)
7. [Lessons Learned](#lessons-learned)
8. [Future Enhancements](#future-enhancements)

---

## Overview

ChatKit is OpenAI's embeddable chat interface for Agent Builder workflows. This guide documents a successful implementation using:

- **Frontend**: GitHub Pages (static hosting)
- **Backend**: Vercel Serverless Functions (token server)
- **AI**: OpenAI ChatKit + Agent Builder

### What You'll Build

A fully functional chat interface that:
- ✅ Connects to your Agent Builder workflow
- ✅ Handles authentication securely (API key never exposed to client)
- ✅ Works across domains with proper CORS
- ✅ Scales automatically (serverless)
- ✅ Costs $0 to host (free tiers)

---

## Architecture

### High-Level Flow

```
┌─────────────────────┐
│   User Browser      │
│  (GitHub Pages)     │
└──────────┬──────────┘
           │
           │ 1. Load page with <openai-chatkit> element
           │
           ▼
┌─────────────────────┐
│   ChatKit CDN       │
│   (OpenAI)          │
└──────────┬──────────┘
           │
           │ 2. ChatKit calls getClientSecret()
           │
           ▼
┌─────────────────────┐
│  Vercel Function    │
│  /api/session       │
└──────────┬──────────┘
           │
           │ 3. Create ChatKit session
           │
           ▼
┌─────────────────────┐
│  OpenAI ChatKit API │
│  POST /v1/chatkit/  │
│       sessions      │
└──────────┬──────────┘
           │
           │ 4. Return client_secret
           │
           ▼
┌─────────────────────┐
│  User sees chat UI  │
│  Connected to       │
│  Agent workflow     │
└─────────────────────┘
```

### Component Breakdown

| Component | Purpose | Technology | Cost |
|-----------|---------|------------|------|
| **Frontend** | Chat UI display | HTML/JS + ChatKit CDN | Free (GitHub Pages) |
| **Backend** | Token server | Serverless function | Free (Vercel) |
| **Storage** | None needed | N/A | Free |
| **AI** | Agent workflow | OpenAI Agent Builder | Pay per use |

---

## Prerequisites

### 1. OpenAI Setup

- OpenAI account with API access
- Agent Builder workflow created
- Workflow ID (starts with `wf_`)
- OpenAI API key (starts with `sk-proj-` or `sk-`)

### 2. Domain Configuration

**CRITICAL**: ChatKit requires domain whitelisting.

1. Go to https://platform.openai.com/settings/organization/chatkit
2. Add your domain (e.g., `yoursite.github.io` or `localhost` for testing)
3. Copy the **public key** (starts with `domain_pk_`)
4. Save both the domain and public key - you'll need them

### 3. Development Tools

- Git installed
- GitHub account
- Text editor
- Basic JavaScript/HTML knowledge

---

## Implementation Steps

### Step 1: Create Agent Builder Workflow

1. Go to https://platform.openai.com/agent-builder
2. Create a new workflow
3. Configure:
   - System prompts
   - Tools/functions
   - Knowledge bases
   - Response settings
4. **Copy the Workflow ID** (looks like: `wf_68f2dd90cdb881909669712bd0ce81400feda643669b5406`)

### Step 2: Set Up Domain Allowlist

**This step is critical and often missed!**

1. Navigate to: https://platform.openai.com/settings/organization/chatkit
2. Click "Add Domain"
3. Enter your domain:
   - For GitHub Pages: `username.github.io`
   - For local testing: `localhost`
   - For custom domain: `yourdomain.com`
4. Save and **copy the public key** that's generated
5. The public key looks like: `domain_pk_68f3015dbb588190990ca2923ee7165504beacee6aa524a4`

### Step 3: Create Frontend (index.html)

Create an HTML file with the ChatKit element:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatKit Assistant</title>

    <!-- ChatKit CDN - Load async -->
    <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>

    <style>
        /* Basic styling */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #000;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .chat-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            min-height: 600px;
        }

        /* ChatKit element styling */
        openai-chatkit {
            display: block !important;
            width: 100% !important;
            height: 600px !important;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="chat-container">
            <div id="loading" class="loading">
                <p>Loading chat...</p>
            </div>

            <!-- ChatKit web component -->
            <openai-chatkit id="my-chat"></openai-chatkit>
        </div>
    </div>

    <script>
        // Configuration
        const BACKEND_URL = 'YOUR_BACKEND_URL_HERE'; // e.g., https://yourapp.vercel.app/api/session
        const PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';   // e.g., domain_pk_68f3015d...

        // Initialize ChatKit
        async function initializeChatKit() {
            try {
                // Hide loading
                document.getElementById('loading').style.display = 'none';

                // Get ChatKit element
                const chatkit = document.getElementById('my-chat');

                // Configure using official API
                chatkit.setOptions({
                    api: {
                        async getClientSecret(currentClientSecret) {
                            // If no secret or need refresh
                            if (!currentClientSecret) {
                                const res = await fetch(BACKEND_URL, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                });

                                const data = await res.json();
                                if (!data.success) {
                                    throw new Error(data.error || 'Failed to create session');
                                }

                                return data.client_secret;
                            }

                            return currentClientSecret;
                        }
                    },
                });

                console.log('[ChatKit] Initialized successfully');

            } catch (error) {
                console.error('[ChatKit] Error:', error);
                document.getElementById('loading').innerHTML =
                    `<p style="color: red;">Error: ${error.message}</p>`;
            }
        }

        // Wait for ChatKit to load
        window.addEventListener('DOMContentLoaded', () => {
            if (customElements.get('openai-chatkit')) {
                initializeChatKit();
            } else {
                setTimeout(() => {
                    if (customElements.get('openai-chatkit')) {
                        initializeChatKit();
                    } else {
                        console.error('ChatKit failed to load');
                    }
                }, 3000);
            }
        });
    </script>
</body>
</html>
```

### Step 4: Create Backend (Serverless Function)

**Option A: Vercel** (Recommended - see [Vercel Guide](#vercel))

Create `api/session.js`:

```javascript
// Vercel Serverless Function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const workflowId = process.env.CHATKIT_WORKFLOW_ID;

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    return res.status(200).json({
      success: true,
      client_secret: data.client_secret,
      session_id: data.id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

**Option B: Netlify** (see [Netlify Guide](#netlify))

**Option C: AWS Lambda** (see [AWS Guide](#aws))

### Step 5: Configure Environment Variables

Set these in your backend platform:

- `OPENAI_API_KEY` - Your OpenAI API key
- `CHATKIT_WORKFLOW_ID` - Your workflow ID from Agent Builder

### Step 6: Update Frontend with URLs

In `index.html`, replace:
- `YOUR_BACKEND_URL_HERE` with your deployed backend URL
- `YOUR_PUBLIC_KEY_HERE` with your domain public key

### Step 7: Deploy & Test

1. Deploy frontend to hosting platform
2. Deploy backend to serverless platform
3. Test in browser
4. Check console for errors

---

## Platform-Specific Guides

### <a name="vercel"></a>Vercel (Recommended)

**Why Vercel?**
- ✅ Excellent CORS support
- ✅ Fast edge network
- ✅ Easy GitHub integration
- ✅ Generous free tier
- ✅ Auto-deploys on git push

**Setup Steps:**

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Create project structure**:
   ```
   your-project/
   ├── index.html
   ├── api/
   │   └── session.js
   ├── vercel.json
   └── .gitignore
   ```

3. **Create `vercel.json`**:
   ```json
   {
     "functions": {
       "api/session.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

4. **Deploy via Web**:
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "Add New" → "Project"
   - Import your Git repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `CHATKIT_WORKFLOW_ID`
   - Deploy

5. **Deploy via CLI**:
   ```bash
   vercel login
   vercel
   # Follow prompts
   vercel env add OPENAI_API_KEY
   vercel env add CHATKIT_WORKFLOW_ID
   vercel --prod
   ```

6. **Your API URL**: `https://your-project.vercel.app/api/session`

---

### <a name="netlify"></a>Netlify

**Why Netlify?**
- ✅ Great for static sites
- ✅ Serverless functions included
- ✅ Easy deployment
- ✅ Free tier available

**Setup Steps:**

1. **Create project structure**:
   ```
   your-project/
   ├── index.html
   ├── netlify/
   │   └── functions/
   │       └── session.js
   └── netlify.toml
   ```

2. **Create `netlify/functions/session.js`**:
   ```javascript
   exports.handler = async function(event, context) {
     // Enable CORS
     const headers = {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
       'Access-Control-Allow-Methods': 'POST, OPTIONS'
     };

     if (event.httpMethod === 'OPTIONS') {
       return { statusCode: 200, headers, body: '' };
     }

     try {
       const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
           'OpenAI-Beta': 'chatkit_beta=v1',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           workflow: { id: process.env.CHATKIT_WORKFLOW_ID },
           user: `user-${Date.now()}`
         })
       });

       const data = await response.json();

       return {
         statusCode: 200,
         headers,
         body: JSON.stringify({
           success: true,
           client_secret: data.client_secret
         })
       };
     } catch (error) {
       return {
         statusCode: 500,
         headers,
         body: JSON.stringify({ success: false, error: error.message })
       };
     }
   };
   ```

3. **Create `netlify.toml`**:
   ```toml
   [build]
     functions = "netlify/functions"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

4. **Deploy**:
   - Go to https://netlify.com
   - Connect to Git repository
   - Add environment variables
   - Deploy

5. **Your API URL**: `https://your-site.netlify.app/api/session`

---

### <a name="aws"></a>AWS Lambda + API Gateway

**Why AWS?**
- ✅ Enterprise-grade
- ✅ Highly scalable
- ✅ Integrates with AWS services
- ⚠️ More complex setup

**Setup Steps:**

1. **Create Lambda function**:
   ```javascript
   exports.handler = async (event) => {
     const headers = {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
       'Content-Type': 'application/json'
     };

     if (event.httpMethod === 'OPTIONS') {
       return { statusCode: 200, headers, body: '' };
     }

     try {
       const fetch = await import('node-fetch');

       const response = await fetch.default('https://api.openai.com/v1/chatkit/sessions', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
           'OpenAI-Beta': 'chatkit_beta=v1',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           workflow: { id: process.env.CHATKIT_WORKFLOW_ID },
           user: `user-${Date.now()}`
         })
       });

       const data = await response.json();

       return {
         statusCode: 200,
         headers,
         body: JSON.stringify({
           success: true,
           client_secret: data.client_secret
         })
       };
     } catch (error) {
       return {
         statusCode: 500,
         headers,
         body: JSON.stringify({ success: false, error: error.message })
       };
     }
   };
   ```

2. **Set up API Gateway**:
   - Create REST API
   - Create POST method
   - Enable CORS
   - Deploy to stage

3. **Add environment variables** in Lambda console

4. **Your API URL**: `https://xxxxxx.execute-api.region.amazonaws.com/prod/session`

---

### Google Apps Script (⚠️ NOT RECOMMENDED)

**Why NOT Google Apps Script?**
- ❌ CORS issues with modern browsers
- ❌ Slow cold starts
- ❌ Complex CORS workarounds needed
- ❌ Unreliable for production

**If you must use it** (not recommended):

See `CHATKIT_LESSONS_LEARNED.md` for why we moved away from Google Apps Script.

---

## Troubleshooting

### Common Issues

#### 1. "ChatKit failed to load"

**Symptoms**: Console shows "ChatKit web component failed to load"

**Solutions**:
- Check ChatKit CDN is loading: `https://cdn.platform.openai.com/deployments/chatkit/chatkit.js`
- Ensure script has `async` attribute
- Increase timeout in initialization code (try 5000ms)
- Check browser console for blocked resources

#### 2. Blank white chat area

**Symptoms**: Chat container shows but no interface

**Solutions**:
- **Domain not whitelisted**: Add domain to OpenAI dashboard
- **Missing public key**: Add public key to frontend config
- **Wrong API method**: Use `setOptions()` not manual element creation
- Check console for `getClientSecret` being called

#### 3. CORS errors

**Symptoms**: "Access-Control-Allow-Origin" errors

**Solutions**:
- ✅ **Vercel/Netlify**: Should work automatically
- ❌ **Google Apps Script**: Switch to Vercel/Netlify
- Add CORS headers to backend response:
  ```javascript
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  ```
- Handle OPTIONS preflight requests

#### 4. "Unknown beta requested: 'chatkit'"

**Symptoms**: Backend returns 400 error

**Solution**: Fix the OpenAI-Beta header
- ❌ Wrong: `'OpenAI-Beta': 'chatkit=v1'`
- ✅ Correct: `'OpenAI-Beta': 'chatkit_beta=v1'`

#### 5. "Client secret invalid" or session fails

**Symptoms**: Chat loads but can't connect

**Solutions**:
- Check workflow ID is correct
- Verify API key has ChatKit access
- Check API key hasn't expired
- Ensure backend is returning `client_secret` correctly
- Test backend endpoint directly with curl:
  ```bash
  curl -X POST https://your-backend.vercel.app/api/session
  ```

#### 6. Works on localhost but not on deployed domain

**Symptoms**: Perfect locally, fails in production

**Solutions**:
- **Add production domain to OpenAI allowlist**
- Get new public key for production domain
- Update frontend config with production public key
- Check environment variables are set in production

---

## Lessons Learned

### Critical Mistakes to Avoid

1. **❌ Using wrong element name**
   - Wrong: `<chatkit-chat>`
   - Correct: `<openai-chatkit>`

2. **❌ Creating element dynamically**
   - Wrong: `createElement('openai-chatkit')` then setting attributes
   - Correct: Put `<openai-chatkit>` in HTML, use `setOptions()`

3. **❌ Forgetting domain whitelist**
   - This is the #1 issue that breaks deployments
   - Always whitelist before deploying

4. **❌ Using Google Apps Script for backend**
   - CORS issues are persistent
   - Use Vercel/Netlify instead

5. **❌ Wrong beta header**
   - Must be `chatkit_beta=v1` not `chatkit=v1`

### Best Practices

1. **✅ Test locally first**
   - Add `localhost` to domain allowlist
   - Test everything before deploying

2. **✅ Use environment variables**
   - Never commit API keys
   - Use platform's env var system

3. **✅ Add error handling**
   - Show user-friendly error messages
   - Log errors for debugging

4. **✅ Monitor usage**
   - Check OpenAI usage dashboard
   - Set up alerts for unexpected costs

5. **✅ Version control**
   - Use Git for all code
   - Tag releases

---

## Future Enhancements

### Frontend Improvements

1. **Custom Styling**
   - ChatKit supports custom themes
   - See: https://openai.github.io/chatkit-js/guides/theming

2. **Analytics**
   - Track chat sessions
   - Monitor user engagement
   - A/B test different workflows

3. **Authentication**
   - Add user login
   - Persist chat history per user
   - Implement rate limiting

4. **Mobile Optimization**
   - Responsive design
   - Mobile-specific features
   - PWA support

### Backend Improvements

1. **Session Management**
   - Store sessions in database
   - Implement session refresh
   - Handle expired sessions gracefully

2. **Rate Limiting**
   - Prevent abuse
   - Implement per-user limits
   - Add IP-based throttling

3. **Caching**
   - Cache client secrets temporarily
   - Reduce API calls
   - Improve performance

4. **Monitoring**
   - Log all requests
   - Set up error alerts
   - Track response times

### Agent Workflow Improvements

1. **Better Prompts**
   - Test and iterate on prompts
   - Use Agent Builder's eval features
   - A/B test different approaches

2. **Add Tools/Functions**
   - Integrate external APIs
   - Add database lookups
   - Connect to internal systems

3. **Knowledge Bases**
   - Upload company documents
   - Keep knowledge up to date
   - Version control for knowledge

4. **Multi-turn Conversations**
   - Improve context handling
   - Better memory management
   - Follow-up question handling

---

## File Structure Reference

### Minimal Setup

```
chatkit-project/
├── index.html           # Frontend
├── api/
│   └── session.js      # Backend (Vercel)
├── vercel.json         # Vercel config
├── .gitignore
└── README.md
```

### Full Setup

```
chatkit-project/
├── index.html
├── api/
│   └── session.js
├── assets/
│   ├── logo.png
│   └── styles.css
├── docs/
│   ├── IMPLEMENTATION_GUIDE.md
│   └── API_REFERENCE.md
├── .env.example
├── .gitignore
├── vercel.json
├── package.json
└── README.md
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-cf...` |
| `CHATKIT_WORKFLOW_ID` | Agent Builder workflow ID | `wf_68f2dd90...` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yoursite.com` |
| `MAX_SESSIONS_PER_IP` | Rate limit | `10` |
| `SESSION_TTL` | Session expiry (seconds) | `3600` |

---

## Testing Checklist

Before deploying to production:

- [ ] Domain added to OpenAI allowlist
- [ ] Public key copied and added to frontend
- [ ] Environment variables set in backend
- [ ] Backend endpoint tested with curl
- [ ] Frontend loads without errors
- [ ] Chat interface appears
- [ ] Can send messages
- [ ] Agent responds correctly
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Error handling works
- [ ] Console has no errors

---

## Cost Estimates

### Free Tier Usage (Expected for POC/MVP)

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| **GitHub Pages** | Unlimited for public repos | Free |
| **Vercel** | 100GB bandwidth/month | $20/month Pro |
| **Netlify** | 100GB bandwidth/month | $19/month Pro |
| **OpenAI ChatKit** | Pay per token | ~$0.01-0.10 per conversation |

**Estimated Monthly Cost (Low Traffic)**:
- Hosting: $0
- API Usage: $5-50 (depends on usage)
- **Total: $5-50/month**

**Estimated Monthly Cost (Medium Traffic - 1000 users)**:
- Hosting: $0-20
- API Usage: $50-200
- **Total: $50-220/month**

---

## Quick Start Commands

### Vercel Deployment

```bash
# Clone or create project
git clone your-repo.git
cd your-repo

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add CHATKIT_WORKFLOW_ID

# Deploy to production
vercel --prod
```

### GitHub Pages Deployment

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/username/repo.git

# Push
git push -u origin main

# Enable GitHub Pages in repo settings
# Settings → Pages → Source: main branch
```

---

## Support & Resources

### Official Documentation

- [ChatKit Documentation](https://openai.github.io/chatkit-js/)
- [Agent Builder Guide](https://platform.openai.com/docs/guides/agent-builder)
- [ChatKit API Reference](https://platform.openai.com/docs/api-reference/chatkit)

### Community

- [OpenAI Developer Forum](https://community.openai.com/)
- [ChatKit GitHub Issues](https://github.com/openai/chatkit-js/issues)

### Example Projects

- [ChatKit Starter App](https://github.com/openai/openai-chatkit-starter-app)
- [ChatKit Advanced Samples](https://github.com/openai/openai-chatkit-advanced-samples)
- [Interactive Demo](https://chatkit.world)

---

## Changelog

### 2025-10-18 - v1.0
- Initial guide created
- Documented working Vercel + GitHub Pages implementation
- Added troubleshooting for common issues
- Included platform-specific guides

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Status**: Production Ready
**Maintainer**: Aptitude 8

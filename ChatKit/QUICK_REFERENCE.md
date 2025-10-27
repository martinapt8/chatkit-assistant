# ChatKit Quick Reference

**TL;DR guide for spinning up ChatKit implementations quickly**

---

## 30-Second Checklist

Before you start coding:

- [ ] Create Agent Builder workflow → Copy workflow ID
- [ ] Add domain to OpenAI allowlist → Copy public key
- [ ] Have OpenAI API key ready
- [ ] Choose hosting platform (Vercel recommended)

---

## Critical Configuration Values

```javascript
// You need these 4 values:
const BACKEND_URL = 'https://your-project.vercel.app/api/session';
const PUBLIC_KEY = 'domain_pk_xxxxx...';  // From OpenAI dashboard
const OPENAI_API_KEY = 'sk-proj-xxxxx...'; // Environment variable (backend only)
const WORKFLOW_ID = 'wf_xxxxx...';         // Environment variable (backend only)
```

---

## Minimal Working Frontend (index.html)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
    <style>
        openai-chatkit { display: block; width: 100%; height: 600px; }
    </style>
</head>
<body>
    <openai-chatkit id="chat"></openai-chatkit>

    <script>
        const BACKEND = 'https://your-backend.vercel.app/api/session';

        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                document.getElementById('chat').setOptions({
                    api: {
                        async getClientSecret(current) {
                            if (!current) {
                                const res = await fetch(BACKEND, { method: 'POST' });
                                const data = await res.json();
                                return data.client_secret;
                            }
                            return current;
                        }
                    }
                });
            }, 2000);
        });
    </script>
</body>
</html>
```

---

## Minimal Working Backend (Vercel)

**File**: `api/session.js`

```javascript
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

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

  return res.json({
    success: true,
    client_secret: data.client_secret
  });
}
```

---

## Deploy in 5 Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "ChatKit POC"
git push

# 2. Deploy to Vercel
vercel

# 3. Add environment variables
vercel env add OPENAI_API_KEY
vercel env add CHATKIT_WORKFLOW_ID

# 4. Deploy to production
vercel --prod

# 5. Get your URL and update index.html
```

---

## Common Mistakes (Don't Do This!)

❌ Wrong element name: `<chatkit-chat>`
✅ Correct: `<openai-chatkit>`

❌ Wrong beta header: `chatkit=v1`
✅ Correct: `chatkit_beta=v1`

❌ Creating element dynamically with `createElement()`
✅ Put in HTML, use `setOptions()`

❌ Forgetting domain whitelist
✅ Add to OpenAI dashboard first!

❌ Using Google Apps Script
✅ Use Vercel/Netlify

---

## Debug Checklist

If chat doesn't appear:

1. Open browser console (F12)
2. Look for ChatKit errors
3. Check these in order:
   - [ ] ChatKit CDN loaded? (Network tab)
   - [ ] `customElements.get('openai-chatkit')` returns something?
   - [ ] `getClientSecret` being called?
   - [ ] Backend returning `client_secret`?
   - [ ] Domain in OpenAI allowlist?
   - [ ] Public key configured?

---

## Test Backend Directly

```bash
# Test if your backend works
curl -X POST https://your-backend.vercel.app/api/session

# Should return:
# {"success":true,"client_secret":"ek_xxxxx..."}
```

---

## Platform URLs

| Platform | Purpose | URL |
|----------|---------|-----|
| Agent Builder | Create workflows | https://platform.openai.com/agent-builder |
| Domain Allowlist | Whitelist domains | https://platform.openai.com/settings/organization/chatkit |
| Vercel Dashboard | Deploy backend | https://vercel.com |
| GitHub Pages | Host frontend | https://pages.github.com |

---

## Environment Variables

**Vercel/Netlify/AWS**:
```
OPENAI_API_KEY=sk-proj-xxxxx...
CHATKIT_WORKFLOW_ID=wf_xxxxx...
```

Set via:
- Vercel: Dashboard → Settings → Environment Variables
- Netlify: Dashboard → Site Settings → Environment Variables
- AWS: Lambda → Configuration → Environment Variables

---

## File Structure

```
project/
├── index.html          # Frontend (GitHub Pages)
├── api/
│   └── session.js     # Backend (Vercel)
├── vercel.json        # Optional config
└── .gitignore         # Ignore .env, .vercel
```

---

## Copy-Paste `.gitignore`

```
.env
.env.local
.vercel
node_modules/
.DS_Store
```

---

## Copy-Paste `vercel.json`

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

---

## Estimated Timeline

- **Setup (first time)**: 30 minutes
- **Additional deployments**: 10 minutes
- **Troubleshooting (if issues)**: 15-60 minutes

---

## When Things Break

1. **Check console errors** - 90% of issues show here
2. **Test backend with curl** - Isolate frontend vs backend
3. **Verify domain allowlist** - Most common gotcha
4. **Check environment variables** - Are they set in production?
5. **Look at Vercel logs** - Dashboard → Deployments → Functions tab

---

## Cost Per Deployment

- Free tier: $0
- Light usage (<1000 chats/month): ~$10-20
- Medium usage (1000-10000 chats/month): ~$50-200

---

## For Next Implementation

1. Copy this project as template
2. Update 4 config values (backend URL, public key, API key, workflow ID)
3. Deploy
4. Done

**Full guide**: See `CHATKIT_IMPLEMENTATION_GUIDE.md`

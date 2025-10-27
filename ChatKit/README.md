# ChatKit Assistant

A production-ready chat interface powered by OpenAI's ChatKit and Agent Builder, hosted on GitHub Pages with a Vercel serverless backend.

## Live Demo

🔗 **[Launch ChatKit Assistant](https://martinapt8.github.io/chatkit-assistant/)**

---

## Quick Links

- **📚 [Complete Implementation Guide](CHATKIT_IMPLEMENTATION_GUIDE.md)** - Full documentation for recreating this on any platform
- **⚡ [Quick Reference](QUICK_REFERENCE.md)** - TL;DR guide for rapid deployment
- **🗺️ [Development Roadmap](DEVELOPMENT_ROADMAP.md)** - Planned frontend and backend improvements
- **📖 [Lessons Learned](CHATKIT_LESSONS_LEARNED.md)** - What we learned during development
- **🚀 [Deployment Guide](DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions

---

## Architecture

```
User Browser (GitHub Pages)
    ↓
OpenAI ChatKit CDN
    ↓
Vercel Serverless Function (/api/session)
    ↓
OpenAI ChatKit API
    ↓
Agent Builder Workflow
```

### Components

| Component | Technology | Hosting | Cost |
|-----------|-----------|---------|------|
| **Frontend** | HTML/JS + ChatKit | GitHub Pages | Free |
| **Backend** | Node.js Serverless | Vercel | Free tier |
| **AI** | Agent Builder | OpenAI Platform | Pay per use |

---

## Features

✅ **Production Ready**
- Secure token-based authentication (API key never exposed)
- Proper CORS handling
- Domain whitelisting configured
- Error handling and logging

✅ **Scalable**
- Serverless architecture
- Edge network distribution
- Auto-scaling
- No infrastructure management

✅ **Developer Friendly**
- Complete documentation
- Easy to customize
- Multiple platform guides (Vercel, Netlify, AWS)
- Quick deployment (< 10 minutes)

---

## How It Works

1. **User loads page** → ChatKit web component initializes
2. **ChatKit requests token** → Calls `getClientSecret()` callback
3. **Frontend calls backend** → POST to Vercel function `/api/session`
4. **Backend creates session** → Calls OpenAI ChatKit API with workflow ID
5. **Returns client_secret** → Frontend receives token
6. **Chat connects** → User can interact with Agent Builder workflow

---

## Quick Start

### Prerequisites

- OpenAI API key
- Agent Builder workflow ID
- Domain whitelisted in OpenAI dashboard
- GitHub account
- Vercel account (free)

### Deploy in 5 Minutes

```bash
# 1. Clone this repo
git clone https://github.com/martinapt8/chatkit-assistant.git
cd chatkit-assistant

# 2. Deploy to Vercel
vercel

# 3. Add environment variables
vercel env add OPENAI_API_KEY
vercel env add CHATKIT_WORKFLOW_ID

# 4. Deploy to production
vercel --prod

# 5. Update index.html with your Vercel URL and push
git commit -am "Update backend URL"
git push
```

**Full guide**: See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## Configuration

### Required Environment Variables (Backend)

```bash
OPENAI_API_KEY=sk-proj-xxxxx...
CHATKIT_WORKFLOW_ID=wf_xxxxx...
```

### Required Frontend Config (index.html)

```javascript
const BACKEND_URL = 'https://your-project.vercel.app/api/session';
const PUBLIC_KEY = 'domain_pk_xxxxx...'; // From OpenAI dashboard
```

---

## Documentation

### For Implementation

- **[CHATKIT_IMPLEMENTATION_GUIDE.md](CHATKIT_IMPLEMENTATION_GUIDE.md)** - Complete guide for implementing ChatKit
  - Architecture overview
  - Step-by-step setup
  - Platform-specific guides (Vercel, Netlify, AWS, etc.)
  - Troubleshooting common issues
  - Best practices

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for rapid deployment
  - Minimal code examples
  - 5-minute deployment guide
  - Common mistakes to avoid
  - Debug checklist

### For Development

- **[DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)** - Future enhancements roadmap
  - Backend improvements (Agent Builder)
  - Frontend improvements (UI/UX)
  - Infrastructure & DevOps
  - Advanced integrations

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
  - Google Apps Script setup (legacy)
  - Vercel deployment
  - GitHub Pages configuration
  - Environment variable setup

### For Learning

- **[CHATKIT_LESSONS_LEARNED.md](CHATKIT_LESSONS_LEARNED.md)** - What we learned
  - Why Google Apps Script didn't work
  - ChatKit sandbox limitations
  - API endpoint differences
  - Best architecture choices

---

## Technologies

- [OpenAI ChatKit](https://platform.openai.com/docs/guides/chatkit) - Embeddable chat interface
- [OpenAI Agent Builder](https://platform.openai.com/docs/guides/agent-builder) - Visual workflow builder
- [Vercel](https://vercel.com) - Serverless backend hosting
- [GitHub Pages](https://pages.github.com) - Frontend hosting
- Vanilla JavaScript - No framework dependencies

---

## Project Structure

```
chatkit-assistant/
├── index.html                           # Frontend chat interface
├── api/
│   └── session.js                      # Vercel serverless function
├── vercel.json                         # Vercel configuration
├── README.md                           # This file
├── CHATKIT_IMPLEMENTATION_GUIDE.md    # Complete implementation guide
├── QUICK_REFERENCE.md                 # Quick reference
├── DEVELOPMENT_ROADMAP.md             # Future improvements
├── DEPLOYMENT_GUIDE.md                # Deployment instructions
├── CHATKIT_LESSONS_LEARNED.md        # Lessons learned
└── .gitignore
```

---

## Customization

### Frontend Styling

ChatKit supports custom theming:
```javascript
chatkit.setOptions({
  theme: {
    primaryColor: '#FFD131',
    fontFamily: 'Roobert, sans-serif',
    // ... more options
  }
});
```

See: [ChatKit Theming Guide](https://openai.github.io/chatkit-js/guides/theming)

### Agent Workflow

Customize your agent in [Agent Builder](https://platform.openai.com/agent-builder):
- System prompts
- Tools and functions
- Knowledge bases
- Response settings

---

## Troubleshooting

### Chat doesn't appear

1. Check browser console for errors
2. Verify domain is whitelisted in OpenAI dashboard
3. Confirm public key is configured in frontend
4. Test backend directly: `curl -X POST https://your-backend.vercel.app/api/session`

### CORS errors

- ✅ Vercel handles CORS automatically
- ✅ Ensure backend has CORS headers
- ❌ Google Apps Script has CORS issues (use Vercel instead)

### More issues?

See [CHATKIT_IMPLEMENTATION_GUIDE.md](CHATKIT_IMPLEMENTATION_GUIDE.md) - Troubleshooting section

---

## Contributing

This is a reference implementation. Feel free to:
- Fork and customize
- Use as a template for your projects
- Submit issues for documentation improvements

---

## Resources

### Official Documentation
- [ChatKit Docs](https://openai.github.io/chatkit-js/)
- [Agent Builder Guide](https://platform.openai.com/docs/guides/agent-builder)
- [ChatKit API Reference](https://platform.openai.com/docs/api-reference/chatkit)

### Examples & Tools
- [ChatKit Playground](https://chatkit.studio/playground)
- [Widget Builder](https://widgets.chatkit.studio)
- [Starter App Repo](https://github.com/openai/openai-chatkit-starter-app)
- [Advanced Samples](https://github.com/openai/openai-chatkit-advanced-samples)

---

## License

MIT License - Feel free to use for your projects

---

## Credits

**Built by**: Aptitude 8
**Date**: October 2025
**Status**: Production Ready ✅

---

**Questions?** See the [implementation guide](CHATKIT_IMPLEMENTATION_GUIDE.md) or open an issue.

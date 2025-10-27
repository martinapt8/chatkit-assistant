# ChatKit Integration - Lessons Learned & Limitations

**Date:** 2025-01-17
**Project:** Delivery Assistant Tool
**Goal:** Integrate OpenAI ChatKit with Google Apps Script backend

---

## Summary

We attempted to build a Delivery Assistant tool that connects to an OpenAI Agent Builder workflow using ChatKit. After extensive troubleshooting, we discovered fundamental compatibility issues between ChatKit's web component architecture and Google Apps Script's HtmlService sandbox environment.

---

## What We Tried

### Attempt 1: ChatKit Web Component (Standard Approach)
**Goal:** Embed ChatKit's `<chatkit-chat>` web component in Google Apps Script HTML

**Implementation:**
```html
<chatkit-chat id="delivery-chat"></chatkit-chat>
<script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"></script>
```

**Result:** ❌ Failed
- Script loaded successfully (200 status)
- Custom element never registered (`customElements.get('chatkit-chat')` returned `undefined`)
- ChatKit web components incompatible with Google Apps Script's sandboxed iframe environment

**Error:**
```
[ChatKit] CDN script loaded.
[ChatKit] custom element registered: false
```

### Attempt 2: ES Module Import
**Goal:** Try loading ChatKit as an ES module to bypass sandbox restrictions

**Implementation:**
```javascript
<script type="module">
  await import('https://cdn.platform.openai.com/deployments/chatkit/chatkit.js');
</script>
```

**Result:** ❌ Failed
- Module imported successfully
- Custom element still did not register
- Same compatibility issue with Google Apps Script sandbox

### Attempt 3: Dynamic Script Loader with Fallbacks
**Goal:** Use defensive loading with onload/onerror handlers

**Implementation:**
```javascript
const s = document.createElement('script');
s.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
s.onload = () => { /* check if registered */ };
s.onerror = (e) => { /* fallback */ };
```

**Result:** ❌ Failed
- Script loaded without errors
- Custom element registration still blocked by sandbox
- Confirmed the issue is environmental, not a loading problem

### Attempt 4: Direct Responses API with Workflow
**Goal:** Call `/v1/responses` API directly with workflow ID

**Implementation:**
```javascript
POST /v1/responses
{
  "model": "gpt-4.1-mini",
  "input": "user message",
  "workflow": { "id": "wf_..." }
}
```

**Result:** ❌ Failed
- Responses API does not accept `workflow` parameter
- Error: `"Unknown parameter: 'workflow'."`
- Workflow ID only valid for ChatKit Sessions API

**Error:**
```json
{
  "error": {
    "message": "Unknown parameter: 'workflow'.",
    "type": "invalid_request_error",
    "param": "workflow",
    "code": "unknown_parameter"
  }
}
```

---

## Root Causes

### 1. Google Apps Script Sandbox Limitations
**Issue:** HtmlService serves content in a sandboxed iframe with restricted JavaScript capabilities

**Impact:**
- Custom Elements API (Web Components) blocked or restricted
- ChatKit's `<chatkit-chat>` web component cannot register
- Even when script loads successfully, DOM APIs are limited

**Evidence:**
- Script loads: ✅
- Script executes: ✅
- Custom element registration: ❌

### 2. ChatKit Architecture Incompatibility
**Issue:** ChatKit is designed for standard web environments, not sandboxed iframes

**Impact:**
- ChatKit relies on modern browser APIs that may not work in Google Apps Script's iframe
- No fallback or compatibility mode for restricted environments
- Web component registration is a hard requirement

### 3. API Endpoint Confusion
**Issue:** ChatKit Sessions API vs Responses API serve different purposes

**Clarification:**
- **ChatKit Sessions API** (`/v1/chatkit/sessions`):
  - Creates session with workflow ID
  - Returns `client_secret` for frontend
  - **Only works with ChatKit web component**

- **Responses API** (`/v1/responses`):
  - General-purpose model inference
  - Does NOT accept workflow parameter
  - Cannot connect to Agent Builder workflows directly

**Key Insight:** You cannot use Agent Builder workflows without ChatKit's UI component or rebuilding the agent logic manually.

### 4. Workflow ID Limitation
**Issue:** Workflow created in Agent Builder can only be accessed via ChatKit Sessions API

**Impact:**
- Cannot call Agent Builder workflow from standard Responses API
- Custom prompts, knowledge bases, and tools in workflow are locked to ChatKit
- No API to "export" or "run" workflow logic outside ChatKit

---

## What Worked

### ✅ ChatKit Sessions Backend (Google Apps Script)
- Successfully created ChatKit sessions via `/v1/chatkit/sessions`
- Backend can mint `client_secret` tokens
- Google Apps Script works fine as a token server

**Test Results:**
```
Session created successfully
Client Secret: ek_68f2dd90...
```

### ✅ Custom Chat UI (Google Apps Script)
- Built A8ProjectSearch-style chat interface
- Works perfectly in Google Apps Script
- Supports markdown, message bubbles, conversation history

### ✅ Direct Responses API (Google Apps Script)
- Can call `/v1/responses` without workflow
- Works for general ChatGPT-style conversations
- Cannot access Agent Builder workflow features

---

## Technical Limitations Discovered

### Google Apps Script HtmlService
| Feature | Supported? | Notes |
|---------|-----------|-------|
| Standard `<script>` tags | ✅ Yes | Can load external scripts |
| ES Modules (`type="module"`) | ⚠️ Partial | Imports work but APIs may be blocked |
| Custom Elements API | ❌ No | Web components cannot register |
| Shadow DOM | ❌ No | Required by many web components |
| Modern browser APIs | ⚠️ Limited | Many APIs restricted in sandbox |
| External CDN resources | ✅ Yes | Can load from CDN (if not blocked by CSP) |

### OpenAI ChatKit
| Feature | Requirement | Works in GAS? |
|---------|------------|---------------|
| ChatKit web component | Custom Elements API | ❌ No |
| ChatKit Sessions API | Server-side only | ✅ Yes |
| Workflow execution | ChatKit web component | ❌ No |
| Agent Builder workflows | ChatKit Sessions + UI | ❌ No |

### OpenAI Responses API
| Feature | Supported? | Notes |
|---------|-----------|-------|
| Basic chat completion | ✅ Yes | Works without workflow |
| Streaming | ⚠️ Partial | GAS has execution time limits |
| Tools/functions | ✅ Yes | Can define custom tools |
| Workflow parameter | ❌ No | Not accepted by API |
| Thread continuity | ✅ Yes | Via `previous_response_id` or custom thread tracking |

---

## Architectural Insights

### ChatKit's Design Philosophy
ChatKit is built for **standard web hosting** scenarios:
- React/Vue/vanilla JS apps
- Vercel, Netlify, AWS, etc.
- Full browser environment
- No sandboxing restrictions

### Google Apps Script's Design Philosophy
Google Apps Script is designed for **lightweight server-side utilities**:
- Simple web UIs served via HtmlService
- Sandboxed for security (restricted JavaScript)
- Integrated with Google Workspace
- Not meant for complex client-side frameworks

### The Mismatch
These two philosophies are fundamentally incompatible:
- ChatKit needs modern web APIs → GAS restricts them
- ChatKit uses web components → GAS sandbox blocks registration
- ChatKit expects full browser → GAS provides limited iframe

---

## Alternative Approaches

### Option 1: Custom Chat UI + Direct Responses API ⭐ Recommended
**Pros:**
- Works 100% in Google Apps Script
- Full control over UI/UX
- Can use standard Responses API
- Similar to A8ProjectSearch (proven pattern)

**Cons:**
- Cannot use Agent Builder workflow
- Must define prompts/tools manually in code
- Lose workflow visual editor benefits

**Implementation:**
- Use `DeliveryAssistant.html` (custom chat UI)
- Call `/v1/responses` with custom system prompt
- Track threads manually via `previous_response_id`

### Option 2: Host ChatKit Frontend Elsewhere
**Pros:**
- Can use Agent Builder workflow
- Gets ChatKit's full feature set
- Professional UI out of the box

**Cons:**
- Requires separate hosting (Vercel, Netlify, etc.)
- More complex deployment
- Google Apps Script only used for token minting

**Architecture:**
```
┌─────────────────┐
│ Vercel/Netlify  │ ← ChatKit web component
│  (Frontend)     │
└────────┬────────┘
         │
         │ getClientSecret()
         ▼
┌─────────────────┐
│ Google Apps     │ ← Creates ChatKit sessions
│ Script (Token   │    Returns client_secret
│ Server)         │
└─────────────────┘
```

### Option 3: Manually Rebuild Agent Logic
**Pros:**
- Full control
- Works in Google Apps Script
- Can customize behavior

**Cons:**
- Time-consuming
- Must manually code all workflow logic
- Loses visual workflow editor
- Harder to maintain

**Implementation:**
- Extract prompts from Agent Builder
- Manually code tool functions
- Attach knowledge bases via file_search tool
- Build custom orchestration logic

### Option 4: Use Different Tool Platform
**Pros:**
- Might have better GAS compatibility
- Different feature sets

**Cons:**
- Sunk cost in Agent Builder
- Learning curve for new platform
- May have same restrictions

**Alternatives:**
- Anthropic Claude (direct API)
- LangChain (self-hosted)
- Flowise (visual builder, self-hosted)

---

## Recommendations

### For This Project (Delivery Assistant)

**Short-term (Today):**
1. **Use Custom Chat UI + Responses API** (Option 1)
2. Copy your Agent Builder workflow prompts into the code
3. Manually define any tools/functions needed
4. Launch with basic functionality

**Medium-term (Next Sprint):**
1. Evaluate if Agent Builder features are critical
2. If yes → Consider hosting frontend on Vercel (Option 2)
3. If no → Continue refining custom implementation

### For Future Projects

**When to use ChatKit:**
- ✅ You control the hosting environment (Vercel, AWS, etc.)
- ✅ Need Agent Builder workflows
- ✅ Want pre-built UI components
- ❌ **NOT** when using Google Apps Script HtmlService

**When to use Google Apps Script:**
- ✅ Building internal tools for Google Workspace
- ✅ Need tight Sheets/Docs/Drive integration
- ✅ Want zero-infrastructure deployment
- ❌ **NOT** when you need modern web component frameworks

**When to use Responses API directly:**
- ✅ Simple chat implementations
- ✅ Custom UI requirements
- ✅ No need for Agent Builder workflows
- ✅ Want full control over conversation flow

---

## Code Artifacts Created

### Files We Built (Useful for Future)
1. **DeliveryAssistant.html** - Custom chat UI (✅ Works in GAS)
2. **DeliveryAssistant.gs** - Backend with session creation (⚠️ Sessions work, but UI doesn't)
3. **Code.gs** - Routing for Delivery Assistant (✅ Works)

### What to Keep
- Custom chat UI pattern from `DeliveryAssistant.html`
- Backend structure for API calls
- Session/thread management patterns

### What to Discard
- ChatKit web component integration attempts
- ES module loading workarounds
- Workflow parameter in Responses API calls

---

## Key Takeaways

### Technical Lessons
1. **Test environment compatibility early** - Don't assume web components work everywhere
2. **Read API docs carefully** - ChatKit Sessions ≠ Responses API
3. **Understand sandbox limitations** - Google Apps Script is restrictive by design
4. **Have a fallback plan** - Custom UI is always an option

### Process Lessons
1. **ChatGPT guidance was helpful** - Correctly identified the environment incompatibility
2. **Incremental testing worked** - We isolated the problem step-by-step
3. **Documentation matters** - Clear error messages helped diagnose issues

### Product Lessons
1. **Agent Builder workflows are locked to ChatKit** - No easy export or API access
2. **ChatKit is opinionated** - Designed for specific hosting environments
3. **Custom solutions have trade-offs** - More work but more control

---

## Questions for Future Consideration

1. **Will OpenAI add Responses API support for workflows?**
   - Would solve the workflow access issue
   - Allow custom UIs with Agent Builder logic

2. **Can Google Apps Script support web components?**
   - Unlikely due to security model
   - Alternative: Proxy through Cloud Functions?

3. **Is there a workflow export/import API?**
   - Currently no public API for this
   - Would enable manual implementation

4. **Should we use a different platform for this use case?**
   - Vercel for frontend?
   - Cloud Run for full control?
   - Keep GAS for Google Workspace integration only?

---

## Next Steps

### Immediate Actions
- [ ] Decide: Custom UI vs. External Hosting
- [ ] If custom UI: Extract workflow prompts from Agent Builder
- [ ] If external: Set up Vercel project for ChatKit frontend

### Documentation Needed
- [ ] Update `DELIVERY_ASSISTANT_SETUP.md` with final approach
- [ ] Document API limitations discovered
- [ ] Create troubleshooting guide for future tools

### Code Cleanup
- [ ] Remove ChatKit web component code (if going custom route)
- [ ] Simplify backend to match chosen approach
- [ ] Update `.claudefiles` with status

---

## Conclusion

ChatKit is a powerful tool for building agent-powered chat interfaces, but it requires a standard web hosting environment. Google Apps Script's security sandbox prevents the web component from registering, making ChatKit incompatible with HtmlService.

**For this project, we recommend:**
- Build a custom chat UI (like A8ProjectSearch)
- Call Responses API directly with custom prompts
- Save Agent Builder workflow knowledge for future projects with proper hosting

**The silver lining:**
- We have a working custom chat UI pattern
- We understand the API landscape better
- We can deliver a functional tool quickly with the custom approach

---

## Resources

### Documentation References
- [ChatKit Documentation](https://platform.openai.com/docs/guides/chatkit)
- [Responses API Docs](https://platform.openai.com/docs/guides/responses)
- [Agent Builder Guide](https://platform.openai.com/docs/guides/agent-builder)
- [Google Apps Script HtmlService](https://developers.google.com/apps-script/guides/html)

### Code Examples
- `A8ProjectSearch.html` - Working custom chat UI pattern
- `DeliveryAssistant.gs` (v1) - ChatKit Sessions backend (works)
- `DeliveryAssistant.html` (final) - Custom chat UI (works)

### Related Issues
- Google Apps Script sandbox restrictions
- Web Components API compatibility
- OpenAI workflow access limitations

---

**Document Version:** 1.0
**Last Updated:** 2025-01-17
**Status:** Complete - Ready for decision

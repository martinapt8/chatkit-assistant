# ChatKit Assistant

A proof-of-concept chat interface powered by OpenAI's ChatKit and Agent Builder, hosted on GitHub Pages with a Google Apps Script backend.

## Live Demo

🔗 **[Launch ChatKit Assistant](https://martinapt8.github.io/chatkit-assistant/)**

## Architecture

- **Frontend**: GitHub Pages (this repository)
- **Backend**: Google Apps Script (token server)
- **AI**: OpenAI ChatKit + Agent Builder workflow

## Features

- Clean, responsive chat interface
- Powered by OpenAI Agent Builder workflows
- Secure token-based authentication
- No server infrastructure required

## How It Works

1. Frontend requests a session token from Google Apps Script backend
2. Backend creates a ChatKit session with OpenAI API
3. Frontend receives `client_secret` and initializes ChatKit
4. User interacts with the Agent Builder workflow through the chat interface

## Technologies

- [OpenAI ChatKit](https://platform.openai.com/docs/guides/chatkit)
- Google Apps Script
- GitHub Pages
- Vanilla JavaScript

---

**Built by Aptitude 8**

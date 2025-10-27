// Vercel Serverless Function for ChatKit Session Creation
// This replaces Google Apps Script backend

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('[ChatKit] Creating new session...');

    // Get configuration from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    const workflowId = process.env.CHATKIT_WORKFLOW_ID;

    // Validate configuration
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    if (!workflowId) {
      throw new Error('CHATKIT_WORKFLOW_ID not configured');
    }

    console.log('[ChatKit] Using workflow ID:', workflowId);

    // Call OpenAI ChatKit Sessions API
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow: {
          id: workflowId
        },
        user: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        chatkit_configuration: {
          file_upload: {
            enabled: true
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || 'Unknown API error';
      throw new Error(`OpenAI API Error (${response.status}): ${errorMsg}`);
    }

    if (!data.client_secret) {
      throw new Error('No client_secret in API response');
    }

    console.log('[ChatKit] Session created successfully');

    // Return success response
    return res.status(200).json({
      success: true,
      client_secret: data.client_secret,
      session_id: data.id || null
    });

  } catch (error) {
    console.error('[ChatKit] Error:', error.message);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

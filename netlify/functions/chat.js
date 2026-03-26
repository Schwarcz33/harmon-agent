exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return { statusCode: 500, headers, body: '{"error":"GROQ_API_KEY not configured"}' };

  try {
    const { messages, model, max_tokens, temperature } = JSON.parse(event.body);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        messages,
        max_tokens: Math.min(max_tokens || 400, 600),
        temperature: temperature || 0.7
      })
    });
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

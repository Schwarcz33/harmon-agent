exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };

  const EL_KEY = process.env.ELEVENLABS_API_KEY;
  if (!EL_KEY) return { statusCode: 500, headers, body: '{"error":"ELEVENLABS_API_KEY not configured"}' };

  try {
    const { text, voiceId } = JSON.parse(event.body);
    const safeText = (text || '').substring(0, 1000);
    const vid = voiceId || 'UgBBYS2sOqTuMpoF3BR0'; // Mark voice

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': EL_KEY },
      body: JSON.stringify({
        text: safeText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: res.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: errText }) };
    }

    const arrayBuf = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString('base64');
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'audio/mpeg' },
      body: base64,
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};

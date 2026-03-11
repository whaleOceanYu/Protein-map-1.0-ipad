const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method Not Allowed' } });
    return;
  }

  const baseUrl =
    process.env.DASHSCOPE_BASE_URL ||
    process.env.VITE_DASHSCOPE_BASE_URL ||
    DEFAULT_BASE_URL;
  const apiUrl = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const forwardedAuth = req.headers.authorization;
  const serverKey =
    process.env.DASHSCOPE_API_KEY || process.env.VITE_DASHSCOPE_API_KEY;
  const authorization =
    forwardedAuth || (serverKey ? `Bearer ${serverKey}` : '');

  if (!authorization) {
    res.status(500).json({
      error: { message: 'Missing DashScope API key on both client and server.' },
    });
    return;
  }

  try {
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(req.body || {}),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(text);
  } catch (error) {
    res.status(502).json({
      error: {
        message: error instanceof Error ? error.message : 'Upstream request failed',
      },
    });
  }
}

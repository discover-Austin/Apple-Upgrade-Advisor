export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { product, device, usage } = req.body;

  const prompt = `You are a direct, no-nonsense Apple product advisor. Should this person buy the ${product}?
Current device: ${device || 'not specified'}
Main uses: ${usage || 'general use'}

Format your response EXACTLY like this — no extra text:

VERDICT: [UPGRADE NOW / WAIT / SKIP IT]

WHY: [2-3 direct sentences on the main reason]

YOU'LL GAIN:
- [specific gain 1]
- [specific gain 2]
- [specific gain 3]

WATCH OUT:
- [honest caveat 1]
- [honest caveat 2]

Be specific to their device and use case. No fluff. No markdown formatting.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
        })
      }
    );

    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

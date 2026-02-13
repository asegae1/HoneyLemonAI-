export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt, image } = req.body;

  try {
    if (image) {
      // --- Gemini 1.5 Flash (画像認識モード) ---
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt || "このファイルを解析してください。" },
              { inline_data: { mime_type: "image/png", data: image.split(',')[1] } }
            ]
          }]
        })
      });
      const data = await response.json();
      return res.status(200).json({ content: data.candidates[0].content.parts[0].text });
    } else {
      // --- Groq Llama 3.3 (爆速テキストモード) ---
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      return res.status(200).json({ content: data.choices[0].message.content });
    }
  } catch (error) {
    res.status(500).json({ error: "AIが少しお疲れのようです。キー設定を再確認してください。" });
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { prompt } = req.body;

  try {
    // 1. Groqでプロンプトを英語に最適化
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: "Create a short English image prompt. Only output the prompt." }, { role: "user", content: prompt }]
      })
    });
    const groqData = await groqRes.json();
    const englishPrompt = groqData.choices[0].message.content.trim();

    // 2. Hugging Faceから画像バイナリを直接取得
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: englishPrompt }),
      }
    );

    if (!hfRes.ok) throw new Error(`HF API Error: ${hfRes.status}`);

    // 画像をBase64形式に変換
    const buffer = await hfRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    res.status(200).json({ 
      image: `data:image/jpeg;base64,${base64Image}`, 
      prompt: englishPrompt 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

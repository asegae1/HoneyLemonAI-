module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt, model, width = 512, height = 512 } = req.body;

  try {
    // 1. 日本語を画像用英語プロンプトに変換 (Groqを使用)
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // 翻訳は高速モデルで十分
        messages: [
          { role: "system", content: "You are a prompt engineer. Convert the user's input into a detailed English prompt for image generation. Output ONLY the English prompt. No explanations." },
          { role: "user", content: prompt }
        ]
      })
    });

    const groqData = await groqRes.json();
    const englishPrompt = groqData.choices[0].message.content.trim();

    // 2. Pollinations.ai の URL を構築
    // パラメータ: seed(ランダム性), nologo(ロゴ消し)
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    res.status(200).json({ url: imageUrl, prompt: englishPrompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt, systemPrompt, model, maxChars, rateLimit } = req.body;

  // 1〜500文字の制限をプロンプトで強制
  const charLimit = Math.max(1, Math.min(500, maxChars || 100));
  
  // 隠し性格：コードに強く、不自然な英語（眠iness等）を禁止
  const hiddenBasePrompt = `あなたは優秀なエンジニア兼、爽やかな知性を持つAIです。
【絶対ルール】
1. 回答は句読点を含め、必ず「${charLimit}文字以内」で完結させてください。
2. 日本語と英語が混ざった不自然な表現は厳禁です。
3. コードを書く際は解説を最小限にし、コードの正確性を優先してください。`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        max_tokens: 1000, // 文字数制限はプロンプト側で行うため余裕を持たせる
        messages: [
          { role: "system", content: `${hiddenBasePrompt}\nユーザー設定: ${systemPrompt}` },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt, systemPrompt, model, maxChars, tool } = req.body;
  const charLimit = Math.max(1, Math.min(500, maxChars || 100));

  // ツールによって「隠し性格（行動）」を分岐
  let hiddenBasePrompt = "";
  if (tool === "coder") {
    hiddenBasePrompt = `あなたは超一流のシニアエンジニアです。
【絶対ルール】
1. 余計な挨拶や解説は省き、実行可能なコードを最優先で出力してください。
2. 回答は必ず「${charLimit}文字以内」に収めてください。
3. コードの正確性と効率性に命をかけてください。`;
  } else {
    hiddenBasePrompt = `あなたは爽やかで知的な、聞き上手なAIです。
【絶対ルール】
1. ユーザーとの対話を楽しみ、親しみやすく自然な日本語で回答してください。
2. 「${charLimit}文字以内」で簡潔に、かつ温かみのある返答を心がけてください。
3. 不自然な英語混じりの表現は避けてください。`;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
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

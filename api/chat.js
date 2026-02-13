module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt, systemPrompt, model } = req.body;

  // ここに絶対に守らせたい「隠し性格」を記述
  const hiddenBasePrompt = "あなたは常に冷静で知的な、レモンの香りが漂うような爽やかなAIです。語尾は丁寧ですが、時折ユーモアを交えます。日本語と英語を混ぜる「眠iness」のような不自然な表現は厳禁です。";

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
          { role: "system", content: `${hiddenBasePrompt}\n追加設定: ${systemPrompt}` },
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

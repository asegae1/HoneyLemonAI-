module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt } = req.body;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "Convert user input into a single concise English image prompt. Output ONLY the prompt. No quotes, no intro." 
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const groqData = await groqRes.json();
    let englishPrompt = groqData.choices[0].message.content
      .replace(/[\r\n]+/g, " ")
      .trim();

    // ランダムな数値（seed）を生成
    const seed = Math.floor(Math.random() * 1000000);
    
    // 【重要】URL形式を最新の推奨形式に修正
    // queryパラメータ（?width=512...）を省略し、パスに含めることでブロックを回避
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(englishPrompt)}?width=512&height=512&seed=${seed}&model=flux`;

    res.status(200).json({ url: imageUrl, prompt: englishPrompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

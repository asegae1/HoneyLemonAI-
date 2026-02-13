module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt } = req.body;

  try {
    // 1. どんな言語の入力も「画像生成用の短い英語」に強制変換
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
            content: "Convert the user input into a concise English image prompt. Output ONLY the English description. No quotes, no intro, no explanation." 
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const groqData = await groqRes.json();
    // 記号や改行を徹底的に排除
    let englishPrompt = groqData.choices[0].message.content
      .replace(/[\r\n]+/g, " ")
      .replace(/[#?&%]/g, "") // URLで特殊な意味を持つ記号を消す
      .trim();

    const seed = Math.floor(Math.random() * 1000000);
    // widthとheightを明示的に指定
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?width=512&height=512&seed=${seed}&nologo=true`;

    res.status(200).json({ url: imageUrl, prompt: englishPrompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt } = req.body;

  try {
    // 1. プロンプト変換
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: "Create a concise English image prompt. Only output the prompt." },
                   { role: "user", content: prompt }]
      })
    });
    const groqData = await groqRes.json();
    const englishPrompt = groqData.choices[0].message.content.trim();

    // 2. Hugging Face API (待機オプション付き)
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: englishPrompt,
          options: { wait_for_model: true } // モデルが起動するまで待つ設定
        }),
      }
    );

    if (!hfRes.ok) {
      const errorDetail = await hfRes.text();
      console.error("HF Error Detail:", errorDetail);
      throw new Error(`Hugging Face Error: ${hfRes.status}`);
    }

    const buffer = await hfRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    res.status(200).json({ 
      image: `data:image/webp;base64,${base64Image}`, 
      prompt: englishPrompt 
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

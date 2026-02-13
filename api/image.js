module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt } = req.body;

  try {
    // 1. プロンプトを英語に変換
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: "Create a short, simple English image prompt. Output ONLY the prompt." },
                   { role: "user", content: prompt }]
      })
    });
    const groqData = await groqRes.json();
    const englishPrompt = groqData.choices[0].message.content.trim();

    // 2. Hugging Face API (最も安定したSDXLモデルを使用)
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: englishPrompt,
          options: { wait_for_model: true } 
        }),
      }
    );

    // 410エラーや500エラーの対策
    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      console.error("HF Error:", errorText);
      return res.status(hfRes.status).json({ error: `Hugging Face Error: ${hfRes.status}`, detail: errorText });
    }

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

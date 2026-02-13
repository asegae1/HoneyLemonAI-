module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { prompt } = req.body;

  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfRes.ok) throw new Error(`HF API Error: ${hfRes.status}`);

    const buffer = await hfRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    // 画像データそのものをJSONで返す
    res.status(200).json({ 
      image: `data:image/jpeg;base64,${base64Image}`, 
      prompt: prompt 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

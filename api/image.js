module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt } = req.body;

  try {
    // ランダムな種（seed）を生成して、毎回違う画像が出るようにする
    const seed = Math.floor(Math.random() * 999999);
    
    // Pollinations.ai の安定したURL形式を構築
    // プロンプトは日本語のままでも Pollinations 側が自動で解釈してくれます
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true`;

    res.status(200).json({ url: imageUrl, prompt: prompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

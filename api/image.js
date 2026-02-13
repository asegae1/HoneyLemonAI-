module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { prompt } = req.body;
  try {
    const seed = Math.floor(Math.random() * 999999);
    // サーバーで画像を生成せず、URLだけを作る
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&model=flux`;
    res.status(200).json({ url: imageUrl, prompt: prompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

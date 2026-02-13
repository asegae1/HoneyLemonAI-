module.exports = async (req, res) => {
  const { prompt } = req.body;
  const seed = Math.floor(Math.random() * 999999);
  // サーバーでは何もしない。住所（URL）だけを教える。
  const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}`;
  res.status(200).json({ url });
};

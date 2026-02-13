export default async function handler(req, res) {
  // 1. 起動ログ（これがログに出れば、ファイル自体は読み込めています）
  console.log("API起動: ", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  console.log("受け取ったプロンプト: ", prompt);

  // 2. 環境変数のチェック
  if (!process.env.HF_TOKEN) {
    console.error("エラー: HF_TOKENが設定されていません");
    return res.status(500).json({ error: 'VercelのSettingsでHF_TOKENを設定してください' });
  }

  try {
    // 3. Hugging Faceへの通信
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`, 
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    console.log("HF応答ステータス: ", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HFエラー詳細: ", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    console.log("画像変換成功");
    res.status(200).json({ image: `data:image/jpeg;base64,${base64Image}` });

  } catch (error) {
    console.error("キャッチしたエラー: ", error.message);
    res.status(500).json({ error: error.message });
  }
}

// api/image.js の該当箇所を修正
const groqData = await groqRes.json();
// 回答から改行や余計な空白を徹底的に取り除く
let englishPrompt = groqData.choices[0].message.content
  .replace(/[\r\n]+/g, " ") // 改行をスペースに
  .replace(/["']/g, "")     // 引用符を削除
  .trim();

// デバッグ用にコンソールに出力（VercelのLogsで確認可能）
console.log("Generated Prompt:", englishPrompt);

const seed = Math.floor(Math.random() * 1000000);
// 念のためURLエンコードを二重チェック
const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

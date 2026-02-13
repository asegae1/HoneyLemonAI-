// index.html の send 関数の中身をこれに差し替えてください
async function send() {
  const input = document.getElementById('input');
  const text = input.value.trim();
  const mode = document.getElementById('mode').value;
  
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';
  
  lastSent = Date.now();
  updateTimer();
  const status = document.getElementById('status');
  status.innerText = "GENERATING...";

  try {
    if (mode === 'image') {
      // --- API（サーバー）を通さず、直接URLを作る ---
      const seed = Math.floor(Math.random() * 1000000);
      // Pollinations.ai の直通URL (プロンプトは日本語でもAIが解釈してくれます)
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(text)}?width=512&height=512&seed=${seed}&nologo=true`;
      
      // 画像を表示
      addImageMessage(imageUrl, text);
    } else {
      // 会話やコードは今まで通り api/chat を叩く
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await response.json();
      addMessage(data.choices[0].message.content, 'ai');
    }
  } catch (e) {
    addMessage("エラーが発生しました。時間を置いて試してください。", 'ai');
  } finally {
    status.innerText = "SYSTEM READY";
  }
}

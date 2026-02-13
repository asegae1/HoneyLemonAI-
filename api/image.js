async function send() {
  const input = document.getElementById('input');
  const text = input.value.trim();
  const mode = document.getElementById('mode').value;
  
  if (!text) return;

  // ユーザーのメッセージを表示
  addMessage(text, 'user');
  input.value = '';
  
  // 送信制限（タイマー）の開始
  lastSent = Date.now();
  updateTimer();
  
  const status = document.getElementById('status');
  status.innerText = mode === 'image' ? "GENERATING IMAGE..." : "THINKING...";
  status.classList.add('loading-dots');

  try {
    if (mode === 'image') {
      // --- 【最強プラン】APIを通さず、Pollinations.aiへ直結！ ---
      // プロンプトにランダムな種(seed)を混ぜて、毎回違う絵が出るようにします
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(text)}?width=512&height=512&seed=${seed}&nologo=true`;
      
      // APIの返答を待たずに、すぐに画像を表示エリアに出します
      addImageMessage(imageUrl, text);
      
    } else {
      // 会話とコード作成は、安定している api/chat.js をそのまま使います
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, tool: mode })
      });
      const data = await response.json();
      addMessage(data.choices[0].message.content, 'ai');
    }
  } catch (e) {
    addMessage("通信エラーが発生しました。時間を置いて試してください。", 'ai');
  } finally {
    status.innerText = "SYSTEM READY";
    status.classList.remove('loading-dots');
  }
}

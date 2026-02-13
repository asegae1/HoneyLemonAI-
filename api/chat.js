async function send() {
  const p = document.getElementById('input').value;
  const out = document.getElementById('out');
  out.innerText = "考え中...";

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: p })
    });
    
    const data = await res.json();

    // エラーメッセージが返ってきた場合に表示する
    if (data.error) {
      out.innerText = "Error: " + data.error.message;
      return;
    }

    out.innerText = data.choices[0].message.content;
  } catch (e) {
    out.innerText = "通信エラーが発生しました。";
    console.error(e);
  }
}

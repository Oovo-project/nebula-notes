const recordButton = document.getElementById("recordButton");
const recordingStatus = document.getElementById("recordingStatus");
const listeningText = document.getElementById("listeningText");
const waves = document.getElementById("waves");
const cardsRow = document.getElementById("cardsRow");
const footerText = document.getElementById("footerText");

let isRecording = false;
let timerId = null;
let elapsed = 0;

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function setIdleState() {
  waves.classList.remove("active");
  listeningText.textContent = "READY";
  footerText.textContent = "録音ボタンを押して新しいメモを作成できます";
  recordingStatus.textContent = "待機中... 00:00";
}

function setRecordingState() {
  waves.classList.add("active");
  listeningText.textContent = "LISTENING...";
  footerText.textContent = "録音中です。もう一度押すと保存します。";
  recordingStatus.textContent = `録音中... ${formatTime(elapsed)}`;
}

function appendMemoCard(durationSeconds) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const card = document.createElement("article");
  card.className = "memo-card";
  card.innerHTML = `
    <div class="card-top">
      <span class="badge idea">新規メモ</span>
      <time>${hh}:${mm}</time>
    </div>
    <h3>録音メモ ${hh}:${mm}</h3>
    <p>録音時間: ${formatTime(durationSeconds)}。ここに音声認識テキストや要約を表示できます。</p>
  `;
  cardsRow.prepend(card);
}

function startRecording() {
  isRecording = true;
  elapsed = 0;
  setRecordingState();
  timerId = setInterval(() => {
    elapsed += 1;
    recordingStatus.textContent = `録音中... ${formatTime(elapsed)}`;
  }, 1000);
}

function stopRecording() {
  isRecording = false;
  clearInterval(timerId);
  timerId = null;
  appendMemoCard(elapsed);
  setIdleState();
}

recordButton.addEventListener("click", () => {
  if (!isRecording) {
    startRecording();
    return;
  }
  stopRecording();
});

setIdleState();

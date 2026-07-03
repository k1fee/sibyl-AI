// ── Sibyl App ──
// Uses the Anthropic API via the proxy already configured.

// Points to the local proxy (extras/proxy.js) which adds your API key server-side.
// Change to '/v1/messages' if running via the proxy on the same port.
const API_URL = '/v1/messages';
const MODEL   = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are Sibyl — an oracular AI assistant with a poetic, thoughtful voice. 
You speak with clarity and depth. You are not cold or robotic; you are warm, curious, and occasionally 
lyrical. You never pretend to be all-knowing, but you always try to illuminate. You do not lecture; 
you converse. Keep responses focused and well-structured. Use markdown when helpful (lists, bold, code). 
Your name comes from the ancient oracles who could perceive what others could not.`;

// ── State ──
let conversations = JSON.parse(localStorage.getItem('sibyl_convos') || '[]');
let currentId = null;

// ── DOM refs ──
const welcomeEl    = document.getElementById('welcome');
const messagesEl   = document.getElementById('messages');
const inputEl      = document.getElementById('userInput');
const sendBtn      = document.getElementById('sendBtn');
const historyList  = document.getElementById('historyList');
const newChatBtn   = document.getElementById('newChatBtn');

// ── Init ──
renderHistory();

// ── New chat ──
newChatBtn.addEventListener('click', () => startNewChat());

function startNewChat() {
  currentId = null;
  messagesEl.innerHTML = '';
  welcomeEl.classList.remove('hidden');
  renderHistory();
  inputEl.focus();
}

// ── Starter prompts ──
document.querySelectorAll('.starter').forEach(btn => {
  btn.addEventListener('click', () => {
    inputEl.value = btn.dataset.prompt;
    adjustTextarea();
    sendBtn.disabled = false;
    send();
  });
});

// ── Input handling ──
inputEl.addEventListener('input', () => {
  adjustTextarea();
  sendBtn.disabled = inputEl.value.trim().length === 0;
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) send();
  }
});

function adjustTextarea() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + 'px';
}

// ── Send ──
sendBtn.addEventListener('click', send);

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;

  // Hide welcome, clear input
  welcomeEl.classList.add('hidden');
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;

  // Get or create conversation
  if (!currentId) {
    currentId = Date.now().toString();
    conversations.unshift({
      id: currentId,
      title: truncate(text, 36),
      messages: [],
      created: Date.now()
    });
  }

  const convo = conversations.find(c => c.id === currentId);
  convo.messages.push({ role: 'user', content: text });
  saveConvos();
  renderHistory();

  // Render user message
  appendMessage('user', text);

  // Thinking indicator
  const thinkingId = appendThinking();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: convo.messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.map(b => b.text || '').join('') || '';

    removeThinking(thinkingId);
    convo.messages.push({ role: 'assistant', content: reply });
    saveConvos();
    appendMessage('assistant', reply);

  } catch (err) {
    removeThinking(thinkingId);
    appendMessage('assistant', `*The oracle is silent.* An error occurred: ${err.message}\n\nMake sure your API key is configured in the proxy.`);
  }
}

// ── Render helpers ──
function appendMessage(role, content) {
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  if (role === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = `
      <div class="avatar-glow"></div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="#C9A84C" stroke-width="0.75" opacity="0.5"/>
        <circle cx="8" cy="8" r="2.5" fill="#C9A84C" opacity="0.9"/>
        <circle cx="8" cy="8" r="1" fill="#0E0D14"/>
      </svg>`;
    row.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = renderMarkdown(content);
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  scrollToBottom();
  return row;
}

function appendThinking() {
  const id = 'thinking-' + Date.now();
  const row = document.createElement('div');
  row.className = 'msg-row assistant';
  row.id = id;

  const avatar = document.createElement('div');
  avatar.className = 'avatar thinking';
  avatar.innerHTML = `
    <div class="avatar-glow"></div>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="#C9A84C" stroke-width="0.75" opacity="0.5"/>
      <circle cx="8" cy="8" r="2.5" fill="#C9A84C" opacity="0.9"/>
      <circle cx="8" cy="8" r="1" fill="#0E0D14"/>
    </svg>`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<div class="thinking-dots"><span></span><span></span><span></span></div>`;

  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  scrollToBottom();
  return id;
}

function removeThinking(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── Markdown renderer (lightweight) ──
function renderMarkdown(text) {
  // Escape HTML first
  const escape = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Code blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${escape(code.trim())}</code></pre>`
  );

  // Inline code
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${escape(c)}</code>`);

  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

  // Headers
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Unordered lists
  text = text.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Ordered lists
  text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs (split by double newline)
  const blocks = text.split(/\n\n+/);
  return blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<')) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

// ── Conversation history ──
function renderHistory() {
  historyList.innerHTML = '';
  conversations.slice(0, 20).forEach(convo => {
    const li = document.createElement('li');
    li.className = `history-item${convo.id === currentId ? ' active' : ''}`;
    li.innerHTML = `<span class="history-dot"></span>${escapeHtml(convo.title)}`;
    li.addEventListener('click', () => loadConvo(convo.id));
    historyList.appendChild(li);
  });
}

function loadConvo(id) {
  currentId = id;
  const convo = conversations.find(c => c.id === id);
  if (!convo) return;

  messagesEl.innerHTML = '';
  welcomeEl.classList.add('hidden');

  convo.messages.forEach(msg => appendMessage(msg.role, msg.content));
  renderHistory();
}

function saveConvos() {
  // Keep last 50 conversations, trim message history for storage
  const trimmed = conversations.slice(0, 50);
  try {
    localStorage.setItem('sibyl_convos', JSON.stringify(trimmed));
  } catch (e) {
    // Storage full — remove oldest
    conversations = conversations.slice(0, 20);
    localStorage.setItem('sibyl_convos', JSON.stringify(conversations));
  }
}

// ── Utils ──
function truncate(str, n) {
  return str.length > n ? str.slice(0, n).trim() + '…' : str;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

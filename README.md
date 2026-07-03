# 🔮 Sibyl

> *"Ask anything. The oracle is listening."*

A beautifully designed AI chat assistant powered by Claude. Dark, oracular aesthetic with a clean sidebar, conversation memory, and a thoughtful AI personality named Sibyl.

![Sibyl Screenshot](screenshot.png)

---

## ✨ Features

- **Conversational memory** — full message history sent with every request so Sibyl remembers context
- **Sidebar with history** — past conversations are saved locally and listed in the sidebar
- **Starter prompts** — curated questions to get you going immediately
- **Markdown rendering** — Sibyl's responses render bold, italic, code blocks, lists, and headers
- **Streaming-ready design** — thinking indicator with animated dots while waiting
- **Oracular personality** — custom system prompt gives Sibyl a distinct, poetic voice
- **Responsive** — works on mobile (sidebar collapses)
- **Zero dependencies** — pure HTML, CSS, and JavaScript. No npm, no bundler.

---

## 🚀 Getting started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/sibyl.git
cd sibyl
```

### 2. Add your Anthropic API key

Sibyl calls the Anthropic API directly from the browser. To make this work securely, you need a simple local proxy.

**Option A — Quick local proxy (recommended for dev)**

Install the tiny proxy with Node.js:

```bash
npm install -g anthropic-proxy  # or use the proxy.js included in /extras
node extras/proxy.js
```

Then open `http://localhost:3001` in your browser.

**Option B — Set up a backend**

Deploy a small server (Express, Flask, etc.) that forwards requests to `https://api.anthropic.com/v1/messages` with your API key in the `x-api-key` header, and update the `API_URL` in `app.js`.

> ⚠️ **Never put your API key directly in the frontend code.** It will be visible to anyone who views your source.

### 3. Open it

```bash
# With the proxy running, just visit:
http://localhost:3001

# Or for simple local testing without a proxy, open index.html directly
# (you'll need to set up CORS handling or use a browser extension)
```

---

## 📁 Project structure

```
sibyl/
├── index.html       # Main HTML — layout and structure
├── style.css        # All styles — tokens, layout, components
├── app.js           # All logic — API calls, state, rendering
├── extras/
│   └── proxy.js     # Simple Node.js proxy for local dev
└── README.md
```

---

## 🎨 Design

Sibyl uses a custom design system with a dark indigo-black palette and warm gold accents — evoking the ancient oracles of Delphi. Typography pairs **Cormorant Garamond** (a characterful serif for display moments) with **Inter** (clean sans for the chat UI).

The signature design element is the oracle emblem on the welcome screen: two concentric rotating rings with an eye at the center, backed by a soft pulsing glow. This animation also activates on Sibyl's avatar while she's generating a response.

**Color tokens:**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0E0D14` | Page background |
| `--bg-2` | `#13121C` | Sidebar |
| `--bg-3` | `#1A1927` | Elevated surfaces |
| `--gold` | `#C9A84C` | Accent — brand color |
| `--text-1` | `#F0EDE6` | Primary text |
| `--text-2` | `#9693A0` | Secondary text |

---

## 🔧 Customizing Sibyl's personality

Open `app.js` and find the `SYSTEM_PROMPT` constant at the top. Edit it to change how Sibyl talks, what she focuses on, or give her a completely different name and persona.

```js
const SYSTEM_PROMPT = `You are Sibyl — an oracular AI assistant...`;
```

---

## 🌐 Deploying

Sibyl is three static files — deploy anywhere:

- **GitHub Pages** — push to a `gh-pages` branch or enable Pages in Settings
- **Netlify / Vercel** — drag and drop the folder
- **Any static host** — just upload the files

For production, set up a proper backend proxy to keep your API key secret.

---

## 🤝 Contributing

Pull requests welcome! Ideas for contributions:

- Streaming responses (token-by-token output)
- Export conversation as Markdown
- Themes (light mode, other color palettes)
- Voice input via Web Speech API
- Conversation search


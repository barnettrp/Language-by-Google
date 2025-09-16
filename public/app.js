// app.js (ES module)

// ---------- State ----------
const messages = [];           // chat history
let currentStage = "default";  // you can expand this later
const userSettings = {};       // safe placeholder for now

// Toggle screens
function showScreen(which) {
  const login = document.getElementById("loginScreen");
  const app   = document.getElementById("appScreen");
  if (which === "app") {
    login.classList.add("hidden");
    app.classList.remove("hidden");
  } else {
    app.classList.add("hidden");
    login.classList.remove("hidden");
  }
}

// Render a message bubble
function addMessage(text, role = "ai") {
  const box = document.getElementById("messages");
  const wrapper = document.createElement("div");
  wrapper.className = `mb-3 ${role === "user" ? "text-right" : "text-left"}`;

  const bubble = document.createElement("div");
  bubble.className = `inline-block max-w-[80%] rounded-xl px-3 py-2 ${role === "user"
    ? "bg-ocean-teal text-white"
    : "bg-white border"
  }`;
  bubble.textContent = String(text || "");

  wrapper.appendChild(bubble);
  box.appendChild(wrapper);
  box.scrollTop = box.scrollHeight;
}

// Very lightweight AI manager stub.
// Later, replace this with a *backend* call that uses your real API key server-side.
const AIManager = {
  async getHint(recentMessages, stage, settings) {
    // Simple demo response so the button does something
    // Replace with a fetch to /api/hint when you add a backend (see Step 5).
    await new Promise(r => setTimeout(r, 300)); // tiny pause
    return "Try asking a narrower question, or share what you’ve already tried.";
  }
};

// ------- REQUIRED by your earlier code review: fix the missing function ------
async function handleHintRequest() {
  try {
    const recent = messages.slice(-6); // last messages
    const hint = await AIManager.getHint(recent, currentStage, userSettings);
    addMessage(hint || "Try asking a clarifying question.", "ai");
  } catch (err) {
    console.error("Hint error:", err);
    addMessage("Sorry—couldn't fetch a hint right now.", "ai");
  }
}

// ---------- Wire up UI after DOM is ready ----------
document.addEventListener("DOMContentLoaded", () => {
  // Login
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // For now, we just flip screens (no real auth). You can add Firebase later.
    showScreen("app");
    addMessage("You're logged in. How can I help?", "ai");
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    showScreen("login");
  });

  // Chat send
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    messages.push({ role: "user", content: text });
    addMessage(text, "user");
    userInput.value = "";

    // Simple echo AI
    const reply = `You said: "${text}". (I can be replaced with a real model later.)`;
    messages.push({ role: "ai", content: reply });
    addMessage(reply, "ai");
  });

  // Hint
  const hintBtn = document.getElementById("hintBtn");
  hintBtn.addEventListener("click", () => {
    handleHintRequest();
  });
});

import { useState, useRef, useEffect } from "react";
import chatApi from "../../api/chatApi";
import "./AiChatWidget.css";

function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

const WELCOME_MESSAGE = {
  role: "assistant",
  text: "Welcome! I can help with vehicle-related questions and answer questions about ChitoSpare.\n\nTry asking: \"My vehicle is Hyundai Creta 2022, I hear a clicking sound from the suspension — what could be the issue?\"",
};

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // scroll to latest message whenever the list updates
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await chatApi.ask(text);
      setMessages((prev) => [...prev, { role: "assistant", text: cleanMarkdown(data.reply) }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-widget">
      {/* chat window shown when open */}
      {open && (
        <div className="ai-chat-window" role="dialog" aria-label="ChitoSpare AI assistant">
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">AI</div>
              <div>
                <div className="ai-chat-title">ChitoSpare AI</div>
                <div className="ai-chat-subtitle">Vehicle assistant</div>
              </div>
            </div>
            <button
              className="ai-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ai-message--${msg.role}`}>
                <p className="ai-message-text">{msg.text}</p>
              </div>
            ))}
            {/* typing indicator shown while waiting for response */}
            {loading && (
              <div className="ai-message ai-message--assistant">
                <p className="ai-message-text ai-typing">
                  <span /><span /><span />
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="ai-chat-input-row" onSubmit={handleSend}>
            <input
              className="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your vehicle or ChitoSpare..."
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="ai-chat-send"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* floating trigger button */}
      <button
        className="ai-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open AI assistant"
      >
        AI Chat
      </button>
    </div>
  );
}

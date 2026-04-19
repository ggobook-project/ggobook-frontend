import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function ContentChatbotPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { role: "bot", text: "안녕하세요! 작품에 대해 궁금한 점을 물어보세요. 스포일러 없이 답변해 드릴게요." }
  ])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: "user", text: input }, { role: "bot", text: "현재까지의 내용을 바탕으로 답변드릴게요..." }])
    setInput("")
  }

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "20px 40px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/contents/1")} style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 작품으로</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>작품 AI 챗봇</div>
        </div>
        <div style={{ fontSize: 13, color: c.textSub, marginTop: 4 }}>작품 제목 · 현재까지 읽은 내용 기반 답변</div>
      </div>

      <div style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "24px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "bot" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.primary, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 14 }}>AI</span>
              </div>
            )}
            <div style={{
              maxWidth: "70%", padding: "10px 14px", borderRadius: theme.radius.md,
              background: msg.role === "user" ? c.primary : c.bgWhite,
              color: msg.role === "user" ? "#fff" : c.text,
              border: msg.role === "bot" ? `1px solid ${c.border}` : "none",
              fontSize: 14, lineHeight: 1.6
            }}>{msg.text}</div>
          </div>
        ))}
      </div>

      <div style={{ background: c.bgWhite, borderTop: `1px solid ${c.border}`, padding: "14px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="궁금한 점을 물어보세요..."
            style={{ flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 14px", color: c.text, fontSize: 13, outline: "none" }} />
          <button onClick={handleSend} style={{ padding: "10px 20px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>전송</button>
        </div>
      </div>
    </div>
  )
}
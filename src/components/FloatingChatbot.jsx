import { useState, useRef, useEffect } from "react"
import styles from "../styles/FloatingChatbot.module.css"

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! 꼬북이에요 🐢\n무엇을 도와드릴까요?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "연결에 실패했습니다. LLM 서버가 실행 중인지 확인해주세요." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <img src="/assets/mascot.png" alt="꼬북이" className={styles.headerAvatar} />
              <div>
                <div className={styles.headerName}>꼬북이</div>
                <div className={styles.headerSub}>GGoBook AI 도우미</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? styles.userRow : styles.botRow}>
                {msg.role === "assistant" && (
                  <img src="/assets/mascot.png" alt="꼬북이" className={styles.botAvatar} />
                )}
                <div className={msg.role === "user" ? styles.userBubble : styles.botBubble}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.botRow}>
                <img src="/assets/mascot.png" alt="꼬북이" className={styles.botAvatar} />
                <div className={styles.botBubble}>
                  <span className={styles.typing}><span/><span/><span/></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              disabled={loading}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className={styles.floatBtnWrap}>
        <button className={styles.floatBtn} onClick={() => setIsOpen(v => !v)}>
          <video
            src="/assets/mascot_original3.mp4"
            autoPlay loop muted playsInline
            className={styles.mascotVideo}
          />
        </button>
        <div className={styles.floatLabel}>꼬북이에게 물어보세요</div>
      </div>
    </div>
  )
}

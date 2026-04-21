import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/ContentChatbotPage.module.css"

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
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => navigate("/contents/1")}>← 작품으로</button>
          <div className={styles.headerTitle}>작품 AI 챗봇</div>
        </div>
        <div className={styles.headerSubtitle}>작품 제목 · 현재까지 읽은 내용 기반 답변</div>
      </div>

      <div className={styles.messageList}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.messageRow} ${msg.role === "user" ? styles.messageRowUser : ""}`}>
            {msg.role === "bot" && (
              <div className={styles.botAvatar}>AI</div>
            )}
            <div className={`${styles.bubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleBot}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="궁금한 점을 물어보세요..."
            className={styles.input}
          />
          <button onClick={handleSend} className={styles.sendBtn}>전송</button>
        </div>
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function RelayNovelDetailPage() {
  const navigate = useNavigate()
  const [myText, setMyText] = useState("")
  const entries = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, user: `참여자${i + 1}`, order: i + 1,
    text: `${i + 1}번째 이야기가 이어집니다. 주인공은 새로운 모험을 시작하게 되는데...`,
    date: `2026.04.${10 + i}`
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate("/relay")} style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 목록</button>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>릴레이 소설 제목</div>
        <div style={{ fontSize: 13, color: c.textSub }}>시작: 홍길동 · 참여자 12명 · 이어쓰기 {entries.length}개</div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 40px" }}>
        {entries.map(entry => (
          <div key={entry.id} style={{ padding: 20, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.bgSurface, border: `1px solid ${c.border}` }}></div>
              <span style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{entry.user}</span>
              <span style={{ fontSize: 11, color: c.textMuted }}>· {entry.order}번째 · {entry.date}</span>
            </div>
            <div style={{ fontSize: 14, color: c.text, lineHeight: 1.8 }}>{entry.text}</div>
          </div>
        ))}

        <div style={{ background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 12 }}>이어쓰기</div>
          <textarea value={myText} onChange={e => setMyText(e.target.value)}
            placeholder="이야기를 이어서 써주세요..." rows={5}
            style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 12, color: c.textMuted }}>{myText.length} / 500자</span>
            <button style={{ padding: "9px 24px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>등록</button>
          </div>
        </div>
      </div>
    </div>
  )
}
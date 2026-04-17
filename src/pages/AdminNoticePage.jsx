import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminNoticePage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const notices = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `공지사항 제목 ${i + 1}`, date: `2026.04.${13 - i}`
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>공지사항 관리</div>
            <div style={{ fontSize: 14, color: c.textSub }}>공지사항을 등록하고 관리하세요</div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: "9px 18px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ 공지 등록</button>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        {showForm && (
          <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 24, marginBottom: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>제목</div>
              <input placeholder="공지 제목 입력" style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>내용</div>
              <textarea rows={4} placeholder="공지 내용 입력" style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 13, cursor: "pointer" }}>취소</button>
              <button style={{ flex: 2, padding: 10, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>등록</button>
            </div>
          </div>
        )}
        {notices.map(n => (
          <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: c.text, marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{n.date}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 12px", background: "none", border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer" }}>수정</button>
              <button style={{ padding: "6px 12px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, cursor: "pointer" }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
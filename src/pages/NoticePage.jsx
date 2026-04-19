import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function NoticePage() {
  const navigate = useNavigate()
  const notices = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `공지사항 제목 ${i + 1}`, date: `2026.04.${13 - i}`,
    isPinned: i === 0
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>공지사항</div>
        <div style={{ fontSize: 14, color: c.textSub }}>꼬북의 새로운 소식을 확인하세요</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        {notices.map(n => (
          <div key={n.id} onClick={() => navigate("/notices/1")} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 20px", background: n.isPinned ? "#E3F2FD" : c.bgWhite,
            borderRadius: theme.radius.md, border: `1px solid ${n.isPinned ? c.primary : c.border}`,
            marginBottom: 8, cursor: "pointer"
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {n.isPinned && <span style={{ fontSize: 11, padding: "2px 7px", background: c.primary, color: "#fff", borderRadius: theme.radius.sm, fontWeight: 500 }}>공지</span>}
              <span style={{ fontSize: 14, color: c.text, fontWeight: n.isPinned ? 600 : 400 }}>{n.title}</span>
            </div>
            <span style={{ fontSize: 12, color: c.textMuted }}>{n.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function OwnedContentPage() {
  const navigate = useNavigate()
  const items = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `소장 작품 ${i + 1}`, author: "작가명", episodes: 120, date: "2026.03.15"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>소장한 작품</div>
        <div style={{ fontSize: 14, color: c.textSub }}>구매한 완결 작품 목록</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        {items.map(item => (
          <div key={item.id} onClick={() => navigate("/contents/1")} style={{
            display: "flex", gap: 16, padding: 16, background: c.bgWhite,
            borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10, cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{ width: 60, height: 78, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{item.author} · 전 {item.episodes}화</div>
              <div style={{ fontSize: 11, color: c.textMuted }}>소장일: {item.date}</div>
            </div>
            <span style={{ fontSize: 12, padding: "4px 10px", background: "#E3F2FD", color: c.primary, borderRadius: theme.radius.sm, fontWeight: 500, height: "fit-content" }}>완결</span>
          </div>
        ))}
      </div>
    </div>
  )
}
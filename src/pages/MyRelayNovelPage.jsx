import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function MyRelayNovelPage() {
  const navigate = useNavigate()
  const relays = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`,
    role: i % 2 === 0 ? "시작자" : "참여자",
    entries: i * 3 + 2, date: "2026.04.10"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>내 릴레이 소설</div>
        <div style={{ fontSize: 14, color: c.textSub }}>참여한 릴레이 소설 목록</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        {relays.map(r => (
          <div key={r.id} onClick={() => navigate("/relay")} style={{
            padding: 16, background: c.bgWhite, borderRadius: theme.radius.md,
            border: `1px solid ${c.border}`, marginBottom: 10, cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{r.title}</div>
              <span style={{ fontSize: 11, padding: "2px 8px", background: r.role === "시작자" ? "#E3F2FD" : c.bgSurface, color: r.role === "시작자" ? c.primary : c.textSub, borderRadius: theme.radius.sm, border: `1px solid ${r.role === "시작자" ? c.primary : c.border}` }}>{r.role}</span>
            </div>
            <div style={{ fontSize: 12, color: c.textMuted }}>내 이어쓰기 {r.entries}개 · 참여일: {r.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
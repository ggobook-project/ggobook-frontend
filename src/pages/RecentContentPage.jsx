import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function RecentContentPage() {
  const navigate = useNavigate()
  const items = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, title: `최근 본 작품 ${i + 1}`, author: "작가명",
    lastEpisode: `${i * 3 + 1}화`, date: `${i + 1}시간 전`,
    progress: Math.floor(Math.random() * 80) + 10
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>최근 본 작품</div>
        <div style={{ fontSize: 14, color: c.textSub }}>이어서 읽어보세요</div>
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
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>{item.author} · 마지막: {item.lastEpisode} · {item.date}</div>
              <div style={{ height: 4, background: c.bgSurface, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${item.progress}%`, height: "100%", background: c.primary, borderRadius: 2 }}></div>
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>진행률 {item.progress}%</div>
            </div>
            <button style={{ padding: "7px 14px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 12, cursor: "pointer", height: "fit-content" }}>이어보기</button>
          </div>
        ))}
      </div>
    </div>
  )
}
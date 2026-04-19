import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

const genres = ["전체", "로맨스", "판타지", "무협", "현대", "스릴러", "BL"]
const mockNovels = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1, title: `소설 제목 ${i + 1}`, author: "작가명",
  genre: genres[(i % 6) + 1] || "로맨스",
  status: i % 2 === 0 ? "완결" : "연재중",
  free: i % 3 === 0,
  rating: (4 + Math.random() * 0.9).toFixed(1),
  episodes: Math.floor(Math.random() * 100) + 20
}))

export default function NovelPage() {
  const navigate = useNavigate()
  const [activeGenre, setActiveGenre] = useState("전체")

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>웹소설</div>
        <div style={{ fontSize: 14, color: c.textSub }}>TTS로 들으며 읽는 특별한 경험</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {genres.map(g => (
            <button key={g} onClick={() => setActiveGenre(g)} style={{
              padding: "6px 16px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: activeGenre === g ? c.primary : c.bgWhite,
              color: activeGenre === g ? "#fff" : c.textSub,
              border: `1px solid ${activeGenre === g ? c.primary : c.border}`,
              fontWeight: activeGenre === g ? 500 : 400
            }}>{g}</button>
          ))}
        </div>

        {mockNovels.map(n => (
          <div key={n.id} onClick={() => navigate("/contents/1")} style={{
            display: "flex", gap: 16, padding: 16,
            background: c.bgCard, borderRadius: theme.radius.md,
            border: `1px solid ${c.border}`, marginBottom: 10, cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{ width: 60, height: 78, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 5 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>{n.author} · {n.genre} · 총 {n.episodes}화</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>{n.status}</span>
                {n.free && <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, color: c.free, borderRadius: theme.radius.sm, fontWeight: 500 }}>무료</span>}
                <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>★ {n.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
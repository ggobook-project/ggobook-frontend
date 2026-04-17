import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function RankingPage() {
  const navigate = useNavigate()
  const [type, setType] = useState("인기")
  const [category, setCategory] = useState("전체")
  const items = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1, title: `인기 작품 ${i + 1}`, author: "작가명",
    genre: ["로맨스", "판타지", "무협", "현대"][i % 4],
    likes: (Math.floor(2400 / (i + 1) * 10) / 10) + "k"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>랭킹</div>
        <div style={{ fontSize: 14, color: c.textSub }}>지금 가장 인기있는 작품</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["인기", "신작", "트렌드"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "7px 18px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: type === t ? c.primary : c.bgWhite,
              color: type === t ? "#fff" : c.textSub,
              border: `1px solid ${type === t ? c.primary : c.border}`
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["전체", "웹툰", "웹소설"].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "6px 16px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: category === cat ? c.bgSurface : c.bgWhite,
              color: category === cat ? c.primary : c.textSub,
              border: `1px solid ${category === cat ? c.primary : c.border}`
            }}>{cat}</button>
          ))}
        </div>

        {items.map(item => (
          <div key={item.rank} onClick={() => navigate("/contents/1")} style={{
            display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
            background: c.bgWhite, borderRadius: theme.radius.md,
            border: `1px solid ${c.border}`, marginBottom: 8, cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
          >
            <span style={{ fontSize: 18, fontWeight: item.rank <= 3 ? 700 : 400, color: item.rank <= 3 ? c.primary : c.textMuted, width: 28, textAlign: "center", flexShrink: 0 }}>{item.rank}</span>
            <div style={{ width: 48, height: 62, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{item.author} · {item.genre}</div>
            </div>
            <span style={{ fontSize: 13, color: c.textSub }}>♡ {item.likes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
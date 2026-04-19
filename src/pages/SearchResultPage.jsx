import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function SearchResultPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("전체")
  const results = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `검색 결과 작품 ${i + 1}`, author: "작가명",
    type: i % 2 === 0 ? "웹툰" : "웹소설",
    genre: ["로맨스", "판타지", "무협"][i % 3],
    rating: (4 + Math.random() * 0.9).toFixed(1)
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 16 }}>검색</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 16px" }}>
          <span style={{ color: c.textMuted }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="작품명, 작가명, 태그 검색"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: c.text, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: filter === f ? c.primary : c.bgWhite,
              color: filter === f ? "#fff" : c.textSub,
              border: `1px solid ${filter === f ? c.primary : c.border}`
            }}>{f}</button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 16 }}>검색 결과 {results.length}건</div>
        {results.map(r => (
          <div key={r.id} onClick={() => navigate("/contents/1")} style={{
            display: "flex", gap: 16, padding: 16, background: c.bgWhite,
            borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10, cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{ width: 60, height: 78, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 5 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>{r.author} · {r.genre}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>{r.type}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>★ {r.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function RelayNovelPage() {
  const navigate = useNavigate()
  const [sort, setSort] = useState("최신순")
  const relays = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`, starter: "홍길동",
    participants: i * 3 + 5, entries: i * 10 + 8,
    preview: "어느 날 갑자기 눈을 떴을 때, 나는 낯선 방 안에 있었다. 창문 너머로 보이는 풍경은 내가 알던 세상과 달랐다..."
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>릴레이 소설</div>
            <div style={{ fontSize: 14, color: c.textSub }}>함께 써내려가는 이야기</div>
          </div>
          <button style={{ padding: "10px 20px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ 새 릴레이</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["최신순", "인기순"].map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              padding: "7px 18px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: sort === s ? c.primary : c.bgWhite,
              color: sort === s ? "#fff" : c.textSub,
              border: `1px solid ${sort === s ? c.primary : c.border}`
            }}>{s}</button>
          ))}
        </div>

        {relays.map(r => (
          <div key={r.id} style={{
            padding: 20, marginBottom: 12,
            background: c.bgWhite, border: `1px solid ${c.border}`,
            borderRadius: theme.radius.md, cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 8 }}>{r.title}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: c.textMuted, marginBottom: 10 }}>
              <span>시작: {r.starter}</span>
              <span>참여자 {r.participants}명</span>
              <span>이어쓰기 {r.entries}개</span>
            </div>
            <div style={{ fontSize: 13, color: c.textSub, lineHeight: 1.6, padding: "10px 14px", background: c.bgSurface, borderRadius: theme.radius.sm }}>{r.preview}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
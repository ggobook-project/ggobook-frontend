import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function LikedContentPage() {
  const navigate = useNavigate()
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `찜한 작품 ${i + 1}`, author: "작가명",
    type: i % 2 === 0 ? "웹툰" : "웹소설",
    status: i % 3 === 0 ? "완결" : "연재중"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>찜한 작품</div>
        <div style={{ fontSize: 14, color: c.textSub }}>총 {items.length}개</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => navigate("/contents/1")} style={{ cursor: "pointer" }}>
              <div style={{ aspectRatio: "3/4", background: c.bgSurface, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10, position: "relative" }}>
                <div style={{ position: "absolute", top: 8, right: 8, fontSize: 16, color: c.danger }}>♥</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 4 }}>{item.author}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ fontSize: 11, padding: "2px 7px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>{item.type}</span>
                <span style={{ fontSize: 11, padding: "2px 7px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
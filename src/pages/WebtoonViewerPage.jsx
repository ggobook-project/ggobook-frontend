import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function WebtoonViewerPage() {
  const navigate = useNavigate()
  return (
    <div style={{ background: c.bg, minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: c.bgWhite, borderBottom: `1px solid ${c.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 24px", height: 52
      }}>
        <button onClick={() => navigate("/contents/1")} style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 목록</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>작품명 1화</span>
        <span style={{ fontSize: 13, color: c.textMuted }}>1 / 8</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {[180, 140, 200, 160, 180, 150].map((h, i) => (
          <div key={i} style={{ width: "100%", height: h, background: i % 2 === 0 ? c.bgSurface : c.bgWhite, borderBottom: `1px solid ${c.border}` }}></div>
        ))}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", padding: "16px 24px",
        borderTop: `1px solid ${c.border}`, background: c.bgWhite
      }}>
        <button style={{ background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "9px 20px", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 이전화</button>
        <button onClick={() => navigate("/contents/1")} style={{ background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "9px 20px", color: c.textSub, fontSize: 13, cursor: "pointer" }}>목록</button>
        <button style={{ background: c.primary, border: "none", borderRadius: theme.radius.md, padding: "9px 20px", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>다음화 →</button>
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function NovelViewerPage() {
  const navigate = useNavigate()
  const [playing, setPlaying] = useState(false)
  const paragraphs = [
    "그날의 하늘은 유독 맑았다. 바람 한 점 없이 고요한 오후, 주인공은 창문 너머로 먼 산을 바라보며 생각에 잠겼다.",
    "오래된 편지 한 통이 그의 손 안에서 조용히 떨리고 있었다. 발신인 이름을 확인한 순간, 그의 심장은 잠시 멈추는 것 같았다.",
    "십 년 전 이별 후 단 한 번도 연락이 없었던 그 사람. 지금 이 순간, 무슨 말을 전하려는 것일까.",
  ]

  return (
    <div style={{ background: c.bgWhite, minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: c.bgWhite, borderBottom: `1px solid ${c.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 24px", height: 52
      }}>
        <button onClick={() => navigate("/contents/1")} style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 목록</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>소설 제목 1화</span>
        <button style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer" }}>설정</button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 160px" }}>
        <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 32, textAlign: "center" }}>— 1화 —</div>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 16, color: c.text, lineHeight: 2.0, marginBottom: 28 }}>{p}</p>
        ))}
      </div>

      <div style={{
        position: "sticky", bottom: 0,
        background: c.bgWhite, borderTop: `1px solid ${c.border}`,
        padding: "12px 24px"
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <button onClick={() => setPlaying(!playing)} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: c.primary, border: "none", color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0
            }}>{playing ? "⏸" : "▶"}</button>
            <div style={{ flex: 1, height: 4, background: c.bgSurface, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "35%", height: "100%", background: c.primary, borderRadius: 2 }}></div>
            </div>
            <span style={{ fontSize: 12, color: c.textMuted, whiteSpace: "nowrap" }}>02:14 / 08:30</span>
            <span style={{ fontSize: 12, color: c.textSub, cursor: "pointer", border: `1px solid ${c.border}`, padding: "4px 10px", borderRadius: theme.radius.sm }}>목소리</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={{ background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "8px 20px", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 이전화</button>
            <button style={{ background: c.primary, border: "none", borderRadius: theme.radius.md, padding: "8px 20px", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>다음화 →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function ParallelUniversePage() {
  const navigate = useNavigate()
  const [scenario, setScenario] = useState("")
  const [generated, setGenerated] = useState(false)

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate("/novel/viewer/1")} style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer" }}>← 돌아가기</button>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>평행우주 외전</div>
        <div style={{ fontSize: 14, color: c.textSub }}>AI가 새로운 결말을 만들어 드립니다</div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 6 }}>현재 회차</div>
          <div style={{ fontSize: 13, color: c.textSub, padding: "12px 14px", background: c.bgSurface, borderRadius: theme.radius.md }}>작품 제목 · 3화 기준</div>
        </div>

        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 10 }}>나만의 시나리오</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {["주인공이 다른 선택을 한다면?", "두 주인공이 처음부터 만나지 않았다면?", "악당이 주인공이 된다면?"].map(s => (
              <div key={s} onClick={() => setScenario(s)} style={{
                padding: "10px 14px", borderRadius: theme.radius.md, cursor: "pointer", fontSize: 13,
                background: scenario === s ? "#E3F2FD" : c.bgSurface,
                color: scenario === s ? c.primary : c.text,
                border: `1px solid ${scenario === s ? c.primary : c.border}`
              }}>{s}</div>
            ))}
          </div>
          <textarea value={scenario} onChange={e => setScenario(e.target.value)}
            placeholder="직접 시나리오를 입력하세요..." rows={3}
            style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none" }} />
          <button onClick={() => setGenerated(true)} style={{ width: "100%", marginTop: 12, padding: 12, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>외전 생성하기</button>
        </div>

        {generated && (
          <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.primary}`, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.primary, marginBottom: 14 }}>AI 생성 외전</div>
            <p style={{ fontSize: 14, color: c.text, lineHeight: 1.9 }}>
              만약 그 날 주인공이 다른 선택을 했다면, 이야기는 전혀 다른 방향으로 흘러갔을 것이다. 창문 너머 내리는 빗소리를 들으며...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"

import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminTTSPage() {
  const navigate = useNavigate()
  const voices = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, name: `목소리 ${i + 1}`,
    type: i % 2 === 0 ? "여성" : "남성",
    style: ["차분한", "활발한", "진중한"][i % 3],
    isDefault: i === 0
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>TTS 관리</div>
            <div style={{ fontSize: 14, color: c.textSub }}>TTS 목소리를 관리하세요</div>
          </div>
          <button style={{ padding: "9px 18px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ 목소리 추가</button>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        {voices.map(v => (
          <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${v.isDefault ? c.primary : c.border}`, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.bgSurface, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎙</div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{v.name}</span>
                  {v.isDefault && <span style={{ fontSize: 11, padding: "1px 6px", background: "#E3F2FD", color: c.primary, borderRadius: theme.radius.sm }}>기본</span>}
                </div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{v.type} · {v.style}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 14px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer" }}>미리듣기</button>
              <button style={{ padding: "6px 14px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, cursor: "pointer" }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
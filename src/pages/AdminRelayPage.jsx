import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminRelayPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("릴레이 목록")
  const relays = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`, starter: "홍길동",
    entries: i * 5 + 3, date: "2026.04.10"
  }))
  const topics = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1, title: `관리자 주제 ${i + 1}`, date: "2026.04.01"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>릴레이 소설 관리</div>
        <div style={{ fontSize: 14, color: c.textSub }}>릴레이 소설과 주제를 관리하세요</div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${c.border}`, marginBottom: 20 }}>
          {["릴레이 목록", "주제 관리"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 20px", background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${c.primary}` : "2px solid transparent",
              color: tab === t ? c.primary : c.textSub, fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400
            }}>{t}</button>
          ))}
        </div>

        {tab === "릴레이 목록" && relays.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: c.text, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>시작: {r.starter} · 이어쓰기 {r.entries}개 · {r.date}</div>
            </div>
            <button style={{ padding: "6px 14px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, cursor: "pointer" }}>삭제</button>
          </div>
        ))}

        {tab === "주제 관리" && (
          <>
            <div style={{ background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="새 주제 입력" style={{ flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "9px 12px", color: c.text, fontSize: 13, outline: "none" }} />
                <button style={{ padding: "9px 18px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, cursor: "pointer" }}>등록</button>
              </div>
            </div>
            {topics.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, color: c.text, marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: c.textMuted }}>{t.date}</div>
                </div>
                <button style={{ padding: "6px 14px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, cursor: "pointer" }}>삭제</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
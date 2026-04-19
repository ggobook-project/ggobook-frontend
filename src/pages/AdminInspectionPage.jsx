import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminInspectionPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("전체")
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `작품 제목 ${i + 1}`, author: "작가명",
    type: i % 2 === 0 ? "웹툰" : "웹소설", date: "2026.04.13",
    status: "대기"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>검수 관리</div>
        <div style={{ fontSize: 14, color: c.textSub }}>등록된 작품을 검토하고 승인/반려하세요</div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: filter === f ? c.primary : c.bgWhite,
              color: filter === f ? "#fff" : c.textSub,
              border: `1px solid ${filter === f ? c.primary : c.border}`
            }}>{f}</button>
          ))}
        </div>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 52, height: 68, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{item.author} · {item.type} · {item.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "7px 16px", background: c.success, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>승인</button>
              <button style={{ padding: "7px 16px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, cursor: "pointer" }}>반려</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
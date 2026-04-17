import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminMemberPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const members = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, nickname: `회원${i + 1}`, email: `user${i + 1}@email.com`,
    role: i === 0 ? "관리자" : i === 1 ? "작가" : "일반",
    status: i === 5 ? "정지" : "활성", joinDate: "2026.03.01"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 14 }}>회원 관리</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 16px" }}>
          <span style={{ color: c.textMuted }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="아이디, 닉네임 검색"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: c.text, fontSize: 14 }} />
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.bgSurface, border: `1px solid ${c.border}` }}></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 3 }}>{m.nickname}</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{m.email} · 가입일: {m.joinDate}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>{m.role}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", background: m.status === "활성" ? "#E3F2FD" : "#FFEBEE", color: m.status === "활성" ? c.primary : c.danger, borderRadius: theme.radius.sm }}>{m.status}</span>
              <button style={{ padding: "6px 12px", background: "none", border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer" }}>정지</button>
              <button style={{ padding: "6px 12px", background: "none", border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer" }}>포인트</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
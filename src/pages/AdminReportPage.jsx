import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminReportPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("전체")
  const reports = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, targetType: ["CONTENT", "COMMENT", "RELAY"][i % 3],
    reason: ["욕설/비방", "음란물", "스포일러"][i % 3],
    reporter: `신고자${i + 1}`, date: "2026.04.13", status: "대기"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>신고 관리</div>
        <div style={{ fontSize: 14, color: c.textSub }}>접수된 신고를 처리하세요</div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["전체", "CONTENT", "COMMENT", "RELAY"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: theme.radius.full, fontSize: 12, cursor: "pointer",
              background: filter === f ? c.primary : c.bgWhite,
              color: filter === f ? "#fff" : c.textSub,
              border: `1px solid ${filter === f ? c.primary : c.border}`
            }}>{f}</button>
          ))}
        </div>
        {reports.map(r => (
          <div key={r.id} style={{ padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, padding: "2px 8px", background: "#FFEBEE", color: c.danger, borderRadius: theme.radius.sm }}>{r.targetType}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: c.text }}>{r.reason}</span>
              </div>
              <span style={{ fontSize: 12, color: c.textMuted }}>{r.date}</span>
            </div>
            <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 12 }}>신고자: {r.reporter}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 14px", background: c.danger, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 12, cursor: "pointer" }}>콘텐츠 삭제</button>
              <button style={{ padding: "6px 14px", background: "none", border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer" }}>처리완료</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
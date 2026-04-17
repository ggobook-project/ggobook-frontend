import { useNavigate } from "react-router-dom"

import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminUploadPage() {
  const navigate = useNavigate()
  const items = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, contentTitle: `작품 제목 ${i + 1}`, episodeNum: `${i + 1}화`,
    type: i % 2 === 0 ? "웹툰" : "웹소설",
    status: i % 3 === 0 ? "비공개" : "공개", date: "2026.04.13"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>업로드 관리</div>
        <div style={{ fontSize: 14, color: c.textSub }}>회차 공개/비공개를 관리하세요</div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.contentTitle} · {item.episodeNum}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{item.type} · {item.date}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, padding: "3px 10px", background: item.status === "공개" ? "#E3F2FD" : c.bgSurface, color: item.status === "공개" ? c.primary : c.textMuted, borderRadius: theme.radius.sm, border: `1px solid ${item.status === "공개" ? c.primary : c.border}` }}>{item.status}</span>
              <button style={{ padding: "7px 14px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 12, cursor: "pointer" }}>변경</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
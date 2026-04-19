import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function ContentManagePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("내 작품")
  const myContents = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `내 작품 ${i + 1}`, type: i % 2 === 0 ? "웹툰" : "웹소설",
    episodes: i * 5 + 3, status: i % 3 === 0 ? "검수중" : "연재중"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>작품 관리</div>
            <div style={{ fontSize: 14, color: c.textSub }}>내 작품을 관리하세요</div>
          </div>
          <button onClick={() => navigate("/author/contents/register")} style={{ padding: "10px 20px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ 작품 등록</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${c.border}`, marginBottom: 24 }}>
          {["내 작품", "내 댓글"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 20px", background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${c.primary}` : "2px solid transparent",
              color: tab === t ? c.primary : c.textSub, fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400
            }}>{t}</button>
          ))}
        </div>

        {tab === "내 작품" && myContents.map(item => (
          <div key={item.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: 16, background: c.bgWhite, borderRadius: theme.radius.md,
            border: `1px solid ${c.border}`, marginBottom: 10
          }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 52, height: 68, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{item.type} · 총 {item.episodes}화</div>
                <span style={{ fontSize: 11, padding: "2px 8px", background: item.status === "검수중" ? "#FFF8E1" : c.bgSurface, color: item.status === "검수중" ? c.warning : c.success, borderRadius: theme.radius.sm, border: `1px solid ${item.status === "검수중" ? "#FFE082" : c.border}` }}>{item.status}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("/author/contents/1/episode/register")} style={{ padding: "7px 14px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 12, cursor: "pointer" }}>회차 등록</button>
              <button style={{ padding: "7px 14px", background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer" }}>수정</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
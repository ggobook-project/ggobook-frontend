import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function PointPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("내역")
  const history = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    type: i % 3 === 0 ? "충전" : i % 3 === 1 ? "사용" : "관리자 지급",
    amount: i % 3 === 1 ? -500 : 1000,
    desc: i % 3 === 0 ? "포인트 충전" : i % 3 === 1 ? "작품 소장" : "이벤트 지급",
    date: "2026.04.13"
  }))
  const packages = [
    { point: 1000, price: 1000 }, { point: 3000, price: 2900 },
    { point: 5000, price: 4500 }, { point: 10000, price: 8900 }
  ]

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>포인트</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: c.primary }}>1,200</span>
          <span style={{ fontSize: 16, color: c.textSub }}>P 보유</span>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${c.border}`, marginBottom: 24 }}>
          {["충전", "내역"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 24px", background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${c.primary}` : "2px solid transparent",
              color: tab === t ? c.primary : c.textSub, fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400
            }}>{t}</button>
          ))}
        </div>

        {tab === "충전" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {packages.map(pkg => (
              <div key={pkg.point} style={{
                padding: 20, background: c.bgWhite, borderRadius: theme.radius.md,
                border: `1px solid ${c.border}`, textAlign: "center", cursor: "pointer"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none" }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: c.primary, marginBottom: 4 }}>{pkg.point.toLocaleString()} P</div>
                <div style={{ fontSize: 14, color: c.textSub, marginBottom: 14 }}>{pkg.price.toLocaleString()}원</div>
                <button style={{ width: "100%", padding: 8, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>충전하기</button>
              </div>
            ))}
          </div>
        )}

        {tab === "내역" && history.map(h => (
          <div key={h.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px", background: c.bgWhite, borderRadius: theme.radius.md,
            border: `1px solid ${c.border}`, marginBottom: 8
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 3 }}>{h.desc}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{h.date}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: h.amount > 0 ? c.primary : c.danger }}>
              {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString()} P
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pw, setPw] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: c.bg }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: "40px 36px", boxShadow: "0 4px 24px rgba(33,150,243,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.primary, marginBottom: 8, cursor: "pointer" }} onClick={() => navigate("/")}>꼬북</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 4 }}>비밀번호 재설정</div>
            <div style={{ fontSize: 13, color: c.textSub }}>새로운 비밀번호를 입력해주세요</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>새 비밀번호</div>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="8자 이상"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>비밀번호 확인</div>
            <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="비밀번호 재입력"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button style={{ width: "100%", padding: 12, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>비밀번호 재설정</button>
        </div>
      </div>
    </div>
  )
}
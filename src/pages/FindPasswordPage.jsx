import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
import wave from "../assets/wave.png"
const { colors: c } = theme

export default function FindPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", position: "relative" }}>

      {/* 파도 배경 */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${wave})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.08,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: c.bgWhite, borderRadius: theme.radius.lg,
          border: `1px solid ${c.border}`, padding: "40px 36px",
          boxShadow: "0 4px 24px rgba(33,150,243,0.1)"
        }}>

          {/* 헤더 */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: c.primary, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >GGoBook</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 4 }}>비밀번호 찾기</div>
            <div style={{ fontSize: 13, color: c.textSub }}>가입한 이메일로 재설정 링크를 보내드립니다</div>
          </div>

          {/* 이메일 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>이메일</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 입력"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* 버튼 */}
          <button
            style={{
              width: "100%", padding: 12, background: c.primary,
              border: "none", borderRadius: theme.radius.md,
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              marginBottom: 16, transition: "background 0.2s, transform 0.1s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = c.primaryDark}
            onMouseLeave={e => e.currentTarget.style.background = c.primary}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >재설정 이메일 발송</button>

          {/* 링크 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {[
              { label: "로그인", path: "/login" },
              { label: "아이디 찾기", path: "/find-id" },
            ].map(item => (
              <span key={item.label} onClick={() => navigate(item.path)} style={{
                fontSize: 12, color: c.textMuted, cursor: "pointer", transition: "color 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.color = c.primary}
                onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
              >{item.label}</span>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
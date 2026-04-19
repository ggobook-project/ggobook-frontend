import { useState } from "react"
import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
import wave from "../assets/wave.png"
const { colors: c } = theme

export default function LoginPage() {
  const navigate = useNavigate()
  const [id, setId] = useState("")
  const [pw, setPw] = useState("")

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
          {/* 로고 */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: c.primary, cursor: "pointer" }} onClick={() => navigate("/")}>GGoBook</div>
            <div style={{ fontSize: 14, color: c.textSub }}>계정에 로그인하세요</div>
          </div>

          {/* 아이디 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>아이디</div>
            <input value={id} onChange={e => setId(e.target.value)} placeholder="아이디 입력"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>비밀번호</div>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호 입력"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* 로그인 버튼 */}
          <button style={{
            width: "100%", padding: 12, background: c.primary,
            border: "none", borderRadius: theme.radius.md,
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            marginBottom: 16, transition: "background 0.2s, transform 0.1s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = c.primaryDark}
            onMouseLeave={e => e.currentTarget.style.background = c.primary}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >로그인</button>

          {/* 링크 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 24 }}>
            {[
              { label: "아이디 찾기", path: "/find-id" },
              { label: "비밀번호 찾기", path: "/find-password" },
              { label: "회원가입", path: "/signup" },
            ].map(item => (
              <span key={item.label} onClick={() => navigate(item.path)} style={{
                fontSize: 12, color: c.textMuted, cursor: "pointer", transition: "color 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.color = c.primary}
                onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
              >{item.label}</span>
            ))}
          </div>

          {/* 소셜 로그인 */}
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 20 }}>
            <div style={{ fontSize: 12, color: c.textMuted, textAlign: "center", marginBottom: 14 }}>소셜 로그인</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>

              {/* 카카오 */}
              <button style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#FEE500", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(254,229,0,0.5)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.667 1.667 5 4.167 6.333L5 21l4.833-2.833C10.533 18.389 11.267 18.5 12 18.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                </svg>
              </button>

              {/* 네이버 */}
              <button style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#03C75A", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(3,199,90,0.5)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "Arial" }}>N</span>
              </button>

              {/* 구글 */}
              <button style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#fff", border: `1px solid ${c.border}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)", transition: "transform 0.2s, box-shadow 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
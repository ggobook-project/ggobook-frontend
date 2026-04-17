import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function SignupPage() {
  const navigate = useNavigate()
  const [gender, setGender] = useState("")
  const fields = [
    { label: "아이디", placeholder: "아이디 입력", btn: "중복확인" },
    { label: "비밀번호", placeholder: "8자 이상", type: "password" },
    { label: "비밀번호 확인", placeholder: "비밀번호 재입력", type: "password" },
    { label: "닉네임", placeholder: "닉네임 입력", btn: "중복확인" },
    { label: "이메일", placeholder: "이메일 입력", btn: "인증전송" },
    { label: "인증번호", placeholder: "인증번호 6자리", timer: "02:59" },
  ]

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: c.bg, padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{
          background: c.bgWhite, borderRadius: theme.radius.lg,
          border: `1px solid ${c.border}`, padding: "40px 36px",
          boxShadow: "0 4px 24px rgba(33,150,243,0.1)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: c.primary, cursor: "pointer" }} onClick={() => navigate("/")}>꼬북</div>
            <div style={{ fontSize: 14, color: c.textSub }}>새 계정을 만드세요</div>
          </div>

          {fields.map(f => (
            <div key={f.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>{f.label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type={f.type || "text"} placeholder={f.placeholder}
                  style={{ flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 12px", color: c.text, fontSize: 13, outline: "none" }} />
                {f.btn && <button style={{ padding: "10px 14px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{f.btn}</button>}
                {f.timer && <div style={{ padding: "10px 14px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, whiteSpace: "nowrap" }}>{f.timer}</div>}
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>성별</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["남", "여"].map(g => (
                <button key={g} onClick={() => setGender(g)} style={{
                  flex: 1, padding: 10,
                  background: gender === g ? c.primary : c.bgSurface,
                  border: `1px solid ${gender === g ? c.primary : c.border}`,
                  borderRadius: theme.radius.md,
                  color: gender === g ? "#fff" : c.textSub,
                  fontSize: 13, cursor: "pointer"
                }}>{g}</button>
              ))}
            </div>
          </div>

          <button style={{ width: "100%", padding: 12, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>가입하기</button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <span style={{ fontSize: 13, color: c.textMuted, cursor: "pointer" }} onClick={() => navigate("/login")}>이미 계정이 있으신가요? 로그인</span>
          </div>
        </div>
      </div>
    </div>
  )
}
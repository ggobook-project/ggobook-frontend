import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import theme from "../styles/theme"
import wave from "../assets/wave.png"
const { colors: c } = theme

export default function SignupPage() {
  const navigate = useNavigate()
  const [gender, setGender] = useState("")
  const [idChecked, setIdChecked] = useState(false)
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [timer, setTimer] = useState(179)
  const [timerActive, setTimerActive] = useState(false)
  const [verified, setVerified] = useState(false)
  const intervalRef = useRef(null)

  const [form, setForm] = useState({
    id: "", password: "", passwordConfirm: "",
    nickname: "", email: "", code: ""
  })

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    if (key === "id") setIdChecked(false)
    if (key === "nickname") setNicknameChecked(false)
    if (key === "email") { setEmailSent(false); setVerified(false); setTimer(179); setTimerActive(false) }
  }

  useEffect(() => {
    if (timerActive && timer > 0) {
      intervalRef.current = setInterval(() => setTimer(t => t - 1), 1000)
    } else if (timer === 0) {
      clearInterval(intervalRef.current)
      setTimerActive(false)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerActive, timer])

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const handleSendEmail = () => {
    if (!form.email) return
    setEmailSent(true)
    setTimer(179)
    setTimerActive(true)
    setVerified(false)
  }

  const handleVerify = () => {
    if (form.code.length === 6) setVerified(true)
  }

  const inputStyle = { flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 12px", color: c.text, fontSize: 13, outline: "none" }
  const smallBtnStyle = (active) => ({
    padding: "10px 14px", borderRadius: theme.radius.md,
    fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
    transition: "background 0.2s, color 0.2s",
    background: active ? c.primary : c.bgSurface,
    border: `1px solid ${active ? c.primary : c.border}`,
    color: active ? "#fff" : c.textSub,
  })

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", position: "relative", padding: "40px 24px" }}>

      {/* 파도 배경 */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${wave})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.08, zIndex: 0, pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{
          background: c.bgWhite, borderRadius: theme.radius.lg,
          border: `1px solid ${c.border}`, padding: "40px 36px",
          boxShadow: "0 4px 24px rgba(33,150,243,0.1)"
        }}>
          {/* 헤더 */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: c.primary, cursor: "pointer" }} onClick={() => navigate("/")}>GGoBook</div>
            <div style={{ fontSize: 14, color: c.textSub }}>새 계정을 만드세요</div>
          </div>

          {/* 아이디 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>아이디</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={form.id} onChange={e => set("id", e.target.value)} placeholder="아이디 입력" style={inputStyle} />
              <button
                style={smallBtnStyle(idChecked)}
                onClick={() => { if (form.id) setIdChecked(true) }}
                onMouseEnter={e => { if (!idChecked) e.currentTarget.style.background = "#dbeafe" }}
                onMouseLeave={e => { if (!idChecked) e.currentTarget.style.background = c.bgSurface }}
              >{idChecked ? "✓ 확인됨" : "중복확인"}</button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>비밀번호</div>
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="8자 이상" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>

          {/* 비밀번호 확인 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>비밀번호 확인</div>
            <input type="password" value={form.passwordConfirm} onChange={e => set("passwordConfirm", e.target.value)} placeholder="비밀번호 재입력" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
            {form.passwordConfirm && (
              <div style={{ fontSize: 11, marginTop: 4, color: form.password === form.passwordConfirm ? "#4caf50" : c.danger }}>
                {form.password === form.passwordConfirm ? "✓ 비밀번호가 일치합니다" : "✗ 비밀번호가 일치하지 않습니다"}
              </div>
            )}
          </div>

          {/* 닉네임 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>닉네임</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={form.nickname} onChange={e => set("nickname", e.target.value)} placeholder="닉네임 입력" style={inputStyle} />
              <button
                style={smallBtnStyle(nicknameChecked)}
                onClick={() => { if (form.nickname) setNicknameChecked(true) }}
                onMouseEnter={e => { if (!nicknameChecked) e.currentTarget.style.background = "#dbeafe" }}
                onMouseLeave={e => { if (!nicknameChecked) e.currentTarget.style.background = c.bgSurface }}
              >{nicknameChecked ? "✓ 확인됨" : "중복확인"}</button>
            </div>
          </div>

          {/* 이메일 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>이메일</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="이메일 입력" style={inputStyle} />
              <button
                style={smallBtnStyle(emailSent && timerActive)}
                onClick={handleSendEmail}
                onMouseEnter={e => { if (!emailSent) e.currentTarget.style.background = "#dbeafe" }}
                onMouseLeave={e => { if (!emailSent) e.currentTarget.style.background = c.bgSurface }}
              >{emailSent ? "재전송" : "인증전송"}</button>
            </div>
          </div>

          {/* 인증번호 */}
          {emailSent && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 }}>인증번호</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    value={form.code} onChange={e => set("code", e.target.value.slice(0, 6))}
                    placeholder="인증번호 6자리"
                    disabled={verified}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box", paddingRight: 56 }}
                  />
                  {timerActive && !verified && (
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: timer < 30 ? c.danger : c.textSub }}>
                      {formatTimer(timer)}
                    </div>
                  )}
                  {!timerActive && !verified && timer === 0 && (
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: c.danger }}>만료됨</div>
                  )}
                </div>
                <button
                  style={smallBtnStyle(verified)}
                  onClick={handleVerify}
                  disabled={verified}
                  onMouseEnter={e => { if (!verified) e.currentTarget.style.background = "#dbeafe" }}
                  onMouseLeave={e => { if (!verified) e.currentTarget.style.background = c.bgSurface }}
                >{verified ? "✓ 인증됨" : "확인"}</button>
              </div>
              {verified && <div style={{ fontSize: 11, marginTop: 4, color: "#4caf50" }}>✓ 이메일 인증이 완료되었습니다</div>}
            </div>
          )}

          {/* 성별 */}
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
                  fontSize: 13, cursor: "pointer", transition: "all 0.2s"
                }}>{g}</button>
              ))}
            </div>
          </div>

          {/* 가입 버튼 */}
          <button
            style={{
              width: "100%", padding: 12, background: c.primary,
              border: "none", borderRadius: theme.radius.md,
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              marginBottom: 14, transition: "background 0.2s, transform 0.1s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = c.primaryDark}
            onMouseLeave={e => e.currentTarget.style.background = c.primary}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >가입하기</button>

          {/* 로그인 링크 */}
          <div style={{ textAlign: "center" }}>
            <span
              style={{ fontSize: 13, color: c.textMuted, cursor: "pointer", transition: "color 0.2s" }}
              onClick={() => navigate("/login")}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
            >이미 계정이 있으신가요? 로그인</span>
          </div>

        </div>
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function MyInfoEditPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState("홍길동")
  const [email, setEmail] = useState("example@email.com")

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>내 정보 수정</div>
        <div style={{ fontSize: 14, color: c.textSub }}>프로필과 비밀번호를 변경할 수 있습니다</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: c.bgSurface, border: `2px solid ${c.primary}` }}></div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: c.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ color: "#fff", fontSize: 12 }}>✏</span>
              </div>
            </div>
          </div>

          {[
            { label: "닉네임", value: nickname, setter: setNickname, btn: "중복확인" },
            { label: "이메일", value: email, setter: setEmail, btn: "인증전송" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>{f.label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={f.value} onChange={e => f.setter(e.target.value)}
                  style={{ flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 14px", color: c.text, fontSize: 13, outline: "none" }} />
                <button style={{ padding: "10px 14px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{f.btn}</button>
              </div>
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 20, marginTop: 8, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 14 }}>비밀번호 변경</div>
            {["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"].map(label => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: c.textSub, marginBottom: 6, fontWeight: 500 }}>{label}</div>
                <input type="password" placeholder={label}
                  style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/mypage")} style={{ flex: 1, padding: 12, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 14, cursor: "pointer" }}>취소</button>
            <button style={{ flex: 2, padding: 12, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>저장하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
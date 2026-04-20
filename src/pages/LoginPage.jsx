import { useState } from "react"
import { useNavigate } from "react-router-dom"
import wave from "../assets/wave.png"
import api from "../api/axios"
import { authStyles as s } from "../styles/AuthStyles"
import "../styles/Auth.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) return alert("아이디와 비밀번호를 모두 입력해주세요.");

    try {
      const response = await api.post("/api/auth/login", { userId, password });
      const accessToken = response.data;
      if (accessToken) localStorage.setItem("accessToken", accessToken.replace("Bearer ", ""));
      
      alert("로그인 성공! 환영합니다.");
      navigate("/");
    } catch {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  }

  // 🌟 소셜 로그인 처리 (백엔드로 날려버림)
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <div style={s.container}>
      <div style={{ ...s.waveBg, backgroundImage: `url(${wave})` }} />

      <div style={s.cardWrap}>
        <div style={s.card}>
          <div style={s.header}>
            <div style={s.logo} onClick={() => navigate("/")}>GGoBook</div>
            <div style={s.subtitle}>계정에 로그인하세요</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={s.formGroup}>
              <div style={s.label}>아이디</div>
              <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="아이디 입력" style={{ ...s.input, width: "100%" }} />
            </div>

            <div style={s.formGroup}>
              <div style={s.label}>비밀번호</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" style={{ ...s.input, width: "100%" }} />
            </div>

            <button type="submit" className="auth-btn-submit">로그인</button>
          </form>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 24 }}>
            {[
              { label: "아이디 찾기", path: "/find-id" },
              { label: "비밀번호 찾기", path: "/find-password" },
              { label: "회원가입", path: "/signup" },
            ].map(item => (
              <span key={item.label} onClick={() => navigate(item.path)} className="auth-link-text">{item.label}</span>
            ))}
          </div>

          {/* 소셜 로그인 */}
          <div style={s.socialDivider}>
            <div style={s.socialLabel}>소셜 로그인</div>
            <div style={s.socialWrap}>
              <button type="button" onClick={() => handleSocialLogin('kakao')} className="social-btn-base btn-kakao">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.667 1.667 5 4.167 6.333L5 21l4.833-2.833C10.533 18.389 11.267 18.5 12 18.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                </svg>
              </button>
              <button type="button" onClick={() => handleSocialLogin('naver')} className="social-btn-base btn-naver">
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "Arial" }}>N</span>
              </button>
              <button type="button" onClick={() => handleSocialLogin('google')} className="social-btn-base btn-google">
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
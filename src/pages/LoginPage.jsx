import { useState } from "react";
import { useNavigate } from "react-router-dom";
import wave from "../assets/wave.png";
import api from "../api/axios";
import "../styles/Auth.css";

const KakaoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.667 1.667 5 4.167 6.333L5 21l4.833-2.833C10.533 18.389 11.267 18.5 12 18.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const SOCIAL_PROVIDERS = [
  { id: "kakao", colorClass: "btn-kakao", icon: <KakaoIcon /> },
  { id: "naver", colorClass: "btn-naver", icon: <span className="naver-icon">N</span> },
  { id: "google", colorClass: "btn-google", icon: <GoogleIcon /> },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // 🌟 커스텀 모달 상태 관리 (alert 대체)
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: "",
    message: "",
    icon: ""
  });

  const closeModal = () => setModalData({ ...modalData, isOpen: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      return setModalData({
        isOpen: true,
        title: "입력 오류",
        message: "아이디와 비밀번호를 모두 입력해주세요.",
        icon: "⚠️"
      });
    }

    try {
      const response = await api.post("/api/auth/login", { userId, password, keepLoggedIn });
      const accessToken = response.data;
      if (accessToken) {
        const cleanToken = accessToken.replace("Bearer ", "");
        if (keepLoggedIn) {
          localStorage.setItem("accessToken", cleanToken);
        } else {
          sessionStorage.setItem("accessToken", cleanToken);
        }
      }
      
      // 로그인 성공 시 바로 메인 화면으로 이동
      navigate("/");
    } catch (err) {
      // 백엔드가 던진 에러 메시지 낚아채기
      const errorMsg = err.response?.data || "아이디 또는 비밀번호가 일치하지 않습니다.";

      // 🌟 핵심: 백엔드가 보낸 에러 메시지가 'SUSPENDED'로 시작하면 정지 안내창 띄우기
      if (typeof errorMsg === "string" && errorMsg.startsWith("SUSPENDED")) {
        const [_, reason, date] = errorMsg.split("|");
        setModalData({
          isOpen: true,
          title: "로그인 제한 안내",
          message: `해당 계정은 정지 상태입니다.\n\n🚨 사유 : ${reason}\n📅 해제일 : ${date}`,
          icon: "⛔"
        });
      } else {
        // 비밀번호 틀림 등 일반 에러 처리
        setModalData({
          isOpen: true,
          title: "로그인 실패",
          message: errorMsg,
          icon: "❌"
        });
      }
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.assign(`http://localhost:8080/oauth2/authorization/${provider}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-wave-bg" style={{ backgroundImage: `url(${wave})` }} />

      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" onClick={() => navigate("/")}>GGoBook</div>
            <div className="auth-subtitle">계정에 로그인하세요</div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="auth-form-group">
              <div className="auth-label">아이디</div>
              <input 
                value={userId} 
                onChange={e => setUserId(e.target.value)} 
                placeholder="아이디 입력" 
                className="auth-input" 
              />
            </div>

            <div className="auth-form-group" style={{ marginBottom: "10px" }}>
              <div className="auth-label">비밀번호</div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="비밀번호 입력" 
                className="auth-input" 
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", fontSize: "13px", color: "#4A6FA5" }}>
              <input 
                type="checkbox" 
                id="keepLoggedIn" 
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                style={{ marginRight: "6px", cursor: "pointer" }}
              />
              <label htmlFor="keepLoggedIn" style={{ cursor: "pointer" }}>로그인 상태 유지</label>
            </div>

            <button type="submit" className="auth-btn-submit">로그인</button>
          </form>

          <div className="auth-link-wrap">
            {[
              { label: "아이디 찾기", path: "/find-id" },
              { label: "비밀번호 찾기", path: "/find-password" },
              { label: "회원가입", path: "/signup" },
            ].map(item => (
              <span key={item.label} onClick={() => navigate(item.path)} className="auth-link-text">
                {item.label}
              </span>
            ))}
          </div>

          <div className="auth-social-divider">
            <div className="auth-social-label">소셜 로그인</div>
            <div className="auth-social-wrap">
              {SOCIAL_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleSocialLogin(provider.id)}
                  className={`social-btn-base ${provider.colorClass}`}
                >
                  {provider.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 커스텀 모달 UI (이전 대화에서 드린 Auth.css와 찰떡으로 맞습니다) */}
      {modalData.isOpen && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-icon">{modalData.icon}</div>
            <div className="auth-modal-title">{modalData.title}</div>
            <div className="auth-modal-message">{modalData.message}</div>
            <button className="auth-modal-btn" onClick={closeModal}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import wave from "../assets/wave.png";
import api from "../api/axios";
import "../styles/Auth.css"; // 🌟 깨진 AuthStyles 삭제, 순수 CSS만 임포트

export default function SignupPage() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    userId: "", password: "", passwordConfirm: "", name: "",
    nickname: "", email: "", authCode: "", gender: ""
  });
  const { userId, password, passwordConfirm, name, nickname, email, authCode, gender } = inputs;

  const [status, setStatus] = useState({
    isIdChecked: false, isNicknameChecked: false,
    isEmailSent: false, isVerified: false
  });
  const { isIdChecked, isNicknameChecked, isEmailSent, isVerified } = status;

  const [timer, setTimer] = useState(179);
  const [timerActive, setTimerActive] = useState(false);

  const userIdRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);
  const nameRef = useRef(null);
  const nicknameRef = useRef(null);
  const emailRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));

    if (name === "userId") setStatus(prev => ({ ...prev, isIdChecked: false }));
    if (name === "nickname") setStatus(prev => ({ ...prev, isNicknameChecked: false }));
    if (name === "email") {
      setStatus(prev => ({ ...prev, isEmailSent: false, isVerified: false }));
      setTimer(179); setTimerActive(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive]);

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const checkDuplicate = async (type, value, statusKey) => {
    if (!value) return alert("값을 입력해주세요!");
    try {
      const paramName = type === "id" ? "userId" : type;
      const res = await api.get(`/api/auth/check-${type}?${paramName}=${value}`);
      if (res.data) {
        alert("❌ 이미 사용 중입니다.");
        setStatus(prev => ({ ...prev, [statusKey]: false }));
      } else {
        setStatus(prev => ({ ...prev, [statusKey]: true }));
      }
    } catch { alert("검증 실패. 서버를 확인해주세요."); }
  };

  const handleSendEmail = async () => {
    if (!email) return alert("이메일을 입력해주세요.");
    try {
      await api.post(`/api/auth/email/send?email=${email}`);
      setStatus(prev => ({ ...prev, isEmailSent: true, isVerified: false }));
      setTimer(179); setTimerActive(true);
    } catch { alert("❌ 메일 발송 실패."); }
  };

  const handleVerify = async () => {
    if (authCode.length !== 6) return alert("인증번호 6자리를 입력해주세요.");
    try {
      await api.post(`/api/auth/email/verify?email=${email}&code=${authCode}`);
      setStatus(prev => ({ ...prev, isVerified: true }));
      setTimerActive(false);
    } catch { alert("❌ 인증번호가 틀렸거나 만료되었습니다."); }
  };

  const handleSignup = async () => {
    const validationRules = [
      { condition: !userId, message: "아이디를 입력해주세요.", ref: userIdRef },
      { condition: !isIdChecked, message: "아이디 중복확인을 해주세요." },
      { condition: !password, message: "비밀번호를 입력해주세요.", ref: passwordRef },
      { condition: password !== passwordConfirm, message: "비밀번호가 일치하지 않습니다.", ref: passwordConfirmRef },
      { condition: !name, message: "이름(실명)을 입력해주세요.", ref: nameRef },
      { condition: !nickname, message: "닉네임을 입력해주세요.", ref: nicknameRef },
      { condition: !isNicknameChecked, message: "닉네임 중복확인을 해주세요." },
      { condition: !email, message: "이메일을 입력해주세요.", ref: emailRef },
      { condition: !isVerified, message: "이메일 인증을 완료해주세요." },
      { condition: !gender, message: "성별을 선택해주세요." }
    ];

    for (const rule of validationRules) {
      if (rule.condition) {
        alert(rule.message);
        if (rule.ref?.current) rule.ref.current.focus();
        return;
      }
    }

    try {
      await api.post("/api/auth/signup", { userId, password, name, nickname, email, gender });
      alert("🎉 회원가입 성공!"); navigate("/login");
    } catch (error) {
      alert(`가입 실패: ${error.response?.data || "오류 발생"}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wave-bg" style={{ backgroundImage: `url(${wave})` }} />

      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" onClick={() => navigate("/")}>GGoBook</div>
            <div className="auth-subtitle">새 계정을 만드세요</div>
          </div>

          <div className="auth-form-group">
            <div className="auth-label">아이디</div>
            <div className="auth-input-row">
              <input ref={userIdRef} name="userId" value={userId} onChange={handleChange} placeholder="아이디 입력" className="auth-input" />
              <button type="button" className={`auth-btn-small ${isIdChecked ? "active" : ""}`} onClick={() => checkDuplicate("id", userId, "isIdChecked")}>
                {isIdChecked ? "✓ 확인됨" : "중복확인"}
              </button>
            </div>
          </div>

          <div className="auth-form-group">
            <div className="auth-label">비밀번호</div>
            <input ref={passwordRef} type="password" name="password" value={password} onChange={handleChange} placeholder="8자 이상" className="auth-input" />
          </div>

          <div className="auth-form-group">
            <div className="auth-label">비밀번호 확인</div>
            <input ref={passwordConfirmRef} type="password" name="passwordConfirm" value={passwordConfirm} onChange={handleChange} placeholder="비밀번호 재입력" className="auth-input" />
            {passwordConfirm && (
              <div className={password === passwordConfirm ? "auth-msg-success" : "auth-msg-error"}>
                {password === passwordConfirm ? "✓ 비밀번호가 일치합니다" : "✗ 비밀번호가 일치하지 않습니다"}
              </div>
            )}
          </div>

          <div className="auth-form-group">
            <div className="auth-label">이름 (실명)</div>
            <input ref={nameRef} name="name" value={name} onChange={handleChange} placeholder="실명 입력" className="auth-input" />
          </div>

          <div className="auth-form-group">
            <div className="auth-label">닉네임</div>
            <div className="auth-input-row">
              <input ref={nicknameRef} name="nickname" value={nickname} onChange={handleChange} placeholder="닉네임 입력" className="auth-input" />
              <button type="button" className={`auth-btn-small ${isNicknameChecked ? "active" : ""}`} onClick={() => checkDuplicate("nickname", nickname, "isNicknameChecked")}>
                {isNicknameChecked ? "✓ 확인됨" : "중복확인"}
              </button>
            </div>
          </div>

          <div className="auth-form-group">
            <div className="auth-label">이메일</div>
            <div className="auth-input-row">
              <input ref={emailRef} name="email" value={email} onChange={handleChange} placeholder="이메일 입력" className="auth-input" />
              <button type="button" className={`auth-btn-small ${(isEmailSent && timerActive) ? "active" : ""}`} onClick={handleSendEmail}>
                {isEmailSent ? "재전송" : "인증전송"}
              </button>
            </div>
          </div>

          {isEmailSent && (
            <div className="auth-form-group">
              <div className="auth-label">인증번호</div>
              <div className="auth-input-row">
                <div style={{ flex: 1, position: "relative" }}>
                  <input name="authCode" value={authCode} onChange={handleChange} maxLength={6} placeholder="인증번호 6자리" disabled={isVerified} className="auth-input" style={{ paddingRight: 56 }} />
                  {timerActive && !isVerified && (
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: timer < 30 ? "#E53935" : "#4A6FA5" }}>
                      {formatTimer(timer)}
                    </div>
                  )}
                  {!timerActive && !isVerified && timer === 0 && <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#E53935" }}>만료됨</div>}
                </div>
                <button type="button" className={`auth-btn-small ${isVerified ? "active" : ""}`} onClick={handleVerify} disabled={isVerified}>
                  {isVerified ? "✓ 인증됨" : "확인"}
                </button>
              </div>
              {isVerified && <div className="auth-msg-success">✓ 이메일 인증이 완료되었습니다</div>}
            </div>
          )}

          <div className="auth-form-group" style={{ marginBottom: 20 }}>
            <div className="auth-label">성별</div>
            <div className="auth-input-row">
              {["남", "여"].map(g => (
            <button 
              type="button" 
                key={g} 
               onClick={() => setInputs(prev => ({ ...prev, gender: g }))} 
                 className={`auth-btn-small auth-btn-gender ${gender === g ? "active" : ""}`}
                   >
              {g}
              </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleSignup} className="auth-btn-submit">가입하기</button>

          <div className="auth-link-wrap">
            <span className="auth-link-text" onClick={() => navigate("/login")}>이미 계정이 있으신가요? 로그인</span>
          </div>
        </div>
      </div>
    </div>
  );
}
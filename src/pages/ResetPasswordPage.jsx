import { useNavigate, useSearchParams } from "react-router-dom" //  useSearchParams 추가
import { useState } from "react"
import api from "../api/axios" //  API 통신용 추가
import styles from "../styles/ResetPasswordPage.module.css"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams() //  주소창에서 값을 뽑아내는 훅
  const token = searchParams.get("token")  //  ?token=... 의 값을 가져옵니다

  const [pw, setPw] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")

  // 🌟 실제 비밀번호 변경 요청 API 로직
  const handleResetPassword = async () => {
    if (!token) {
      return alert("유효하지 않거나 만료된 링크입니다. 다시 메일을 요청해주세요.");
    }
    if (!pw || !pwConfirm) {
      return alert("새 비밀번호를 입력해주세요.");
    }
    if (pw !== pwConfirm) {
      return alert("비밀번호가 서로 일치하지 않습니다.");
    }

    try {
      // 🌟 팀원분이 만든 pw 변수를 백엔드가 요구하는 newPassword 파라미터에 매핑해서 전송
      await api.post(`/api/auth/password/reset?token=${token}&newPassword=${pw}`);
      alert("비밀번호가 성공적으로 변경되었습니다! 새 비밀번호로 로그인해주세요.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data || "토큰이 만료되었거나 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.header}>
            <div className={styles.logo} onClick={() => navigate("/")}>GGoBook</div>
            <div className={styles.title}>비밀번호 재설정</div>
            <div className={styles.subtitle}>새로운 비밀번호를 입력해주세요</div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>새 비밀번호</div>
            <input 
              type="password" 
              value={pw} 
              onChange={e => setPw(e.target.value)} 
              placeholder="8자 이상" 
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>비밀번호 확인</div>
            <input 
              type="password" 
              value={pwConfirm} 
              onChange={e => setPwConfirm(e.target.value)} 
              placeholder="비밀번호 재입력" 
              className={styles.input} 
            />
          </div>

          {/* 🌟 onClick 이벤트 연결 */}
          <button className={styles.submitBtn} onClick={handleResetPassword}>
            비밀번호 재설정
          </button>
        </div>
      </div>
    </div>
  )
}
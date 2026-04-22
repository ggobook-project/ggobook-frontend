import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios"; // 🌟 API 통신용 추가
import styles from "../styles/FindPasswordPage.module.css";

export default function FindPasswordPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(""); //  아이디 상태 추가
  const [name, setName] = useState("");     //  이름 상태 추가
  const [email, setEmail] = useState("");

  // 재설정 링크 메일 발송 API 호출 함수
  const handleSendResetLink = async () => {
    if (!userId || !name || !email) {
      return alert("모든 정보를 정확히 입력해주세요.");
    }

    try {
      await api.post(`/api/auth/password/reset-link?userId=${userId}&name=${name}&email=${email}`);
      alert("입력하신 이메일로 비밀번호 재설정 링크가 발송되었습니다. (30분간 유효)");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data || "일치하는 회원 정보가 없습니다.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.header}>
            <div className={styles.logo} onClick={() => navigate("/")}>GGoBook</div>
            <div className={styles.title}>비밀번호 찾기</div>
            <div className={styles.subtitle}>가입 정보를 입력하시면 재설정 링크를 보내드립니다</div>
          </div>

          {/* 🌟 아이디 입력칸 추가 */}
          <div className={styles.formGroup}>
            <div className={styles.label}>아이디</div>
            <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="아이디 입력" className={styles.input} />
          </div>

          {/* 🌟 이름 입력칸 추가 */}
          <div className={styles.formGroup}>
            <div className={styles.label}>이름</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="이름 입력" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>이메일</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 입력" className={styles.input} />
          </div>

          {/* 🌟 onClick 이벤트 연결 */}
          <button className={styles.submitBtn} onClick={handleSendResetLink}>비밀번호 재설정</button>

          <div className={styles.links}>
            {[{ label: "로그인", path: "/login" }, { label: "아이디 찾기", path: "/find-id" }].map(item => (
              <span key={item.label} className={styles.link} onClick={() => navigate(item.path)}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
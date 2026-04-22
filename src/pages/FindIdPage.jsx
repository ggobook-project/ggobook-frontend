import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios"; //  API 통신용 추가
import styles from "../styles/FindIdPage.module.css";

export default function FindIdPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  //  아이디 찾기 API 호출 함수 
  const handleFindId = async () => {
    if (!name || !email) {
      return alert("이름과 이메일을 모두 입력해주세요.");
    }

    try {
      const response = await api.get(`/api/auth/find-id?name=${name}&email=${email}`);
      //  알림창 문구 UX 개선
      alert(`회원님의 아이디는 [ ${response.data} ] 입니다.\n전체 아이디는 가입하신 이메일로 안전하게 발송되었습니다.`);
      navigate("/login"); 
    } catch (error) {
      // 이제 백엔드 직원이 순수 문자열을 주니까 에러 메시지가 예쁘게 출력됩니다.
      alert(error.response?.data || "일치하는 회원 정보가 없습니다.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.header}>
            <div className={styles.logo} onClick={() => navigate("/")}>GGoBook</div>
            <div className={styles.title}>아이디 찾기</div>
            <div className={styles.subtitle}>가입 시 입력한 이름과 이메일을 입력해주세요</div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>이름</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="이름 입력" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>이메일</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 입력" className={styles.input} />
          </div>

          {/* 🌟 onClick 이벤트 연결 */}
          <button className={styles.submitBtn} onClick={handleFindId}>아이디 찾기</button>

          <div className={styles.links}>
            {[{ label: "로그인", path: "/login" }, { label: "비밀번호 찾기", path: "/find-password" }].map(item => (
              <span key={item.label} className={styles.link} onClick={() => navigate(item.path)}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
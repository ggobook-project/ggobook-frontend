import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/FindPasswordPage.module.css"

export default function FindPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.header}>
            <div className={styles.logo} onClick={() => navigate("/")}>GGoBook</div>
            <div className={styles.title}>비밀번호 찾기</div>
            <div className={styles.subtitle}>가입한 이메일로 재설정 링크를 보내드립니다</div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>이메일</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 입력" className={styles.input} />
          </div>

          <button className={styles.submitBtn}>재설정 이메일 발송</button>

          <div className={styles.links}>
            {[{ label: "로그인", path: "/login" }, { label: "아이디 찾기", path: "/find-id" }].map(item => (
              <span key={item.label} className={styles.link} onClick={() => navigate(item.path)}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
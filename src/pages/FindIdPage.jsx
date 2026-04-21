import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/FindIdPage.module.css"

export default function FindIdPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

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

          <button className={styles.submitBtn}>아이디 찾기</button>

          <div className={styles.links}>
            {[{ label: "로그인", path: "/login" }, { label: "비밀번호 찾기", path: "/find-password" }].map(item => (
              <span key={item.label} className={styles.link} onClick={() => navigate(item.path)}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
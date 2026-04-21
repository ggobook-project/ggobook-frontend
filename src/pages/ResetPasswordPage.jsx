import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/ResetPasswordPage.module.css"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pw, setPw] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")

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
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="8자 이상" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>비밀번호 확인</div>
            <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="비밀번호 재입력" className={styles.input} />
          </div>

          <button className={styles.submitBtn}>비밀번호 재설정</button>
        </div>
      </div>
    </div>
  )
}
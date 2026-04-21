import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/MyInfoEditPage.module.css"

export default function MyInfoEditPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState("홍길동")
  const [email, setEmail] = useState("example@email.com")

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 정보 수정</div>
        <div className={styles.headerSubtitle}>프로필과 비밀번호를 변경할 수 있습니다</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} />
            <div className={styles.avatarEdit}>✏</div>
          </div>

          {[
            { label: "닉네임", value: nickname, setter: setNickname, btn: "중복확인" },
            { label: "이메일", value: email, setter: setEmail, btn: "인증전송" },
          ].map(f => (
            <div key={f.label} className={styles.formGroup}>
              <div className={styles.label}>{f.label}</div>
              <div className={styles.inputRow}>
                <input value={f.value} onChange={e => f.setter(e.target.value)} className={styles.input} />
                <button className={styles.sideBtn}>{f.btn}</button>
              </div>
            </div>
          ))}

          <div className={styles.pwSection}>
            <div className={styles.pwTitle}>비밀번호 변경</div>
            {["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"].map(label => (
              <div key={label} className={styles.formGroup}>
                <div className={styles.label}>{label}</div>
                <input type="password" placeholder={label} className={styles.inputFull} />
              </div>
            ))}
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate("/mypage")}>취소</button>
            <button className={styles.submitBtn}>저장하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
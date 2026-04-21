import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/EpisodeRegisterPage.module.css"

export default function EpisodeRegisterPage() {
  const navigate = useNavigate()
  const [isFree, setIsFree] = useState(true)
  const [scheduled, setScheduled] = useState(false)

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>회차 등록</div>
        <div className={styles.headerSubtitle}>새 회차를 등록하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 제목</div>
            <input placeholder="회차 제목 입력" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>원고 업로드</div>
            <div className={styles.fileUpload}>
              <span className={styles.fileLabel}>+ 파일 업로드 (이미지/텍스트)</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>공개 설정</div>
            <div className={styles.typeGroup}>
              {[{ label: "무료", val: true }, { label: "유료", val: false }].map(opt => (
                <button key={opt.label} onClick={() => setIsFree(opt.val)} className={`${styles.typeBtn} ${isFree === opt.val ? styles.typeBtnActive : ""}`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.scheduleRow}>
              <div className={styles.formLabel}>예약 업로드</div>
              <button onClick={() => setScheduled(!scheduled)} className={`${styles.toggleBtn} ${scheduled ? styles.toggleBtnActive : ""}`}>{scheduled ? "ON" : "OFF"}</button>
            </div>
            {scheduled && <input type="datetime-local" className={styles.input} />}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>TTS 목소리 설정</div>
            <div className={styles.ttsBox}>
              <div className={styles.ttsHint}>등장인물별 목소리를 설정하세요</div>
              {["나레이터", "주인공", "상대방"].map(ch => (
                <div key={ch} className={styles.ttsRow}>
                  <span className={styles.ttsChar}>{ch}</span>
                  <select className={styles.ttsSelect}>
                    <option>목소리 선택</option>
                    <option>차분한 여성</option>
                    <option>활발한 남성</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate("/author/contents")}>취소</button>
            <button className={styles.submitBtn}>등록하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
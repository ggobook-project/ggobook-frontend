import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/RelayNovelRegisterPage.module.css"

export default function RelayNovelRegisterPage() {
  const navigate = useNavigate()
  const [useAdminTopic, setUseAdminTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")
  const adminTopics = ["사랑에 빠진 두 사람", "마법사의 비밀", "미래 도시의 탐정"]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설 등록</div>
        <div className={styles.headerSubtitle}>새로운 릴레이 소설을 시작하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <div className={styles.topicToggleRow}>
              <div className={styles.label}>관리자 주제 사용</div>
              <button onClick={() => setUseAdminTopic(!useAdminTopic)} className={`${styles.toggleBtn} ${useAdminTopic ? styles.toggleBtnActive : ""}`}>
                {useAdminTopic ? "ON" : "OFF"}
              </button>
            </div>
            {useAdminTopic && (
              <div className={styles.topicList}>
                {adminTopics.map(topic => (
                  <div key={topic} onClick={() => setSelectedTopic(topic)} className={`${styles.topicItem} ${selectedTopic === topic ? styles.topicItemActive : ""}`}>
                    {topic}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!useAdminTopic && (
            <>
              <div className={styles.formGroup}>
                <div className={styles.label}>제목</div>
                <input placeholder="릴레이 소설 제목 입력" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.label}>시작 내용</div>
                <textarea placeholder="이야기의 시작을 써주세요..." rows={5} className={styles.textarea} />
              </div>
            </>
          )}

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate("/relay")}>취소</button>
            <button className={styles.submitBtn}>등록하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
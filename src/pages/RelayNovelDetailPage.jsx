import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/RelayNovelDetailPage.module.css"

export default function RelayNovelDetailPage() {
  const navigate = useNavigate()
  const [myText, setMyText] = useState("")

  const entries = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, user: `참여자${i + 1}`, order: i + 1,
    text: `${i + 1}번째 이야기가 이어집니다. 주인공은 새로운 모험을 시작하게 되는데...`,
    date: `2026.04.${10 + i}`
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/relay")}>← 목록</button>
        <div className={styles.headerTitle}>릴레이 소설 제목</div>
        <div className={styles.headerMeta}>시작: 홍길동 · 참여자 12명 · 이어쓰기 {entries.length}개</div>
      </div>

      <div className={styles.content}>
        {entries.map(entry => (
          <div key={entry.id} className={styles.entryCard}>
            <div className={styles.entryHeader}>
              <div className={styles.avatar} />
              <span className={styles.entryUser}>{entry.user}</span>
              <span className={styles.entryMeta}>· {entry.order}번째 · {entry.date}</span>
            </div>
            <div className={styles.entryText}>{entry.text}</div>
          </div>
        ))}

        <div className={styles.writeCard}>
          <div className={styles.writeTitle}>이어쓰기</div>
          <textarea
            value={myText}
            onChange={e => setMyText(e.target.value)}
            placeholder="이야기를 이어서 써주세요..."
            rows={5}
            className={styles.textarea}
          />
          <div className={styles.writeFooter}>
            <span className={styles.charCount}>{myText.length} / 500자</span>
            <button className={styles.submitBtn}>등록</button>
          </div>
        </div>
      </div>
    </div>
  )
}
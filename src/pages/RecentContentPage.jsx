import { useNavigate } from "react-router-dom"
import styles from "../styles/RecentContentPage.module.css"

export default function RecentContentPage() {
  const navigate = useNavigate()

  const items = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, title: `최근 본 작품 ${i + 1}`, author: "작가명",
    lastEpisode: `${i * 3 + 1}화`, date: `${i + 1}시간 전`,
    progress: Math.floor(Math.random() * 80) + 10
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>최근 본 작품</div>
        <div className={styles.headerSubtitle}>이어서 읽어보세요</div>
      </div>
      <div className={styles.content}>
        {items.map(item => (
          <div key={item.id} className={styles.card} onClick={() => navigate("/contents/1")}>
            <div className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.meta}>{item.author} · 마지막: {item.lastEpisode} · {item.date}</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${item.progress}%` }} />
              </div>
              <div className={styles.progressLabel}>진행률 {item.progress}%</div>
            </div>
            <button className={styles.continueBtn}>이어보기</button>
          </div>
        ))}
      </div>
    </div>
  )
}
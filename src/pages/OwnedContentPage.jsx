import { useNavigate } from "react-router-dom"
import styles from "../styles/OwnedContentPage.module.css"

export default function OwnedContentPage() {
  const navigate = useNavigate()

  const items = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `소장 작품 ${i + 1}`, author: "작가명", episodes: 120, date: "2026.03.15"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>소장한 작품</div>
        <div className={styles.headerSubtitle}>구매한 완결 작품 목록</div>
      </div>
      <div className={styles.content}>
        {items.map(item => (
          <div key={item.id} className={styles.card} onClick={() => navigate("/contents/1")}>
            <div className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.meta}>{item.author} · 전 {item.episodes}화</div>
              <div className={styles.date}>소장일: {item.date}</div>
            </div>
            <span className={styles.badge}>완결</span>
          </div>
        ))}
      </div>
    </div>
  )
}
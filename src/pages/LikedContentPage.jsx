import { useNavigate } from "react-router-dom"
import styles from "../styles/LikedContentPage.module.css"

export default function LikedContentPage() {
  const navigate = useNavigate()

  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `찜한 작품 ${i + 1}`, author: "작가명",
    type: i % 2 === 0 ? "웹툰" : "웹소설",
    status: i % 3 === 0 ? "완결" : "연재중"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>찜한 작품</div>
        <div className={styles.headerSubtitle}>총 {items.length}개</div>
      </div>
      <div className={styles.content}>
        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.id} className={styles.card} onClick={() => navigate("/contents/1")}>
              <div className={styles.thumbnail}>
                <div className={styles.heartIcon}>♥</div>
              </div>
              <div className={styles.cardTitle}>{item.title}</div>
              <div className={styles.cardAuthor}>{item.author}</div>
              <div className={styles.badges}>
                <span className={styles.badge}>{item.type}</span>
                <span className={styles.badge}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
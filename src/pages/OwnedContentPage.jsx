import { useNavigate } from "react-router-dom"
import styles from "../styles/OwnedContentPage.module.css"

export default function OwnedContentPage() {
  const navigate = useNavigate()

  const items = [
    { id: 1, title: "어느 날 나는 용사가 되었다", author: "김판타지", episodes: 120, type: "웹소설", date: "2026.03.15" },
    { id: 2, title: "달빛 아래 로맨스", author: "이로맨스", episodes: 85, type: "웹툰", date: "2026.02.20" },
    { id: 3, title: "최강 무협전", author: "박무협", episodes: 200, type: "웹소설", date: "2026.01.10" },
    { id: 4, title: "현대판 마법사", author: "최마법", episodes: 60, type: "웹툰", date: "2025.12.25" },
    { id: 5, title: "학교 뒤편의 비밀", author: "한스릴러", episodes: 45, type: "웹소설", date: "2025.11.30" },
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>소장한 작품</div>
        <div className={styles.headerSubtitle}>구매한 완결 작품 목록</div>
      </div>
      <div className={styles.content}>
        {items.map(item => (
          <div key={item.id} className={styles.card} onClick={() => navigate(`/contents/${item.id}`)}>
            <div className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.meta}>{item.author} · {item.type} · 전 {item.episodes}화</div>
              <div className={styles.date}>소장일: {item.date}</div>
            </div>
            <span className={styles.badge}>완결</span>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import styles from "../styles/NoticePage.module.css"

export default function NoticePage() {
  const navigate = useNavigate()

  const notices = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `공지사항 제목 ${i + 1}`, date: `2026.04.${13 - i}`,
    isPinned: i === 0
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>공지사항</div>
        <div className={styles.headerSubtitle}>꼬북의 새로운 소식을 확인하세요</div>
      </div>
      <div className={styles.content}>
        {notices.map(n => (
          <div
            key={n.id}
            className={`${styles.noticeItem} ${n.isPinned ? styles.noticePinned : ""}`}
            onClick={() => navigate("/notices/1")}
          >
            <div className={styles.noticeLeft}>
              {n.isPinned && <span className={styles.pinnedBadge}>공지</span>}
              <span className={`${styles.noticeTitle} ${n.isPinned ? styles.noticeTitlePinned : ""}`}>{n.title}</span>
            </div>
            <span className={styles.noticeDate}>{n.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
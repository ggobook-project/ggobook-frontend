import { useNavigate } from "react-router-dom"
import styles from "../styles/MyCommentPage.module.css"

export default function MyCommentPage() {
  const navigate = useNavigate()

  const comments = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, content: `댓글 내용 ${i + 1} - 정말 재밌는 작품이에요!`,
    contentTitle: `작품 제목 ${i + 1}`, episode: `${i + 1}화`, date: "2026.04.13"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내가 쓴 댓글</div>
        <div className={styles.headerSubtitle}>총 {comments.length}개</div>
      </div>
      <div className={styles.content}>
        {comments.map(cm => (
          <div key={cm.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLink} onClick={() => navigate("/contents/1")}>{cm.contentTitle} · {cm.episode}</span>
              <span className={styles.cardDate}>{cm.date}</span>
            </div>
            <div className={styles.cardText}>{cm.content}</div>
            <div className={styles.cardActions}>
              <button className={styles.deleteBtn}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import styles from "../styles/MyCommentPage.module.css"

export default function MyCommentPage() {
  const navigate = useNavigate()

  const comments = [
    { id: 1, content: "정말 재밌는 작품이에요! 다음 화가 너무 기대됩니다.", contentTitle: "어느 날 나는 용사가 되었다", contentId: 1, episodeId: 5, episode: "5화", date: "2026.04.13" },
    { id: 2, content: "주인공 캐릭터가 너무 매력적이에요. 계속 응원합니다!", contentTitle: "달빛 아래 로맨스", contentId: 2, episodeId: 12, episode: "12화", date: "2026.04.10" },
    { id: 3, content: "이번 화 반전 정말 충격적이었어요. 작가님 천재 아닌가요?", contentTitle: "최강 무협전", contentId: 3, episodeId: 30, episode: "30화", date: "2026.04.07" },
    { id: 4, content: "그림체가 너무 예쁘고 스토리도 탄탄해요.", contentTitle: "현대판 마법사", contentId: 4, episodeId: 8, episode: "8화", date: "2026.03.30" },
    { id: 5, content: "오늘 업데이트 기다리고 있었어요. 역시 기대를 저버리지 않네요!", contentTitle: "학교 뒤편의 비밀", contentId: 5, episodeId: 3, episode: "3화", date: "2026.03.25" },
  ]

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
              <span className={styles.cardLink} onClick={() => navigate(`/contents/${cm.contentId}`)}>
                {cm.contentTitle} · {cm.episode}
              </span>
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

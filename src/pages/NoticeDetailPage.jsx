import { useNavigate } from "react-router-dom"
import styles from "../styles/NoticeDetailPage.module.css"

export default function NoticeDetailPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/notices")}>← 목록</button>
        <div className={styles.headerTitle}>공지사항 제목</div>
        <div className={styles.headerMeta}>2026.04.13 · 관리자</div>
      </div>
      <div className={styles.content}>
        <div className={styles.body}>
          <p className={styles.text}>안녕하세요, 꼬북 팀입니다. 서비스 이용에 관한 중요한 공지사항을 안내드립니다.</p>
          <p className={styles.text}>이번 업데이트를 통해 TTS 기능이 개선되었으며, 더욱 자연스러운 음성으로 웹소설을 즐기실 수 있습니다.</p>
          <p className={styles.text}>이용해 주셔서 감사합니다.</p>
        </div>
      </div>
    </div>
  )
}
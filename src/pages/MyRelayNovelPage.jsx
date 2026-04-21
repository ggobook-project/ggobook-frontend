import { useNavigate } from "react-router-dom"
import styles from "../styles/MyRelayNovelPage.module.css"

export default function MyRelayNovelPage() {
  const navigate = useNavigate()

  const relays = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`,
    role: i % 2 === 0 ? "시작자" : "참여자",
    entries: i * 3 + 2, date: "2026.04.10"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 릴레이 소설</div>
        <div className={styles.headerSubtitle}>참여한 릴레이 소설 목록</div>
      </div>
      <div className={styles.content}>
        {relays.map(r => (
          <div key={r.id} className={styles.card} onClick={() => navigate("/relay")}>
            <div className={styles.cardTop}>
              <div className={styles.cardTitle}>{r.title}</div>
              <span className={`${styles.roleBadge} ${r.role === "시작자" ? styles.roleStarter : styles.roleParticipant}`}>{r.role}</span>
            </div>
            <div className={styles.cardMeta}>내 이어쓰기 {r.entries}개 · 참여일: {r.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
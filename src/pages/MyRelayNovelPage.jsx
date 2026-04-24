import { useNavigate } from "react-router-dom"
import styles from "../styles/MyRelayNovelPage.module.css"

export default function MyRelayNovelPage() {
  const navigate = useNavigate()

  const relays = [
    { id: 1, title: "마법학교의 마지막 수업", role: "시작자", entries: 5, participants: 12, date: "2026.04.10" },
    { id: 2, title: "우주 끝에서 만난 너", role: "참여자", entries: 2, participants: 8, date: "2026.03.25" },
    { id: 3, title: "오래된 도서관의 비밀", role: "시작자", entries: 7, participants: 15, date: "2026.03.01" },
    { id: 4, title: "비 오는 날의 카페", role: "참여자", entries: 1, participants: 6, date: "2026.02.14" },
    { id: 5, title: "달리는 기차 안에서", role: "참여자", entries: 3, participants: 9, date: "2026.01.20" },
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 릴레이 소설</div>
        <div className={styles.headerSubtitle}>참여한 릴레이 소설 목록</div>
      </div>
      <div className={styles.content}>
        {relays.map(r => (
          <div key={r.id} className={styles.card} onClick={() => navigate(`/relay/${r.id}`)}>
            <div className={styles.cardTop}>
              <div className={styles.cardTitle}>{r.title}</div>
              <span className={`${styles.roleBadge} ${r.role === "시작자" ? styles.roleStarter : styles.roleParticipant}`}>{r.role}</span>
            </div>
            <div className={styles.cardMeta}>내 이어쓰기 {r.entries}개 · 참여자 {r.participants}명 · 참여일: {r.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
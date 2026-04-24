import { useNavigate } from "react-router-dom"
import styles from "../styles/RecentContentPage.module.css"

export default function RecentContentPage() {
  const navigate = useNavigate()

  const items = [
    { id: 1, title: "어느 날 나는 용사가 되었다", author: "김판타지", type: "novel", lastEpisodeId: 5, lastEpisode: "5화", date: "2시간 전", progress: 45 },
    { id: 2, title: "달빛 아래 로맨스", author: "이로맨스", type: "webtoon", lastEpisodeId: 12, lastEpisode: "12화", date: "1일 전", progress: 72 },
    { id: 3, title: "최강 무협전", author: "박무협", type: "novel", lastEpisodeId: 30, lastEpisode: "30화", date: "3일 전", progress: 28 },
    { id: 4, title: "현대판 마법사", author: "최마법", type: "webtoon", lastEpisodeId: 8, lastEpisode: "8화", date: "5일 전", progress: 60 },
    { id: 5, title: "학교 뒤편의 비밀", author: "한스릴러", type: "novel", lastEpisodeId: 3, lastEpisode: "3화", date: "1주 전", progress: 15 },
  ]

  const handleContinue = (e, item) => {
    e.stopPropagation()
    const path = item.type === "webtoon"
      ? `/webtoon/viewer/${item.lastEpisodeId}`
      : `/novel/viewer/${item.lastEpisodeId}`
    navigate(path)
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>최근 본 작품</div>
        <div className={styles.headerSubtitle}>이어서 읽어보세요</div>
      </div>
      <div className={styles.content}>
        {items.map(item => (
          <div key={item.id} className={styles.card} onClick={() => navigate(`/contents/${item.id}`)}>
            <div className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.meta}>{item.author} · 마지막: {item.lastEpisode} · {item.date}</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${item.progress}%` }} />
              </div>
              <div className={styles.progressLabel}>진행률 {item.progress}%</div>
            </div>
            <button className={styles.continueBtn} onClick={(e) => handleContinue(e, item)}>이어보기</button>
          </div>
        ))}
      </div>
    </div>
  )
}

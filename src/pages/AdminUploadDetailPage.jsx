import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "../styles/AdminUploadDetailPage.module.css"

const dummyEpisodes = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  title: `${i + 1}화`,
  date: `2026.04.${10 + i}`,
  status: i === 2 ? "비공개" : "공개",
}))

export default function AdminUploadDetailPage() {
  const navigate = useNavigate()
  const { contentId } = useParams()
  const [episodes, setEpisodes] = useState(dummyEpisodes)

  const handleToggle = (id) => {
    setEpisodes(prev => prev.map(ep =>
      ep.id === id ? { ...ep, status: ep.status === "공개" ? "비공개" : "공개" } : ep
    ))
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/admin/uploads")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <div className={styles.headerTitle}>작품 제목 {contentId}</div>
        <div className={styles.headerSubtitle}>회차별 공개/비공개를 관리하세요</div>
      </div>

      <div className={styles.content}>
        {episodes.map(ep => (
          <div key={ep.id} className={styles.card}>
            <div>
              <div className={styles.cardTitle}>{ep.title}</div>
              <div className={styles.cardMeta}>{ep.date}</div>
            </div>
            <button
              className={`${styles.statusBtn} ${ep.status === "공개" ? styles.statusPublic : styles.statusPrivate}`}
              onClick={() => handleToggle(ep.id)}
            >
              {ep.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
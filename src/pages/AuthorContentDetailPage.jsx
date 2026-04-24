import { useNavigate, useParams } from "react-router-dom"
import styles from "../styles/AuthorContentDetailPage.module.css"

export default function AuthorContentDetailPage() {
  const navigate = useNavigate()
  const { contentId } = useParams()

  const myContents = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `내 작품 ${i + 1}`, type: i % 2 === 0 ? "웹툰" : "웹소설",
    episodes: i * 5 + 3, status: i % 3 === 0 ? "검수중" : "연재중"
  }))

  const content = myContents.find(c => c.id === Number(contentId))

  if (!content) return (
    <div style={{ padding: 40, color: "#4A6FA5", textAlign: "center" }}>
      작품을 찾을 수 없습니다.
    </div>
  )

  const episodes = Array.from({ length: content.episodes }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    title: `${content.title} ${i + 1}화`,
    uploadDate: `2024.${String(Math.floor(i / 4) + 1).padStart(2, "0")}.${String((i % 28) + 1).padStart(2, "0")}`,
    status: i === 0 ? "검수중" : "공개"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{content.title}</div>
        <div className={styles.headerMeta}>{content.type} · 총 {content.episodes}화 · {content.status}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>
            회차 목록 <span className={styles.listCount}>{episodes.length}</span>
          </span>
          <button
            className={styles.registerBtn}
            onClick={() => navigate(`/author/contents/${contentId}/episode/register`)}
          >
            회차 등록
          </button>
        </div>

        {episodes.map(ep => (
          <div key={ep.id} className={styles.episodeCard}>
            <div className={styles.episodeLeft}>
              <div className={styles.episodeNumber}>{ep.number}화</div>
              <div>
                <div className={styles.episodeTitle}>{ep.title}</div>
                <div className={styles.episodeMeta}>{ep.uploadDate}</div>
              </div>
            </div>
            <div className={styles.episodeRight}>
              <span className={`${styles.epStatusBadge} ${ep.status === "검수중" ? styles.statusReview : styles.statusPublic}`}>
                {ep.status}
              </span>
              <button
                className={styles.editBtn}
                onClick={() => navigate(`/author/contents/${contentId}/episode/${ep.id}/edit`)}
              >
                수정
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

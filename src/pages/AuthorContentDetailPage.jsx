import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/axios"
import styles from "../styles/AuthorContentDetailPage.module.css"

const STATUS_LABEL = {
  PENDING: "검수중",
  APPROVED: "공개",
  REJECTED: "반려됨",
  DRAFT: "임시저장",
  BLINDED: "블라인드",
}

const STATUS_STYLE = {
  PENDING: "statusReview",
  APPROVED: "statusPublic",
  REJECTED: "statusReview",
  DRAFT: "statusReview",
  BLINDED: "statusReview",
}

export default function AuthorContentDetailPage() {
  const navigate = useNavigate()
  const { contentId } = useParams()
  const [content, setContent] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [contentRes, episodeRes] = await Promise.all([
          api.get(`/api/contents/${contentId}`),
          api.get(`/api/contents/${contentId}/episodes`, { params: { size: 100 } }),
        ])
        setContent(contentRes.data)
        setEpisodes(episodeRes.data.content || episodeRes.data || [])
      } catch {
        setContent(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contentId])

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#4A6FA5" }}>불러오는 중...</div>
  if (!content) return <div style={{ padding: 40, textAlign: "center", color: "#4A6FA5" }}>작품을 찾을 수 없습니다.</div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{content.title}</div>
        <div className={styles.headerMeta}>{content.type} · {content.genre} · 총 {episodes.length}화</div>
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

        {episodes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>
            등록된 회차가 없습니다.
          </div>
        ) : (
          episodes.map(ep => (
            <div key={ep.episodeId} className={styles.episodeCard}>
              <div className={styles.episodeLeft}>
                <div className={styles.episodeNumber}>{ep.episodeNumber}화</div>
                <div>
                  <div className={styles.episodeTitle}>{ep.episodeTitle}</div>
                  <div className={styles.episodeMeta}>{ep.createdAt?.substring(0, 10)}</div>
                </div>
              </div>
              <div className={styles.episodeRight}>
                <span className={`${styles.epStatusBadge} ${styles[STATUS_STYLE[ep.status]] || styles.statusReview}`}>
                  {STATUS_LABEL[ep.status] || ep.status}
                </span>
                <button
                  className={styles.editBtn}
                  onClick={() => navigate(`/author/contents/${contentId}/episode/${ep.episodeId}/edit`)}
                >
                  수정
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

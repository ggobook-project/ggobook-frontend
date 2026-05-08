import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/axios"
import styles from "../styles/AuthorContentDetailPage.module.css"

const STATUS_LABEL = {
  DRAFT: "임시 저장", PENDING: "검수 대기", APPROVED: "검수 완료", 
  PUBLISHED: "공개 완료", REJECTED: "반려", BLINDED: "블라인드", PRIVATE: "비공개",
}

const STATUS_STYLE = {
  PENDING: "statusReview", APPROVED: "statusPublic", PUBLISHED: "statusPublic",
  REJECTED: "statusReview", DRAFT: "statusReview", BLINDED: "statusReview", PRIVATE: "statusReview",
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
          api.get(`/api/author/contents/${contentId}/episodes`, { params: { size: 100 } }),
        ])
        setContent(contentRes.data)
        setEpisodes(episodeRes.data.content || episodeRes.data || [])
      } catch (error) {
        setContent(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contentId])

  // 🌟 핵심 수술 1: 뷰어 이동 함수 (웹툰/웹소설 구분)
  const goToViewer = (epId) => {
    const isWebtoon = content.type === "WEBTOON" || content.type === "웹툰";
    navigate(isWebtoon ? `/webtoon/viewer/${epId}?contentId=${contentId}` : `/novel/viewer/${epId}?contentId=${contentId}`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>불러오는 중...</div>
  if (!content) return <div style={{ padding: 40, textAlign: "center" }}>작품을 찾을 수 없습니다.</div>

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
          <button className={styles.registerBtn} onClick={() => navigate(`/author/contents/${contentId}/episode/register`)}>
            회차 등록
          </button>
        </div>

        {episodes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>
            등록된 회차가 없습니다.
          </div>
        ) : (
          episodes.map(ep => (
            <div 
              key={ep.episodeId} 
              className={styles.episodeCard} 
              onClick={() => goToViewer(ep.episodeId)} // 🌟 클릭 시 뷰어로 이동!
              style={{ cursor: "pointer" }}
            >
              <div className={styles.episodeLeft}>
                <div className={styles.thumbWrap}>
                  {ep.thumbnailUrl ? <img src={ep.thumbnailUrl} alt="썸네일" className={styles.thumbImg} /> : <div className={styles.thumbPlaceholder}>{ep.episodeNumber}화</div>}
                </div>
                <div>
                  <div className={styles.episodeTitle}>{ep.episodeTitle || ep.title}</div>
                  <div className={styles.episodeMeta}>{ep.createdAt ? new Date(ep.createdAt).toLocaleDateString() : ""}</div>
                </div>
              </div>
              <div className={styles.episodeRight}>
                <span className={`${styles.epStatusBadge} ${styles[STATUS_STYLE[ep.status]] || styles.statusReview}`}>
                  {STATUS_LABEL[ep.status] || ep.status}
                </span>
                {ep.status !== "PENDING" && ep.status !== "BLINDED" && (
                  <button
                    className={styles.editBtn}
                    onClick={(e) => {
                      e.stopPropagation(); // 🌟 버튼 누를 때는 뷰어로 안 넘어가게 방어!
                      navigate(`/author/contents/${contentId}/episode/${ep.episodeId}/edit`);
                    }}
                  >
                    수정
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
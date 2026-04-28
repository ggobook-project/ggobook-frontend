import { useNavigate, useParams } from "react-router-dom"
import styles from "../styles/OwnedEpisodePage.module.css"
import api from "../api/axios";
import { useEffect, useState } from "react";

export default function OwnedEpisodePage() {
  const navigate = useNavigate()
  const { contentId } = useParams()

  const [content, setContent] = useState(null)
  const [ownedEpisodes, setOwnedEpisodes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
  }

  const handleEpisodeClick = (episodeId) => {
    if (!content) return
    if (content.type === "WEBTOON" || content.type === "웹툰") {
      navigate(`/webtoon/viewer/${episodeId}?contentId=${contentId}`)
    } else {
      navigate(`/novel/viewer/${episodeId}?contentId=${contentId}`)
    }
  }

  const handleDelete = async (e, episodeId) => {
    e.stopPropagation()
    if (!window.confirm("이 회차의 소장을 취소하시겠습니까?")) return

    try {
      await api.delete(`/api/owns/${contentId}/${episodeId}`)
      setOwnedEpisodes(prev => prev.filter(ep => ep.episodeId !== episodeId))
    } catch (error) {
      console.error("소장 삭제 실패:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [contentRes, episodesRes] = await Promise.all([
          api.get(`/api/contents/${contentId}`),
          api.get(`/api/owns/${contentId}`)
        ])
        setContent(contentRes.data)
        const data = episodesRes.data
        setOwnedEpisodes(Array.isArray(data) ? data : data.content ? data.content : [])
        console.log("소장한 회차 목록 : ", data)
      } catch (error) {
        console.error("소장 회차 목록 불러오기 실패 : ", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [contentId])

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/mypage/library")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          소장 목록
        </button>
        <div className={styles.headerTitle}>소장한 회차</div>
        <div className={styles.headerSubtitle}>
          {content ? content.title : "불러오는 중..."}
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.emptyMsg}>불러오는 중...</div>
        ) : ownedEpisodes.length === 0 ? (
          <div className={styles.emptyMsg}>소장한 회차가 없습니다.</div>
        ) : (
          ownedEpisodes.map(ep => (
            <div
              key={ep.episodeId}
              className={styles.card}
              onClick={() => handleEpisodeClick(ep.episodeId)}
            >
              <div className={styles.epNumBadge}>{ep.episodeNumber}화</div>
              <div className={styles.info}>
                <div className={styles.title}>{ep.episodeTitle}</div>
                <div className={styles.date}>소장일: {formatDate(ep.ownedAt)}</div>
              </div>
              <span className={styles.badge}>소장</span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => handleDelete(e, ep.episodeId)}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

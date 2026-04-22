import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "../styles/WebtoonViewerPage.module.css"

export default function WebtoonViewerPage() {
  const navigate = useNavigate()
  const { episodeId } = useParams()

  const [episode, setEpisode] = useState(null)
  const [comicToons, setComicToons] = useState([])
  const [loading, setLoading] = useState(true)

  const loadEpisodeDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:8080/api/episodes/${episodeId}`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) { alert("백엔드 통신 실패(회차 상세)"); return }
      const data = await response.json()
      setEpisode(data)
      const sorted = (data.comicToons || []).sort((a, b) => a.imageOrder - b.imageOrder)
      setComicToons(sorted)
    } catch (error) {
      console.error("회차 상세 불러오기 실패 : ", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEpisodeDetail()
  }, [episodeId])

  const goContentDetail = () => {
    if (episode?.content?.contentId) {
      navigate(`/contents/${episode.content.contentId}`)
    } else {
      navigate(-1)
    }
  }

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loading}>불러오는 중...</div>
      </div>
    )
  }

  if (!episode) return null

  return (
    <div className={styles.pageWrapper}>

      <div className={styles.topBar}>
        <button className={styles.topBtn} onClick={goContentDetail}>← 목록</button>
        <span className={styles.topTitle}>
          {episode.episodeTitle || `${episode.episodeNumber}화`}
        </span>
        <span className={styles.topPage}>{episode.episodeNumber}화</span>
      </div>

      <div className={styles.content}>
        {comicToons.length > 0
          ? comicToons.map((ct) => (
              <img
                key={ct.comicToonId}
                src={ct.imageUrl}
                alt={`${ct.imageOrder}컷`}
                className={styles.panel}
                style={{ width: "100%", display: "block" }}
              />
            ))
          : <div className={styles.emptyMsg}>이미지가 없습니다.</div>
        }
      </div>

      <div className={styles.bottomBar}>
        <button
          className={styles.prevBtn}
          onClick={() => navigate(`/webtoon/viewer/${parseInt(episodeId) - 1}`)}
        >← 이전화</button>
        <button className={styles.listBtn} onClick={goContentDetail}>목록</button>
        <button
          className={styles.nextBtn}
          onClick={() => navigate(`/webtoon/viewer/${parseInt(episodeId) + 1}`)}
        >다음화 →</button>
      </div>

    </div>
  )
}
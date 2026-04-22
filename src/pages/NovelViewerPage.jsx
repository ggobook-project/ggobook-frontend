import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "../styles/NovelViewerPage.module.css"

export default function NovelViewerPage() {
  const navigate = useNavigate()
  const { episodeId } = useParams()
  const [playing, setPlaying] = useState(false)

  const [episode, setEpisode] = useState(null)
  const [novel, setNovel] = useState(null)
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
      setNovel(data.novel || null)
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

  const paragraphs = novel?.contentText
    ? novel.contentText.split("\n").filter(p => p.trim() !== "")
    : []

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
        <button className={styles.topBtn}>설정</button>
      </div>

      <div className={styles.content}>
        <div className={styles.chapterLabel}>— {episode.episodeNumber}화 —</div>
        {paragraphs.length > 0
          ? paragraphs.map((p, i) => (
              <p key={i} className={styles.paragraph}>{p}</p>
            ))
          : <div className={styles.emptyMsg}>본문이 없습니다.</div>
        }
        {episode.aiSummary && (
          <div className={styles.aiSummary}>
            <div className={styles.aiSummaryLabel}>AI 요약</div>
            <div className={styles.aiSummaryText}>{episode.aiSummary}</div>
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <div className={styles.ttsRow}>
            <button className={styles.playBtn} onClick={() => setPlaying(!playing)}>
              {playing ? "⏸" : "▶"}
            </button>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
            <span className={styles.timeLabel}>02:14 / 08:30</span>
            <span className={styles.voiceBtn}>목소리</span>
          </div>
          <div className={styles.navRow}>
            <button
              className={styles.prevBtn}
              onClick={() => navigate(`/novel/viewer/${parseInt(episodeId) - 1}`)}
            >← 이전화</button>
            <button
              className={styles.nextBtn}
              onClick={() => navigate(`/novel/viewer/${parseInt(episodeId) + 1}`)}
            >다음화 →</button>
          </div>
        </div>
      </div>

    </div>
  )
}
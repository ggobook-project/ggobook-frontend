import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "../styles/ContentDetailPage.module.css"

export default function ContentDetailPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("회차목록")
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState("")
  const { contentId } = useParams()
  const [content, setContent] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [episodesLoading, setEpisodesLoading] = useState(true)

  const comments = [
    { user: "독자1", text: "정말 재밌어요! 다음화가 기대됩니다", date: "04.13" },
    { user: "독자2", text: "빨리 다음화 올려주세요", date: "04.12" },
  ]

  const loadContentDetail = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch("http://localhost:8080/api/contents/" + contentId, {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) { alert("백엔드 통신 실패(작품 상세)"); return }
      const data = await response.json()
      setContent(data)
    } catch (error) {
      console.error("작품 상세 불러오기 실패 : ", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEpisodeList = async () => {
    try {
      setEpisodesLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch("http://localhost:8080/api/contents/" + contentId + "/episodes", {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) { alert("백엔드 통신 실패(에피소드 목록)"); return }
      const data = await response.json()
      setEpisodes(Array.isArray(data) ? data : (data.content ? data.content : []))
    } catch (error) {
      console.error("에피소드 목록 불러오기 실패 : ", error)
    } finally {
      setEpisodesLoading(false)
    }
  }

  useEffect(() => {
    loadContentDetail()
    loadEpisodeList()
  }, [contentId])

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
  }

  const typeLabel = (type) => {
    switch (type) {
      case "WEBTOON": return "웹툰"
      case "NOVEL": return "웹소설"
      default: return "기타"
    }
  }

  const handleEpisodeClick = (episodeId) => {
    if (content.type === "WEBTOON") navigate(`/webtoon/viewer/${episodeId}`)
    else if (content.type === "NOVEL") navigate(`/novel/viewer/${episodeId}`)
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.heroBanner}>
          <div className={styles.thumbnail}>
            {content.thumbnailUrl && <img src={content.thumbnailUrl} alt="thumbnail" className={styles.thumbnailImg} />}
          </div>
          <div>
            <div className={styles.contentMeta}>
              {typeLabel(content.type)}
              {content.genre ? ` · ${content.genre}` : ""}
              {content.serialDay ? ` · ${content.serialDay} 연재` : ""}
            </div>
            <div className={styles.contentTitle}>{content.title}</div>
            <div className={styles.contentStats}>
              {content.rating != null ? `★ ${content.rating.toFixed(1)}` : ""}
              {content.viewCount != null ? ` · 조회수 ${content.viewCount >= 10000 ? `${(content.viewCount / 10000).toFixed(1)}만` : content.viewCount.toLocaleString()}` : ""}
            </div>
          </div>
        </div>

        <div className={styles.actionSection}>
          <div className={styles.actionBtns}>
            <button onClick={() => setLiked(!liked)} className={`${styles.actionBtn} ${liked ? styles.actionBtnLiked : ""}`}>{liked ? "♥ 찜됨" : "♡ 찜하기"}</button>
            <button className={styles.actionBtn}>★ 별점</button>
            <button className={styles.actionBtn}>공유</button>
            <button
              onClick={() => episodes.length > 0 && navigate(`/webtoon/viewer/${episodes[0].episodeId}`)}
              disabled={episodes.length === 0}
              className={styles.firstEpBtn}
            >첫화 보기</button>
          </div>
          <div className={styles.summary}>{content.summary || content.description || "작품 소개가 없습니다."}</div>
        </div>

        <div className={styles.tabGroup}>
          {["회차목록", "댓글"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}>{t}</button>
          ))}
        </div>

        {tab === "회차목록" && (
          episodesLoading
            ? <div className={styles.emptyMsg}>회차 불러오는 중...</div>
            : episodes.length === 0
              ? <div className={styles.emptyMsg}>등록된 회차가 없습니다.</div>
              : episodes.map(ep => (
                <div key={ep.episodeId} className={styles.episodeRow} onClick={() => handleEpisodeClick(ep.episodeId)}>
                  <div>
                    <div className={styles.epNum}>{ep.episodeNumber}화</div>
                    <div className={styles.epTitle}>{ep.episodeTitle}</div>
                  </div>
                  <div className={styles.epRight}>
                    {ep.isFree
                      ? <span className={styles.badgeFree}>무료</span>
                      : <span className={styles.badgePaid}>유료</span>}
                    <span className={styles.epDate}>{formatDate(ep.createdAt)}</span>
                  </div>
                </div>
              ))
        )}

        {tab === "댓글" && (
          <div className={styles.commentSection}>
            <div className={styles.commentInput}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="댓글을 입력하세요" className={styles.input} />
              <button className={styles.submitBtn}>등록</button>
            </div>
            {comments.map((cm, i) => (
              <div key={i} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar} />
                  <span className={styles.commentUser}>{cm.user}</span>
                  <span className={styles.commentDate}>{cm.date}</span>
                </div>
                <div className={styles.commentText}>{cm.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
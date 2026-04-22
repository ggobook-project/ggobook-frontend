import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "../styles/WebtoonViewerPage.module.css"

export default function WebtoonViewerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get("contentId")
  const { episodeId } = useParams()

  // ── 원격(API) 상태 ──
  const [episode, setEpisode] = useState(null)
  const [comicToons, setComicToons] = useState([])
  const [loading, setLoading] = useState(true)

  // ── 기존 UI 상태 ──
  const [myRating, setMyRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [tempRating, setTempRating] = useState(1)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(10303)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([
    { id: 1, user: "독자1", text: "재밌어요!", date: "04.13", isMine: false },
    { id: 2, user: "독자2", text: "다음화 빨리요~", date: "04.12", isMine: false },
  ])
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const [epOffset, setEpOffset] = useState(0)

  const [avgRating, setAvgRating] = useState(0)

  const isLoggedIn = !!localStorage.getItem("accessToken")
  const currentUser = "나"

  const getUserId = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || payload.id || payload.sub
    } catch { return null }
  }

  const loadAverageRating = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `http://localhost:8080/api/ratings/${contentId}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return
      const avg = await response.json()
      setAvgRating(avg || 0)
    } catch (error) {
      console.error("평균 평점 로드 실패 : ", error)
    }
  }

  const loadMyRating = async () => {
    const userId = getUserId()
    if (!userId) return
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `http://localhost:8080/api/ratings/${contentId}/users/${userId}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return
      const data = await response.json()
      if (data?.score) {
        setMyRating(data.score)
        setTempRating(data.score)
      }
    } catch (error) {
      console.error("내 평점 로드 실패 : ", error)
    }
  }

  const allEpisodes = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1, num: `${i + 1}화`, thumb: null,
    current: i + 1 === parseInt(episodeId)
  }))
  const visibleCount = 5
  const maxOffset = Math.max(0, allEpisodes.length - visibleCount)
  const visibleEpisodes = allEpisodes.slice(epOffset, epOffset + visibleCount)

  // ── API 호출 ──
  const loadEpisodeDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`http://localhost:8080/api/episodes/${episodeId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    if (contentId) {
      loadAverageRating()
      loadMyRating()
    }
  }, [episode])

  const goContentDetail = () => {
    if (contentId) {
      navigate(`/contents/${contentId}`)
    } else {
      navigate(-1)
    }
  }

  // ── 핸들러 ──
  const handleLike = () => {
    if (!isLoggedIn) { navigate("/login"); return }
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleCommentSubmit = () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!comment.trim()) return
    setComments([{ id: Date.now(), user: currentUser, text: comment, date: "방금", isMine: true }, ...comments])
    setComment("")
  }

  const handleDelete = (id) => setComments(comments.filter(c => c.id !== id))

  const handleEditStart = (cm) => { setEditingId(cm.id); setEditText(cm.text) }

  const handleEditSubmit = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, text: editText } : c))
    setEditingId(null)
    setEditText("")
  }

  const handleRatingConfirm = async () => {
    const userId = getUserId()
    if (!userId) { navigate("/login"); return }
    try {
      const token = localStorage.getItem('accessToken')
      const rating = { score: tempRating }
      const response = await fetch(
        `http://localhost:8080/api/ratings/${contentId}?userId=${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(rating)
        }
      )
      if (response.ok) {
        setMyRating(tempRating)
        setShowRatingModal(false)
        loadAverageRating() // 평균 평점 갱신
      } else {
        alert("별점 저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("별점 저장 실패 : ", error)
    }
  }

  // ── 로딩 / 에러 ──
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

      {/* 상단 바 */}
      <div className={styles.topBar}>
        <button className={styles.topBtn} onClick={goContentDetail}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <span className={styles.topTitle}>
          {episode.episodeTitle || `${episode.episodeNumber}화`}
        </span>
        <span className={styles.topPage}>{episode.episodeNumber}화</span>
      </div>

      {/* 컨텐츠 (실제 이미지) */}
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

        {/* 에피소드 네비게이터 */}
        <div className={styles.episodeNav}>
          <button
            className={styles.epNavArrow}
            onClick={() => setEpOffset(Math.max(0, epOffset - 1))}
            disabled={epOffset === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className={styles.epNavList}>
            {visibleEpisodes.map(ep => (
              <div
                key={`${epOffset}-${ep.id}`}
                className={`${styles.epNavItem} ${ep.current ? styles.epNavItemCurrent : ""}`}
                onClick={() => !ep.current && navigate(`/webtoon/viewer/${ep.id}`)}
              >
                <div className={styles.epNavThumb}>
                  {ep.thumb
                    ? <img src={ep.thumb} alt={ep.num} className={styles.epNavThumbImg} />
                    : <div className={styles.epNavThumbPlaceholder} />}
                </div>
                <div className={styles.epNavNum}>{ep.num}</div>
              </div>
            ))}
          </div>
          <button
            className={styles.epNavArrow}
            onClick={() => setEpOffset(Math.min(maxOffset, epOffset + 1))}
            disabled={epOffset >= maxOffset}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* 액션 바 */}
        <div className={styles.actionBar}>
          <button className={styles.actionItem} onClick={() => setShowRatingModal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={myRating > 0 ? "#2196F3" : "none"}
              stroke={myRating > 0 ? "#2196F3" : "#90A4C8"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className={styles.actionLabel}>{avgRating.toFixed(1)}</span>
            <span className={styles.actionSub}>평균 별점</span>
          </button>

          <div className={styles.actionDivider} />

          <button className={styles.actionItem} onClick={handleLike}>
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={liked ? "#E53935" : "none"}
              stroke={liked ? "#E53935" : "#90A4C8"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className={styles.actionLabel}>좋아요</span>
            <span className={styles.actionSub}>{likeCount.toLocaleString()}</span>
          </button>

          <div className={styles.actionDivider} />

          <button className={styles.actionItem} onClick={async () => {
            await navigator.clipboard.writeText(window.location.href)
            alert("URL이 복사되었습니다.")
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span className={styles.actionLabel}>공유하기</span>
          </button>
        </div>

        {/* 별점 모달 */}
        {showRatingModal && (
          <div className={styles.modalOverlay} onClick={() => setShowRatingModal(false)}>
            <div className={styles.ratingModal} onClick={e => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setShowRatingModal(false)}>✕</button>
              <div className={styles.ratingModalScore}>{tempRating || "?"}</div>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={styles.starBtn}
                    onMouseEnter={() => setHoverStar(n)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setTempRating(n)}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24"
                      fill={(hoverStar || tempRating) >= n ? "#2196F3" : "none"}
                      stroke={(hoverStar || tempRating) >= n ? "#2196F3" : "#BBDEFB"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className={styles.ratingModalHint}>별을 클릭하세요.</div>
              <button className={styles.ratingConfirmBtn} onClick={handleRatingConfirm} disabled={tempRating === 0}>확인</button>
              <button className={styles.ratingCancelBtn} onClick={() => setShowRatingModal(false)}>취소</button>
            </div>
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className={styles.commentSection}>
          <div className={styles.sectionTitle}>댓글 {comments.length}</div>
          <div className={styles.commentInputRow}>
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCommentSubmit()}
              onFocus={() => !isLoggedIn && navigate("/login")}
              placeholder={isLoggedIn ? "댓글을 입력하세요" : "로그인 후 댓글을 작성할 수 있습니다"}
              className={styles.commentInput}
              readOnly={!isLoggedIn}
            />
            <button className={styles.commentSubmit} onClick={handleCommentSubmit}>등록</button>
          </div>
          <div className={styles.commentList}>
            {comments.map((cm) => (
              <div key={cm.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar} />
                  <span className={styles.commentUser}>{cm.user}</span>
                  <span className={styles.commentDate}>{cm.date}</span>
                  {cm.isMine && editingId !== cm.id && (
                    <div className={styles.commentActions}>
                      <button className={styles.commentActionBtn} onClick={() => handleEditStart(cm)}>수정</button>
                      <button className={`${styles.commentActionBtn} ${styles.commentDeleteBtn}`} onClick={() => handleDelete(cm.id)}>삭제</button>
                    </div>
                  )}
                </div>
                {editingId === cm.id ? (
                  <div className={styles.editRow}>
                    <input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className={styles.editInput}
                      onKeyDown={e => e.key === "Enter" && handleEditSubmit(cm.id)}
                    />
                    <button className={styles.editSubmit} onClick={() => handleEditSubmit(cm.id)}>완료</button>
                    <button className={styles.editCancel} onClick={() => setEditingId(null)}>취소</button>
                  </div>
                ) : (
                  <div className={styles.commentText}>{cm.text}</div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
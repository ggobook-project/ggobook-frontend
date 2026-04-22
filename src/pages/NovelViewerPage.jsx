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

  // ── UI 상태 ──
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

  const avgRating = 4.2
  const totalRating = 128
  const isLoggedIn = !!localStorage.getItem("accessToken")
  const currentUser = "나"

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

  const handleRatingConfirm = () => {
    setMyRating(tempRating)
    setShowRatingModal(false)
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
        <button className={styles.topBtn}>설정</button>
      </div>

      {/* 본문 */}
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

      {/* TTS + 이전/다음 하단 바 */}
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
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    이전화
  </button>
  <button
    className={styles.listBtn}
    onClick={goContentDetail}
  >
    목록
  </button>
  <button
    className={styles.nextBtn}
    onClick={() => navigate(`/novel/viewer/${parseInt(episodeId) + 1}`)}
  >
    다음화
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
</div>
        </div>
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
          <span className={styles.actionSub}>{totalRating}명 참여</span>
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
  )
}
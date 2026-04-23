import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef, useCallback } from "react"
import styles from "../styles/NovelViewerPage.module.css"

export default function NovelViewerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get("contentId")
  const { episodeId } = useParams()
  const [playing, setPlaying] = useState(false)

  const [episode, setEpisode] = useState(null)
  const [novel, setNovel] = useState(null)
  const [loading, setLoading] = useState(true)

  const [myRating, setMyRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [tempRating, setTempRating] = useState(1)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(10303)
  const [avgRating, setAvgRating] = useState(4.2)

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([
    { id: 1, user: "독자1", text: "재밌어요!", date: "04.13", isMine: false, replies: [], likes: 12, dislikes: 1, myLike: null },
    { id: 2, user: "독자2", text: "다음화 빨리요~", date: "04.12", isMine: false, replies: [
      { id: 21, user: "독자3", text: "저도요!", date: "04.12", isMine: false, likes: 3, dislikes: 0, myLike: null }
    ], likes: 5, dislikes: 0, myLike: null },
  ])
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [editingReply, setEditingReply] = useState(null)
  const [editReplyText, setEditReplyText] = useState("")
  const [expandedReplies, setExpandedReplies] = useState({})
  const [openMoreId, setOpenMoreId] = useState(null)
  const [openMoreReplyId, setOpenMoreReplyId] = useState(null)

  const [commentPage, setCommentPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const observerRef = useRef(null)
  const COMMENTS_PER_PAGE = 5

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

  const loadEpisodeDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:8080/api/episodes/${episodeId}`, {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
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

  const loadAverageRating = async () => {
    if (!contentId) return
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:8080/api/ratings/${contentId}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) return
      const avg = await response.json()
      setAvgRating(avg || 0)
    } catch (error) { console.error("평균 평점 로드 실패 : ", error) }
  }

  const loadMyRating = async () => {
    const userId = getUserId()
    if (!userId || !contentId) return
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:8080/api/ratings/${contentId}/users/${userId}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      if (data?.score) { setMyRating(data.score); setTempRating(data.score) }
    } catch (error) { console.error("내 평점 로드 실패 : ", error) }
  }

  useEffect(() => { loadEpisodeDetail() }, [episodeId])
  useEffect(() => { if (contentId) { loadAverageRating(); loadMyRating() } }, [episode])

  useEffect(() => {
    const handleClick = () => { setOpenMoreId(null); setOpenMoreReplyId(null) }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasMoreComments) setCommentPage(prev => prev + 1)
  }, [hasMoreComments])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 })
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  useEffect(() => {
    if (commentPage * COMMENTS_PER_PAGE >= comments.length) setHasMoreComments(false)
  }, [commentPage, comments])

  const visibleComments = comments.slice(0, commentPage * COMMENTS_PER_PAGE)

  const goContentDetail = () => {
    if (contentId) navigate(`/contents/${contentId}`)
    else if (episode?.content?.contentId) navigate(`/contents/${episode.content.contentId}`)
    else navigate(-1)
  }

  const paragraphs = novel?.contentText
    ? novel.contentText.split("\n").filter(p => p.trim() !== "")
    : []

  const handleLike = () => {
    if (!isLoggedIn) { navigate("/login"); return }
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleCommentSubmit = () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!comment.trim()) return
    setComments([
      { id: Date.now(), user: currentUser, text: comment, date: "방금", isMine: true, replies: [], likes: 0, dislikes: 0, myLike: null },
      ...comments
    ])
    setComment("")
    setHasMoreComments(true)
  }

  const handleDelete = (id) => setComments(comments.filter(c => c.id !== id))
  const handleEditStart = (cm) => { setEditingId(cm.id); setEditText(cm.text) }
  const handleEditSubmit = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, text: editText } : c))
    setEditingId(null); setEditText("")
  }

  const handleReplySubmit = (commentId) => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!replyText.trim()) return
    setComments(comments.map(c =>
      c.id === commentId
        ? { ...c, replies: [...(c.replies || []), { id: Date.now(), user: currentUser, text: replyText, date: "방금", isMine: true, likes: 0, dislikes: 0, myLike: null }] }
        : c
    ))
    setReplyText("")
    setReplyingId(null)
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }))
  }

  const handleReplyDelete = (commentId, replyId) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c
    ))
  }

  const handleReplyEditStart = (commentId, reply) => {
    setEditingReply({ commentId, replyId: reply.id })
    setEditReplyText(reply.text)
  }

  const handleReplyEditSubmit = (commentId, replyId) => {
    setComments(comments.map(c =>
      c.id === commentId
        ? { ...c, replies: c.replies.map(r => r.id === replyId ? { ...r, text: editReplyText } : r) }
        : c
    ))
    setEditingReply(null); setEditReplyText("")
  }

  const toggleReplies = (commentId) => {
    const isExpanded = expandedReplies[commentId]
    setExpandedReplies(prev => ({ ...prev, [commentId]: !isExpanded }))
    if (!isExpanded) setReplyingId(commentId)
    else { setReplyingId(null); setReplyText("") }
  }

  const handleCommentLike = (id, type) => {
    setComments(comments.map(c => {
      if (c.id !== id) return c
      if (c.myLike === type) return {
        ...c, myLike: null,
        likes: type === "like" ? c.likes - 1 : c.likes,
        dislikes: type === "dislike" ? c.dislikes - 1 : c.dislikes
      }
      return {
        ...c, myLike: type,
        likes: type === "like" ? c.likes + 1 : c.myLike === "like" ? c.likes - 1 : c.likes,
        dislikes: type === "dislike" ? c.dislikes + 1 : c.myLike === "dislike" ? c.dislikes - 1 : c.dislikes
      }
    }))
  }

  const handleReplyLike = (commentId, replyId, type) => {
    setComments(comments.map(c => {
      if (c.id !== commentId) return c
      return {
        ...c, replies: c.replies.map(r => {
          if (r.id !== replyId) return r
          if (r.myLike === type) return {
            ...r, myLike: null,
            likes: type === "like" ? r.likes - 1 : r.likes,
            dislikes: type === "dislike" ? r.dislikes - 1 : r.dislikes
          }
          return {
            ...r, myLike: type,
            likes: type === "like" ? r.likes + 1 : r.myLike === "like" ? r.likes - 1 : r.likes,
            dislikes: type === "dislike" ? r.dislikes + 1 : r.myLike === "dislike" ? r.dislikes - 1 : r.dislikes
          }
        })
      }
    }))
  }

  const handleRatingConfirm = async () => {
    const userId = getUserId()
    if (!userId) { navigate("/login"); return }
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:8080/api/ratings/${contentId}?userId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ score: tempRating })
      })
      if (response.ok) {
        setMyRating(tempRating)
        setShowRatingModal(false)
        setAvgRating(prev => Math.round(((prev + tempRating) / 2) * 10) / 10)
        loadAverageRating()
      } else alert("별점 저장에 실패했습니다.")
    } catch (error) { console.error("별점 저장 실패 : ", error) }
  }

  if (loading) return <div className={styles.pageWrapper}><div className={styles.loading}>불러오는 중...</div></div>
  if (!episode) return null

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topBar}>
        <button className={styles.topBtn} onClick={goContentDetail}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <span className={styles.topTitle}>{episode.episodeTitle || `${episode.episodeNumber}화`}</span>
        <button className={styles.topBtn}>설정</button>
      </div>

      <div className={styles.content}>
        <div className={styles.chapterLabel}>— {episode.episodeNumber}화 —</div>
        {paragraphs.length > 0
          ? paragraphs.map((p, i) => <p key={i} className={styles.paragraph}>{p}</p>)
          : <div className={styles.emptyMsg}>본문이 없습니다.</div>
        }
        {episode.aiSummary && (
          <div className={styles.aiSummary}>
            <div className={styles.aiSummaryLabel}>AI 요약</div>
            <div className={styles.aiSummaryText}>{episode.aiSummary}</div>
          </div>
        )}
      </div>

      {/* TTS + 이전/다음 */}
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
            <button className={styles.prevBtn} onClick={() => navigate(`/novel/viewer/${parseInt(episodeId) - 1}`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              이전화
            </button>
            <button className={styles.listBtn} onClick={goContentDetail}>목록</button>
            <button className={styles.nextBtn} onClick={() => navigate(`/novel/viewer/${parseInt(episodeId) + 1}`)}>
              다음화
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* 액션 바 */}
      <div className={styles.actionBar}>
        <button className={styles.actionItem} onClick={() => setShowRatingModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={myRating > 0 ? "#2196F3" : "none"} stroke={myRating > 0 ? "#2196F3" : "#90A4C8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className={styles.actionLabel}>{avgRating.toFixed(1)}</span>
          <span className={styles.actionSub}>평균 별점</span>
        </button>
        <div className={styles.actionDivider} />
        <button className={styles.actionItem} onClick={handleLike}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "#E53935" : "none"} stroke={liked ? "#E53935" : "#90A4C8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className={styles.actionLabel}>좋아요</span>
          <span className={styles.actionSub}>{likeCount.toLocaleString()}</span>
        </button>
        <div className={styles.actionDivider} />
        <button className={styles.actionItem} onClick={async () => { await navigator.clipboard.writeText(window.location.href); alert("URL이 복사되었습니다.") }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className={styles.actionLabel}>공유하기</span>
        </button>
      </div>

      {/* 별점 모달 */}
      {showRatingModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRatingModal(false)}>
          <div className={styles.ratingModal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowRatingModal(false)}>✕</button>
            <div className={styles.ratingModalScore}>{tempRating || ""}</div>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className={styles.starBtn} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)} onClick={() => setTempRating(n)}>
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
          <div className={styles.commentAvatar} />
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
          {visibleComments.map((cm) => (
            <div key={cm.id} className={styles.commentItem}>

              {/* 댓글 헤더 */}
              <div className={styles.commentHeader}>
                <div className={styles.commentAvatar} />
                <div className={styles.commentMeta}>
                  <span className={styles.commentUser}>{cm.user}</span>
                  <span className={styles.commentDate}>{cm.date}</span>
                </div>
                {cm.isMine && editingId !== cm.id && (
                  <div style={{ marginLeft: "auto", position: "relative" }}>
                    <button
                      className={styles.moreBtn}
                      onClick={e => { e.stopPropagation(); setOpenMoreId(openMoreId === cm.id ? null : cm.id) }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {openMoreId === cm.id && (
                      <div className={styles.moreMenu}>
                        <button className={`${styles.moreMenuItem} ${styles.moreMenuItemEdit}`} onClick={() => { handleEditStart(cm); setOpenMoreId(null) }}>수정</button>
                        <button className={`${styles.moreMenuItem} ${styles.moreMenuItemDelete}`} onClick={() => { handleDelete(cm.id); setOpenMoreId(null) }}>삭제</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 댓글 내용 */}
              {editingId === cm.id ? (
                <div className={styles.editRow}>
                  <input value={editText} onChange={e => setEditText(e.target.value)} className={styles.editInput} onKeyDown={e => e.key === "Enter" && handleEditSubmit(cm.id)} />
                  <button className={styles.editSubmit} onClick={() => handleEditSubmit(cm.id)}>완료</button>
                  <button className={styles.editCancel} onClick={() => setEditingId(null)}>취소</button>
                </div>
              ) : (
                <div className={styles.commentBody}>
                  <div className={styles.commentText}>{cm.text}</div>
                  <div className={styles.commentBottomRow}>
                    <button className={styles.replyToggleBtn} onClick={() => toggleReplies(cm.id)}>
                      {expandedReplies[cm.id]
                        ? cm.replies?.length > 0 ? `답글 ${cm.replies.length}개` : `답글`
                        : cm.replies?.length > 0 ? `답글 ${cm.replies.length}개` : `답글`
                      }
                    </button>
                    <div className={styles.commentReactions}>
                      <button
                        className={`${styles.reactionBtn} ${cm.myLike === "like" ? styles.reactionBtnActive : ""}`}
                        onClick={() => handleCommentLike(cm.id, "like")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={cm.myLike === "like" ? "#2196F3" : "none"} stroke={cm.myLike === "like" ? "#2196F3" : "#90A4C8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 10v12" /><path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                        </svg>
                        <span>{cm.likes}</span>
                      </button>
                      <button
                        className={`${styles.reactionBtn} ${cm.myLike === "dislike" ? styles.reactionBtnDisactive : ""}`}
                        onClick={() => handleCommentLike(cm.id, "dislike")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={cm.myLike === "dislike" ? "#E53935" : "none"} stroke={cm.myLike === "dislike" ? "#E53935" : "#90A4C8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 14V2" /><path d="M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                        </svg>
                        <span>{cm.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 답글 목록 */}
              {expandedReplies[cm.id] && cm.replies?.length > 0 && (
                <div className={styles.replyList}>
                  {cm.replies.map(reply => (
                    <div key={reply.id} className={styles.replyItem}>
                      <div className={styles.replyArrow}>↳</div>
                      <div className={styles.replyContent}>
                        <div className={styles.commentHeader}>
                          <div className={styles.replyAvatar} />
                          <div className={styles.commentMeta}>
                            <span className={styles.commentUser}>{reply.user}</span>
                            <span className={styles.commentDate}>{reply.date}</span>
                          </div>
                          {reply.isMine && !(editingReply?.replyId === reply.id) && (
                            <div style={{ marginLeft: "auto", position: "relative" }}>
                              <button
                                className={styles.moreBtn}
                                onClick={e => { e.stopPropagation(); setOpenMoreReplyId(openMoreReplyId === reply.id ? null : reply.id) }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="12" cy="5" r="1.5" />
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="12" cy="19" r="1.5" />
                                </svg>
                              </button>
                              {openMoreReplyId === reply.id && (
                                <div className={styles.moreMenu}>
                                  <button className={`${styles.moreMenuItem} ${styles.moreMenuItemEdit}`} onClick={() => { handleReplyEditStart(cm.id, reply); setOpenMoreReplyId(null) }}>수정</button>
                                  <button className={`${styles.moreMenuItem} ${styles.moreMenuItemDelete}`} onClick={() => { handleReplyDelete(cm.id, reply.id); setOpenMoreReplyId(null) }}>삭제</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {editingReply?.replyId === reply.id ? (
                          <div className={styles.editRow}>
                            <input value={editReplyText} onChange={e => setEditReplyText(e.target.value)} className={styles.editInput} onKeyDown={e => e.key === "Enter" && handleReplyEditSubmit(cm.id, reply.id)} />
                            <button className={styles.editSubmit} onClick={() => handleReplyEditSubmit(cm.id, reply.id)}>완료</button>
                            <button className={styles.editCancel} onClick={() => setEditingReply(null)}>취소</button>
                          </div>
                        ) : (
                          <div className={styles.commentBody}>
                            <div className={styles.commentText}>{reply.text}</div>
                            <div className={styles.commentBottomRow}>
                              <div />
                              <div className={styles.commentReactions}>
                                <button
                                  className={`${styles.reactionBtn} ${reply.myLike === "like" ? styles.reactionBtnActive : ""}`}
                                  onClick={() => handleReplyLike(cm.id, reply.id, "like")}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill={reply.myLike === "like" ? "#2196F3" : "none"} stroke={reply.myLike === "like" ? "#2196F3" : "#90A4C8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 10v12" /><path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                                  </svg>
                                  <span>{reply.likes}</span>
                                </button>
                                <button
                                  className={`${styles.reactionBtn} ${reply.myLike === "dislike" ? styles.reactionBtnDisactive : ""}`}
                                  onClick={() => handleReplyLike(cm.id, reply.id, "dislike")}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill={reply.myLike === "dislike" ? "#E53935" : "none"} stroke={reply.myLike === "dislike" ? "#E53935" : "#90A4C8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 14V2" /><path d="M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                                  </svg>
                                  <span>{reply.dislikes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 답글 입력 */}
              {replyingId === cm.id && (
                <div className={styles.replyInputRow}>
                  <div className={styles.replyArrow}>↳</div>
                  <div className={styles.replyAvatar} />
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleReplySubmit(cm.id)}
                    placeholder="답글을 입력하세요"
                    className={styles.commentInput}
                    autoFocus
                  />
                  <button className={styles.commentSubmit} onClick={() => handleReplySubmit(cm.id)}>등록</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div ref={observerRef} className={styles.commentObserver}>
          {hasMoreComments && <span className={styles.commentObserverText}>댓글 더 불러오는 중...</span>}
          {!hasMoreComments && comments.length > 0 && <span className={styles.commentObserverText}>모든 댓글을 불러왔습니다.</span>}
        </div>
      </div>
    </div>
  )
}
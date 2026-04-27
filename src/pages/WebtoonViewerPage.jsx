import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react"
import api from "../api/axios" 
import styles from "../styles/WebtoonViewerPage.module.css"

export default function WebtoonViewerPage() {
  // ==========================================
  // 1. 라우터 및 기본 설정
  // ==========================================
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get("contentId")
  const focusCommentId = searchParams.get("focusComment");
  const savedProgress = parseInt(searchParams.get("progress") || "0", 10);
  const { episodeId } = useParams()

  const isLoggedIn = !!localStorage.getItem("accessToken")
  const currentUser = "나"
  const COMMENTS_PER_PAGE = 5

  // ==========================================
  // 2. 상태 관리 (State & Ref)
  // ==========================================
  const progressRef = useRef(0) 
  const observerRef = useRef(null)

  const [episode, setEpisode] = useState(null)
  const [comicToons, setComicToons] = useState([])
  const [loading, setLoading] = useState(true)
  const [epOffset, setEpOffset] = useState(0)

  const [myRating, setMyRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [tempRating, setTempRating] = useState(1)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0) 
  const [avgRating, setAvgRating] = useState(0)

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([]);
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

  const [isReady, setIsReady] = useState(false);

  // ==========================================
  // 3. 헬퍼 함수
  // ==========================================
  const getUserId = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId || payload.id || payload.sub
    } catch { return null }
  }

  const allEpisodes = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1, num: `${i + 1}화`, thumb: null,
    current: i + 1 === parseInt(episodeId)
  }))
  const visibleCount = 5
  const maxOffset = Math.max(0, allEpisodes.length - visibleCount)
  const visibleEpisodes = allEpisodes.slice(epOffset, epOffset + visibleCount)
  const visibleComments = comments.slice(0, commentPage * COMMENTS_PER_PAGE)

  // ==========================================
  // 4. API 통신 함수
  // ==========================================
  const recordRecentView = async (finalProgress) => {
    if (!isLoggedIn || !contentId || !episodeId) return;
    try {
      await api.post("/api/recent-views", {
        contentId: Number(contentId),
        episodeId: Number(episodeId),
        progress: finalProgress
      });
    } catch (error) {
      console.error("최근 본 작품 저장 실패:", error);
    }
  };

  const loadEpisodeDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/episodes/${episodeId}`);
      setEpisode(response.data);
      setLikeCount(response.data.likeCount || 0);

      const userId = getUserId();
      if (userId) {
        const likeStatusRes = await api.get(`/api/episodes/${episodeId}/is-liked`);
        setLiked(likeStatusRes.data); 
      }

      const sorted = (response.data.comicToons || []).sort((a, b) => a.imageOrder - b.imageOrder);
      setComicToons(sorted);
    } catch (error) {
      console.error("회차 상세 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  const loadAverageRating = async () => {
    try {
      const response = await api.get(`/api/ratings/${contentId}`);
      setAvgRating(response.data || 0)
    } catch (error) { console.error("평균 평점 로드 실패:", error) }
  }

  const loadMyRating = async () => {
    const userId = getUserId()
    if (!userId) return
    try {
      const response = await api.get(`/api/ratings/${contentId}/users/${userId}`);
      if (response.data?.score) { setMyRating(response.data.score); setTempRating(response.data.score) }
    } catch (error) { console.error("내 평점 로드 실패:", error) }
  }

  const loadComments = async () => {
    try {
      const response = await api.get(`/api/episodes/${episodeId}/comments`);
      const serverComments = response.data.content || [];
      const mappedComments = serverComments.map(cm => ({
        id: cm.commentId,
        user: `독자${cm.userId}`, 
        text: cm.commentText,
        date: cm.createdAt ? cm.createdAt.split('T')[0] : "방금", 
        isMine: cm.userId === getUserId(), 
        likes: cm.likeCount || 0,
        dislikes: cm.dislikeCount || 0,
        myLike: cm.myReaction ? cm.myReaction.toLowerCase() : null, // 🌟 백엔드 상태 연결
        replies: (cm.replies || []).map(r => ({
          id: r.replyId,
          user: `독자${r.userId}`,
          text: r.replyText,
          date: r.createdAt ? r.createdAt.split('T')[0] : "방금",
          isMine: r.userId === getUserId(),
          likes: r.likeCount || 0,
          dislikes: r.dislikeCount || 0,
          myLike: r.myReaction ? r.myReaction.toLowerCase() : null // 🌟 백엔드 상태 연결
        }))
      }));
      setComments(mappedComments);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };

  // ==========================================
  // 5. 컴포넌트 생명주기
  // ==========================================
  useEffect(() => { 
    loadEpisodeDetail();
    loadComments(); 
    recordRecentView(0); 

    return () => {
      recordRecentView(progressRef.current); 
    };
  }, [episodeId, contentId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight <= clientHeight) return; 

      const currentProgress = Math.floor((scrollTop / (scrollHeight - clientHeight)) * 100);
      progressRef.current = Math.min(100, Math.max(0, currentProgress));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (!focusCommentId && savedProgress === 0) {
      setIsReady(true);
      return;
    }

    if (comicToons.length === 0 && comments.length === 0) return;

    if (focusCommentId && comments.length > 0) {
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(`comment-${focusCommentId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "auto", block: "center" });
          targetElement.style.transition = "background-color 0.5s";
          targetElement.style.backgroundColor = "rgba(33, 150, 243, 0.1)"; 
          setTimeout(() => {
            if (targetElement) targetElement.style.backgroundColor = "transparent";
          }, 2000);
        }
        setIsReady(true);
      }, 150); 
      return () => clearTimeout(timer);
    } 
    else if (savedProgress > 0 && comicToons.length > 0 && !focusCommentId) {
      const timer = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const targetScrollTop = (scrollHeight - clientHeight) * (savedProgress / 100);
        
        window.scrollTo({ top: targetScrollTop, behavior: "auto" });
        setIsReady(true); 
      }, 150); 
      return () => clearTimeout(timer);
    }
  }, [comicToons, comments, focusCommentId, savedProgress]);

  useEffect(() => { 
    if (contentId) { loadAverageRating(); loadMyRating() } 
  }, [episode])

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

  // ==========================================
  // 6. 이벤트 핸들러 (수정 및 반응 API 완벽 매핑)
  // ==========================================
  const goContentDetail = () => {
    if (contentId) navigate(`/contents/${contentId}`)
    else navigate(-1)
  }

  const handleLike = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    try {
      await api.post(`/api/episodes/${episodeId}/likes`);
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error("회차 좋아요 처리 실패:", error);
    }
  }

  const handleRatingConfirm = async () => {
    const userId = getUserId()
    if (!userId) { navigate("/login"); return }
    try {
      const response = await api.post(`/api/ratings/${contentId}?userId=${userId}`, { score: tempRating });
      if (response.status === 200 || response.status === 201) {
        setMyRating(tempRating)
        setShowRatingModal(false)
        setAvgRating(prev => Math.round(((prev + tempRating) / 2) * 10) / 10)
        loadAverageRating()
      } else {
        alert("별점 저장에 실패했습니다.")
      }
    } catch (error) { console.error("별점 저장 실패:", error) }
  }

  const handleCommentSubmit = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!comment.trim()) return

    try {
      await api.post(`/api/episodes/${episodeId}/comments`, { commentText: comment, isSpoiler: false });
      setComment("");
      loadComments(); 
    } catch (error) {
      alert("댓글 등록 실패");
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/comments/${id}`);
      loadComments();
    } catch (error) {
      alert("댓글 삭제 실패");
    }
  }

  const handleEditStart = (cm) => { setEditingId(cm.id); setEditText(cm.text) }

  const handleEditSubmit = async (id) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/api/comments/${id}`, { commentText: editText });
      setEditingId(null); 
      setEditText("");
      loadComments();
    } catch (error) {
      alert("댓글 수정 실패");
    }
  }

  const handleReplySubmit = async (commentId) => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!replyText.trim()) return

    try {
      await api.post(`/api/comments/${commentId}/replies`, { replyText });
      setReplyText("");
      setReplyingId(null);
      setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
      loadComments(); 
    } catch (error) {
      alert("답글 등록 실패");
    }
  }

  const handleReplyDelete = async (commentId, replyId) => {
    if (!window.confirm("답글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/replies/${replyId}`);
      loadComments();
    } catch (error) {
      alert("답글 삭제 실패");
    }
  }

  const handleReplyEditStart = (commentId, reply) => {
    setEditingReply({ commentId, replyId: reply.id })
    setEditReplyText(reply.text)
  }

  // 🌟 [수정] 답글 수정: 백엔드 API 주소 일치
  const handleReplyEditSubmit = async (commentId, replyId) => {
    if (!editReplyText.trim()) return;
    try {
      await api.put(`/api/replies/${replyId}`, { replyText: editReplyText });
      setEditingReply(null); 
      setEditReplyText("");
      loadComments();
    } catch (error) {
      alert("답글 수정 실패");
    }
  }

  const toggleReplies = (commentId) => {
    const isExpanded = expandedReplies[commentId]
    setExpandedReplies(prev => ({ ...prev, [commentId]: !isExpanded }))
    if (!isExpanded) setReplyingId(commentId)
    else { setReplyingId(null); setReplyText("") }
  }

  const handleCommentLike = async (id, type) => {
    if (!isLoggedIn) { navigate("/login"); return }
    try {
      await api.post(`/api/comments/${id}/reactions`, { reactionType: type.toUpperCase() });
      
      setComments(comments.map(c => {
        if (c.id !== id) return c
        if (c.myLike === type) {
          return {
            ...c, myLike: null,
            likes: type === "like" ? c.likes - 1 : c.likes,
            dislikes: type === "dislike" ? c.dislikes - 1 : c.dislikes
          }
        }
        return {
          ...c, myLike: type,
          likes: type === "like" ? c.likes + 1 : (c.myLike === "like" ? c.likes - 1 : c.likes),
          dislikes: type === "dislike" ? c.dislikes + 1 : (c.myLike === "dislike" ? c.dislikes - 1 : c.dislikes)
        }
      }));
    } catch (error) {
      console.error("댓글 반응 실패:", error);
    }
  }

  // 🌟 [수정] 답글 반응: 백엔드 API 주소 일치
  const handleReplyLike = async (commentId, replyId, type) => {
    if (!isLoggedIn) { navigate("/login"); return }
    try {
      await api.post(`/api/replies/${replyId}/reactions`, { reactionType: type.toUpperCase() });
      
      setComments(comments.map(c => {
        if (c.id !== commentId) return c
        return {
          ...c, replies: c.replies.map(r => {
            if (r.id !== replyId) return r
            if (r.myLike === type) {
              return {
                ...r, myLike: null,
                likes: type === "like" ? r.likes - 1 : r.likes,
                dislikes: type === "dislike" ? r.dislikes - 1 : r.dislikes
              }
            }
            return {
              ...r, myLike: type,
              likes: type === "like" ? r.likes + 1 : (r.myLike === "like" ? r.likes - 1 : r.likes),
              dislikes: type === "dislike" ? r.dislikes + 1 : (r.myLike === "dislike" ? r.dislikes - 1 : r.dislikes)
            }
          })
        }
      }));
    } catch (error) {
      console.error("답글 반응 실패:", error);
    }
  }

  // ==========================================
  // 7. UI 렌더링 (View)
  // ==========================================
  if (loading) {
    return <div className={styles.pageWrapper}><div className={styles.loading}>불러오는 중...</div></div>;
  }
  
  if (!episode) return null;

  return (
    <div 
      className={styles.pageWrapper} 
      style={{ 
        opacity: isReady ? 1 : 0, 
        pointerEvents: isReady ? 'auto' : 'none',
        transition: "opacity 0.2s" 
      }}
    >
      <div className={styles.topBar}>
        <button className={styles.topBtn} onClick={goContentDetail}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <span className={styles.topTitle}>{episode.episodeTitle || `${episode.episodeNumber}화`}</span>
        <span className={styles.topPage}>{episode.episodeNumber}화</span>
      </div>

      <div className={styles.content}>
        {comicToons.length > 0
          ? comicToons.map((ct, index) => (
            <img key={ct.comicToonId || ct.id || index} src={ct.imageUrl} alt={`${ct.imageOrder}컷`} className={styles.panel} style={{ width: "100%", display: "block" }} />
          ))
          : <div className={styles.emptyMsg}>이미지가 없습니다.</div>
        }

        <div className={styles.episodeNav}>
          <button className={styles.epNavArrow} onClick={() => setEpOffset(Math.max(0, epOffset - 1))} disabled={epOffset === 0}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className={styles.epNavList}>
            {visibleEpisodes.map(ep => (
              <div key={`${epOffset}-${ep.id}`} className={`${styles.epNavItem} ${ep.current ? styles.epNavItemCurrent : ""}`} onClick={() => !ep.current && navigate(`/webtoon/viewer/${ep.id}?contentId=${contentId}`)}>
                <div className={styles.epNavThumb}>
                  {ep.thumb ? <img src={ep.thumb} alt={ep.num} className={styles.epNavThumbImg} /> : <div className={styles.epNavThumbPlaceholder} />}
                </div>
                <div className={styles.epNavNum}>{ep.num}</div>
              </div>
            ))}
          </div>
          <button className={styles.epNavArrow} onClick={() => setEpOffset(Math.min(maxOffset, epOffset + 1))} disabled={epOffset >= maxOffset}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

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
              <div key={cm.id} id={`comment-${cm.id}`} className={styles.commentItem}>

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
                          ? cm.replies?.length > 0 ? `답글 ${cm.replies.length}개` : `답글 `
                          : cm.replies?.length > 0 ? `답글 ${cm.replies.length}개` : `답글 `
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
    </div>
  )
}
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef, useCallback } from "react"
import api from "../api/axios" // 🌟 만능 요원 임포트 완료!
import styles from "../styles/NovelViewerPage.module.css"

export default function NovelViewerPage() {
  // ==========================================
  // 1. 라우터 및 기본 설정
  // ==========================================
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get("contentId")
  const { episodeId } = useParams()
  
  // 🌟 마이페이지에서 넘겨준 책갈피(progress) 장착
  const savedProgress = parseInt(searchParams.get("progress") || "0", 10)

  const isLoggedIn = !!localStorage.getItem("accessToken")
  const currentUser = "나"
  const COMMENTS_PER_PAGE = 5

  // ==========================================
  // 2. 상태 관리 (State & Ref)
  // ==========================================
  const progressRef = useRef(0) // 🌟 진행률 비밀 수첩
  const observerRef = useRef(null)
  const progressBarRef = useRef(null)
  const settingsPanelRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const [audioTime, setAudioTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [voices, setVoices] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [currentVoiceId, setCurrentVoiceId] = useState(null)
  const [pendingVoiceId, setPendingVoiceId] = useState(null)
  const speedBarRef = useRef(null)
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

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  // 본문 텍스트 단락 분리 로직 (위로 끌어올려 렌더링과 의존성 배열 모두에서 사용)
  const paragraphs = novel?.contentText
    ? novel.contentText.split("\n").filter(p => p.trim() !== "")
    : []

  const visibleComments = comments.slice(0, commentPage * COMMENTS_PER_PAGE)

  // ==========================================
  // 4. API 통신 함수 (fetch -> api 전면 교체)
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
      console.error("최근 본 작품 저장 실패 : ", error);
    }
  };

  const loadEpisodeDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/episodes/${episodeId}`)
      console.log("🎵 에피소드 데이터:", response.data)
      console.log("🎵 novel:", response.data.novel)
      console.log("🎵 ttsFileUrl:", response.data.novel?.ttsFileUrl)
      setEpisode(response.data)
      setNovel(response.data.novel || null)
    } catch (error) {
      console.error("회차 상세 불러오기 실패 : ", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAverageRating = async () => {
    if (!contentId) return
    try {
      const response = await api.get(`/api/ratings/${contentId}`)
      setAvgRating(response.data || 0)
    } catch (error) { console.error("평균 평점 로드 실패 : ", error) }
  }

  const loadMyRating = async () => {
    const userId = getUserId()
    if (!userId || !contentId) return
    try {
      const response = await api.get(`/api/ratings/${contentId}/users/${userId}`)
      
      // Axios는 response.data 에 빈 값이 와도 에러가 터지지 않습니다.
      if (response.data && response.data.score) { 
        setMyRating(response.data.score); 
        setTempRating(response.data.score); 
      }
    } catch (error) { 
      console.error("내 평점 로드 실패 : ", error) 
    }
  }

  // ==========================================
  // 5. 컴포넌트 생명주기 (useEffect)
  // ==========================================
  
  // 🌟 5-1. 스크롤 감지 및 진행률 계산
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

  // 🌟 5-2. 화면 진입 시 데이터 로딩 & 퇴장 시 진행률 저장
  useEffect(() => { 
    loadEpisodeDetail();
    recordRecentView(0); // 입장 출석체크

    return () => {
      recordRecentView(progressRef.current); // 퇴장 시 최종 진행률 저장
    };
  }, [episodeId, contentId]);

  // 🌟 5-3. 자동 스크롤 로직 (책갈피 순간이동)
  useEffect(() => {
    // 텍스트 단락이 렌더링되었고 진행률이 0보다 클 때
    if (paragraphs.length > 0 && savedProgress > 0) {
      const timer = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const targetScrollTop = (scrollHeight - clientHeight) * (savedProgress / 100);
        
        window.scrollTo({
          top: targetScrollTop,
          behavior: "auto" // 스르륵 현상 방지
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [paragraphs.length, savedProgress]);

  // 5-4. TTS 오디오 초기화 (novel.ttsFileUrl 변경 시)
  useEffect(() => {
    const url = episode?.novel?.ttsFileUrl
    if (!url) return

    const audio = new Audio(url)
    audioRef.current = audio

    const onTimeUpdate = () => setAudioTime(audio.currentTime)
    const onLoadedMetadata = () => setAudioDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setAudioTime(0) }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
      audioRef.current = null
      setPlaying(false)
      setAudioTime(0)
      setAudioDuration(0)
    }
  }, [episode?.novel?.ttsFileUrl])


  // 5-6. 배속 변경 시 오디오에 즉시 반영
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // 5-7. 설정 패널 외부 클릭 감지 (overlay 방식 대신 document 이벤트 사용)
  useEffect(() => {
    if (!showSettings) return
    const handleOutside = (e) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(e.target)) {
        setShowSettings(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [showSettings])

  // 5-7. 기타 useEffect 유지
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

  // ==========================================
  // 6. 이벤트 핸들러
  // ==========================================
  const seekTo = (clientX) => {
    if (!audioRef.current || !audioDuration || !progressBarRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    audioRef.current.currentTime = ratio * audioDuration
    setAudioTime(ratio * audioDuration)
  }

  const handleProgressMouseDown = (e) => {
    if (!audioRef.current || !audioDuration) return
    seekTo(e.clientX)
    const onMove = (e) => seekTo(e.clientX)
    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const handlePlayToggle = () => {
    // TTS가 없으면 목소리 선택 모달 자동 오픈
    if (!audioRef.current) {
      handleSettingsClick()
      return
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(console.error)
      setPlaying(true)
    }
  }

  const handleSettingsClick = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (showSettings) { setShowSettings(false); return }
    try {
      const res = await api.get("/api/tts/voices")
      setVoices(res.data || [])
    } catch { setVoices([]) }
    setShowSettings(true)
  }

  const handleGenerateTts = async (voiceId) => {
    try {
      setIsGenerating(true)
      await api.post(`/api/episodes/${episodeId}/tts?voiceId=${voiceId}`)
      await loadEpisodeDetail()
      setCurrentVoiceId(voiceId)
      setShowSettings(false)
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackRate
          audioRef.current.play().catch(console.error)
          setPlaying(true)
        }
      }, 300)
    } catch {
      alert("TTS 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  const SPEED_PRESETS = [0.5, 1.0, 1.25, 1.5, 2.0]

  const applySpeed = (speed) => {
    setPlaybackRate(speed)
    if (audioRef.current) audioRef.current.playbackRate = speed
  }

  const handleSpeedDrag = (clientX) => {
    if (!speedBarRef.current) return
    const rect = speedBarRef.current.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const raw = 0.5 + ratio * (2.0 - 0.5)
    const nearest = SPEED_PRESETS.reduce((a, b) => Math.abs(b - raw) < Math.abs(a - raw) ? b : a)
    applySpeed(nearest)
  }

  const handleSpeedMouseDown = (e) => {
    e.stopPropagation()
    handleSpeedDrag(e.clientX)
    const onMove = (e) => handleSpeedDrag(e.clientX)
    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const goContentDetail = () => {
    if (contentId) navigate(`/contents/${contentId}`)
    else if (episode?.content?.contentId) navigate(`/contents/${episode.content.contentId}`)
    else navigate(-1)
  }

  const handleLike = () => {
    if (!isLoggedIn) { navigate("/login"); return }
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleRatingConfirm = async () => {
    const userId = getUserId()
    if (!userId) { navigate("/login"); return }
    try {
      const response = await api.post(`/api/ratings/${contentId}?userId=${userId}`, { score: tempRating })
      if (response.status === 200 || response.status === 201) {
        setMyRating(tempRating)
        setShowRatingModal(false)
        setAvgRating(prev => Math.round(((prev + tempRating) / 2) * 10) / 10)
        loadAverageRating()
      } else {
        alert("별점 저장에 실패했습니다.")
      }
    } catch (error) { console.error("별점 저장 실패 : ", error) }
  }

  const handleCommentSubmit = () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!comment.trim()) return
    setComments([{ id: Date.now(), user: currentUser, text: comment, date: "방금", isMine: true, replies: [], likes: 0, dislikes: 0, myLike: null }, ...comments])
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
    setComments(comments.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), { id: Date.now(), user: currentUser, text: replyText, date: "방금", isMine: true, likes: 0, dislikes: 0, myLike: null }] } : c))
    setReplyText("")
    setReplyingId(null)
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }))
  }

  const handleReplyDelete = (commentId, replyId) => {
    setComments(comments.map(c => c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c))
  }

  const handleReplyEditStart = (commentId, reply) => {
    setEditingReply({ commentId, replyId: reply.id })
    setEditReplyText(reply.text)
  }

  const handleReplyEditSubmit = (commentId, replyId) => {
    setComments(comments.map(c => c.id === commentId ? { ...c, replies: c.replies.map(r => r.id === replyId ? { ...r, text: editReplyText } : r) } : c))
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
      if (c.myLike === type) return { ...c, myLike: null, likes: type === "like" ? c.likes - 1 : c.likes, dislikes: type === "dislike" ? c.dislikes - 1 : c.dislikes }
      return { ...c, myLike: type, likes: type === "like" ? c.likes + 1 : c.myLike === "like" ? c.likes - 1 : c.likes, dislikes: type === "dislike" ? c.dislikes + 1 : c.myLike === "dislike" ? c.dislikes - 1 : c.dislikes }
    }))
  }

  const handleReplyLike = (commentId, replyId, type) => {
    setComments(comments.map(c => {
      if (c.id !== commentId) return c
      return { ...c, replies: c.replies.map(r => {
        if (r.id !== replyId) return r
        if (r.myLike === type) return { ...r, myLike: null, likes: type === "like" ? r.likes - 1 : r.likes, dislikes: type === "dislike" ? r.dislikes - 1 : r.dislikes }
        return { ...r, myLike: type, likes: type === "like" ? r.likes + 1 : r.myLike === "like" ? r.likes - 1 : r.likes, dislikes: type === "dislike" ? r.dislikes + 1 : r.myLike === "dislike" ? r.dislikes - 1 : r.dislikes }
      }) }
    }))
  }

  // ==========================================
  // 7. UI 렌더링 (원본 100% 유지)
  // ==========================================
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
        <div style={{ width: 52 }} />
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
            <button className={styles.playBtn} onClick={handlePlayToggle}>
              {playing ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="4" width="5" height="16" rx="1.5"/>
                  <rect x="14" y="4" width="5" height="16" rx="1.5"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                  <polygon points="5,3 20,12 5,21"/>
                </svg>
              )}
            </button>
            <div
              className={styles.progressBarWrapper}
              ref={progressBarRef}
              onMouseDown={handleProgressMouseDown}
            >
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }}
                />
                <div
                  className={styles.progressThumb}
                  style={{ left: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }}
                />
              </div>
            </div>
            <span className={styles.timeLabel}>{formatTime(audioTime)} / {formatTime(audioDuration)}</span>
            <span className={styles.speedBadge}>{playbackRate}×</span>

            {/* 설정 버튼 + 패널 — ref로 버튼+패널 모두 감싸서 외부클릭 정확히 감지 */}
            <div ref={settingsPanelRef} style={{ position: "relative", flexShrink: 0 }}>
              <button className={styles.settingsBtn} onClick={handleSettingsClick}>
                설정
              </button>

              {showSettings && (
                <div className={styles.settingsPanel}>
                  {/* 목소리 섹션 */}
                  <div className={styles.settingsSection}>
                    <div className={styles.settingsSectionTitle}>목소리</div>
                    <div className={styles.voiceGrid}>
                      {voices.map(v => (
                        <button
                          key={v.voiceId}
                          className={`${styles.voiceChip} ${(pendingVoiceId ?? currentVoiceId) === v.voiceId ? styles.voiceChipActive : ""}`}
                          onClick={() => setPendingVoiceId(v.voiceId)}
                          disabled={isGenerating}
                        >
                          <span className={styles.voiceChipLabel}>{v.voiceStyle}</span>
                          <span className={styles.voiceChipType}>
                            {v.voiceType === "MALE" ? "남성" : v.voiceStyle === "귀여운" ? "아이" : "여성"}
                          </span>
                        </button>
                      ))}
                    </div>
                    {(pendingVoiceId && pendingVoiceId !== currentVoiceId) && (
                      <button
                        className={styles.applyBtn}
                        onClick={() => handleGenerateTts(pendingVoiceId)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? "생성 중..." : "적용"}
                      </button>
                    )}
                  </div>

                  {/* 배속 섹션 */}
                  <div className={styles.settingsSection}>
                    <div className={styles.settingsSectionTitle}>배속 <span className={styles.speedValue}>{playbackRate}×</span></div>
                    <div
                      className={styles.speedBarWrapper}
                      ref={speedBarRef}
                      onMouseDown={handleSpeedMouseDown}
                    >
                      <div className={styles.speedBar}>
                        <div
                          className={styles.speedFill}
                          style={{ width: `${((playbackRate - 0.5) / 1.5) * 100}%` }}
                        />
                        <div
                          className={styles.speedThumb}
                          style={{ left: `${((playbackRate - 0.5) / 1.5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.speedPresets}>
                      {SPEED_PRESETS.map(s => (
                        <button
                          key={s}
                          className={`${styles.speedPreset} ${playbackRate === s ? styles.speedPresetActive : ""}`}
                          onClick={(e) => { e.stopPropagation(); applySpeed(s) }}
                        >
                          {s}×
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
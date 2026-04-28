import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react"
import api from "../api/axios" 
import styles from "../styles/NovelViewerPage.module.css"

export default function NovelViewerPage() {
  // ==========================================
  // 1. 라우터 및 기본 설정
  // ==========================================
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get("contentId")
  const { episodeId } = useParams()
  
  const savedProgress = parseInt(searchParams.get("progress") || "0", 10)
  const focusCommentId = searchParams.get("focusComment") // 🌟 마이페이지에서 넘어온 타겟 댓글 ID

  const isLoggedIn = !!localStorage.getItem("accessToken")
  const currentUser = "나"
  const COMMENTS_PER_PAGE = 5

  // ==========================================
  // 2. 상태 관리 (State & Ref)
  // ==========================================
  const progressRef = useRef(0) 
  const observerRef = useRef(null)
  const progressBarRef = useRef(null)
  const settingsPanelRef = useRef(null)
  const settingsBtnRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)
  const audioRef = useRef(null)
  const [audioTime, setAudioTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [voices, setVoices] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [currentVoiceId, setCurrentVoiceId] = useState(null)
  const [pendingVoiceId, setPendingVoiceId] = useState(null)

  // 청크 관련 상태
  const [totalChunks, setTotalChunks] = useState(0)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [chunkUrls, setChunkUrls] = useState({})
  const [chunkDurations, setChunkDurations] = useState({})
  const [waitingForChunk, setWaitingForChunk] = useState(false)
  const preloadingRef = useRef(false)
  const ttsConfigRef = useRef(null) // { mode: 'single', voiceId } | { mode: 'multi', voice1Id, voice2Id, narratorVoiceId }

  // 멀티보이스 관련 상태
  const [multiVoiceMode, setMultiVoiceMode] = useState(false)
  const [pendingMultiVoice, setPendingMultiVoice] = useState({ voice1Id: null, voice2Id: null, narratorVoiceId: null })
  const speedBarRef = useRef(null)
  const [episode, setEpisode] = useState(null)
  const [novel, setNovel] = useState(null)
  const [loading, setLoading] = useState(true)

  const [myRating, setMyRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [tempRating, setTempRating] = useState(1)
  
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
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

  const [isReady, setIsReady] = useState(false); // 🌟 순간이동 전 화면을 가려줄 투명 망토

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
      setLikeCount(response.data.likeCount || 0);

      const userId = getUserId();
      if (userId) {
        const likeStatusRes = await api.get(`/api/episodes/${episodeId}/is-liked`);
        setLiked(likeStatusRes.data); 
      }
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
      if (response.data && response.data.score) { 
        setMyRating(response.data.score); 
        setTempRating(response.data.score); 
      }
    } catch (error) { 
      console.error("내 평점 로드 실패 : ", error) 
    }
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
        myLike: cm.myReaction ? cm.myReaction.toLowerCase() : null,
        replies: (cm.replies || []).map(r => ({
          id: r.replyId,
          user: `독자${r.userId}`,
          text: r.replyText,
          date: r.createdAt ? r.createdAt.split('T')[0] : "방금",
          isMine: r.userId === getUserId(),
          likes: r.likeCount || 0,
          dislikes: r.dislikeCount || 0,
          myLike: r.myReaction ? r.myReaction.toLowerCase() : null
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

  useEffect(() => { 
    loadEpisodeDetail();
    loadComments(); 
    recordRecentView(0); 

    return () => {
      recordRecentView(progressRef.current); 
    };
  }, [episodeId, contentId]);

  // 🌟 웹툰 뷰어와 100% 동일한 순간이동 로직
  useLayoutEffect(() => {
    if (!focusCommentId && savedProgress === 0) {
      setIsReady(true);
      return;
    }

    if (paragraphs.length === 0 && comments.length === 0) return;

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
    else if (savedProgress > 0 && paragraphs.length > 0 && !focusCommentId) {
      const timer = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const targetScrollTop = (scrollHeight - clientHeight) * (savedProgress / 100);
        
        window.scrollTo({ top: targetScrollTop, behavior: "auto" });
        setIsReady(true); 
      }, 150); 
      return () => clearTimeout(timer);
    }
  }, [paragraphs, comments, focusCommentId, savedProgress]);

  // 5-4. 청크 URL이 생기면 오디오 초기화 및 재생
  useEffect(() => {
    const url = chunkUrls[currentChunkIndex]
    if (!url) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(url)
    audioRef.current = audio
    audio.playbackRate = playbackRate

    const onTimeUpdate = () => {
      setAudioTime(audio.currentTime)
      // 70% 지점에서 다음 청크 미리 생성
      if (audio.duration && audio.currentTime / audio.duration > 0.7) {
        const next = currentChunkIndex + 1
        const cfg = ttsConfigRef.current
        if (next < totalChunks && !chunkUrls[next] && !preloadingRef.current && cfg) {
          preloadingRef.current = true
          const url = cfg.mode === 'single'
            ? `/api/episodes/${episodeId}/tts/chunk/${next}?voiceId=${cfg.voiceId}`
            : `/api/episodes/${episodeId}/tts/multi-voice/chunk/${next}?voice1Id=${cfg.voice1Id}&voice2Id=${cfg.voice2Id}&narratorVoiceId=${cfg.narratorVoiceId}`
          api.post(url)
            .then(res => {
              setChunkUrls(prev => ({ ...prev, [next]: res.data.url }))
              preloadingRef.current = false
            })
            .catch(() => { preloadingRef.current = false })
        }
      }
    }
    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration)
      setChunkDurations(prev => ({ ...prev, [currentChunkIndex]: audio.duration }))
    }
    const onEnded = () => {
      const next = currentChunkIndex + 1
      if (next < totalChunks) {
        setCurrentChunkIndex(next)
        setAudioTime(0)
        if (!chunkUrls[next]) {
          setWaitingForChunk(true) // 청크 미준비 → 도착 시 audio useEffect가 자동 재생
        }
      } else {
        playingRef.current = false
        setPlaying(false)
        setAudioTime(0)
      }
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)

    if (playingRef.current || waitingForChunk) {
      setWaitingForChunk(false)
      audio.play().catch(console.error)
      setPlaying(true)
      playingRef.current = true
    }

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
    }
  }, [chunkUrls[currentChunkIndex], currentChunkIndex])



  // 5-6. 배속 변경 시 오디오에 즉시 반영
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // 5-7. 설정 패널 외부 클릭 감지
  useEffect(() => {
    if (!showSettings) return
    const handleOutside = (e) => {
      const inPanel = settingsPanelRef.current && settingsPanelRef.current.contains(e.target)
      const inBtn = settingsBtnRef.current && settingsBtnRef.current.contains(e.target)
      if (!inPanel && !inBtn) setShowSettings(false)
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
    if (!audioRef.current) {
      handleSettingsClick()
      return
    }
    if (playing) {
      audioRef.current.pause()
      playingRef.current = false
      setPlaying(false)
    } else {
      audioRef.current.play().catch(console.error)
      playingRef.current = true
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

      // 기존 청크 캐시 확인
      const infoRes = await api.get(`/api/episodes/${episodeId}/tts/chunk-info?voiceId=${voiceId}`)
      const { totalChunks: total, chunkUrls: existing } = infoRes.data

      setTotalChunks(total)
      setCurrentChunkIndex(0)
      setChunkDurations({})
      preloadingRef.current = false

      // 0번 청크 URL 확인 (캐시 or 생성)
      let chunk0Url = existing["0"]
      if (!chunk0Url) {
        const res = await api.post(`/api/episodes/${episodeId}/tts/chunk/0?voiceId=${voiceId}`)
        chunk0Url = res.data.url
      }

      // 기존 캐시된 청크들도 로드
      const urls = { ...existing, "0": chunk0Url }
      setChunkUrls(urls)
      setCurrentVoiceId(voiceId)
      ttsConfigRef.current = { mode: 'single', voiceId }
      setShowSettings(false)
      playingRef.current = true
    } catch {
      alert("TTS 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateMultiVoiceTts = async () => {
    const { voice1Id, voice2Id, narratorVoiceId } = pendingMultiVoice
    if (!voice1Id || !voice2Id || !narratorVoiceId) {
      alert("화자1, 화자2, 서술자 목소리를 모두 선택해주세요.")
      return
    }
    try {
      setIsGenerating(true)
      const infoRes = await api.get(
        `/api/episodes/${episodeId}/tts/multi-voice/chunk-info?voice1Id=${voice1Id}&voice2Id=${voice2Id}&narratorVoiceId=${narratorVoiceId}`
      )
      const { totalChunks: total, chunkUrls: existing } = infoRes.data

      setTotalChunks(total)
      setCurrentChunkIndex(0)
      setChunkDurations({})
      preloadingRef.current = false

      let chunk0Url = existing["0"]
      if (!chunk0Url) {
        const res = await api.post(
          `/api/episodes/${episodeId}/tts/multi-voice/chunk/0?voice1Id=${voice1Id}&voice2Id=${voice2Id}&narratorVoiceId=${narratorVoiceId}`
        )
        chunk0Url = res.data.url
      }

      const urls = { ...existing, "0": chunk0Url }
      setChunkUrls(urls)
      setCurrentVoiceId(null)
      ttsConfigRef.current = { mode: 'multi', voice1Id, voice2Id, narratorVoiceId }
      setShowSettings(false)
      playingRef.current = true
    } catch {
      alert("멀티보이스 TTS 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5, 2.0]

  const applySpeed = (speed) => {
    setPlaybackRate(speed)
    if (audioRef.current) audioRef.current.playbackRate = speed
  }

  const handleSpeedDrag = (clientX) => {
    if (!speedBarRef.current) return
    const rect = speedBarRef.current.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const raw = 0.75 + ratio * (2.0 - 0.75)
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
      // 🌟 [수정 포인트] 답글 창 유지를 위해 setReplyingId(null) 삭제!
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
        if (c.myLike === type) return { ...c, myLike: null, likes: type === "like" ? c.likes - 1 : c.likes, dislikes: type === "dislike" ? c.dislikes - 1 : c.dislikes }
        return { ...c, myLike: type, likes: type === "like" ? c.likes + 1 : (c.myLike === "like" ? c.likes - 1 : c.likes), dislikes: type === "dislike" ? c.dislikes + 1 : (c.myLike === "dislike" ? c.dislikes - 1 : c.dislikes) }
      }));
    } catch (error) {
      console.error("댓글 반응 실패:", error);
    }
  }

  const handleReplyLike = async (commentId, replyId, type) => {
    if (!isLoggedIn) { navigate("/login"); return }
    try {
      await api.post(`/api/replies/${replyId}/reactions`, { reactionType: type.toUpperCase() });
      setComments(comments.map(c => {
        if (c.id !== commentId) return c
        return {
          ...c, replies: c.replies.map(r => {
            if (r.id !== replyId) return r
            if (r.myLike === type) return { ...r, myLike: null, likes: type === "like" ? r.likes - 1 : r.likes, dislikes: type === "dislike" ? r.dislikes - 1 : r.dislikes }
            return { ...r, myLike: type, likes: type === "like" ? r.likes + 1 : (r.myLike === "like" ? r.likes - 1 : r.likes), dislikes: type === "dislike" ? r.dislikes + 1 : (r.myLike === "dislike" ? r.dislikes - 1 : r.dislikes) }
          })
        }
      }));
    } catch (error) {
      console.error("답글 반응 실패:", error);
    }
  }

  // ==========================================
  // 7. UI 렌더링
  // ==========================================
  if (loading) return <div className={styles.pageWrapper}><div className={styles.loading}>불러오는 중...</div></div>
  if (!episode) return null

  return (
    <div 
      className={styles.pageWrapper}
      // 🌟 순간이동 시 화면 깜빡임 방지 (투명 망토)
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
              <span className={styles.timeLabel}>
                {formatTime(audioTime)} / {formatTime(audioDuration)}
                {totalChunks > 1 && <span style={{ marginLeft: 6, fontSize: "0.75em", opacity: 0.6 }}>{currentChunkIndex + 1}/{totalChunks}</span>}
              </span>
              <span className={styles.speedBadge}>{playbackRate}×</span>
              <div ref={settingsBtnRef} style={{ flexShrink: 0 }}>
                <button className={styles.settingsBtn} onClick={handleSettingsClick}>설정</button>
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

      {showSettings && (
        <div ref={settingsPanelRef} className={styles.settingsPanel}>
              {/* 모드 토글 */}
              <div className={styles.settingsSection}>
                <div className={styles.modeToggle}>
                  <button
                    className={`${styles.modeToggleBtn} ${!multiVoiceMode ? styles.modeToggleBtnActive : ""}`}
                    onClick={() => setMultiVoiceMode(false)}
                  >단일 보이스</button>
                  <button
                    className={`${styles.modeToggleBtn} ${multiVoiceMode ? styles.modeToggleBtnActive : ""}`}
                    onClick={() => setMultiVoiceMode(true)}
                  >멀티 보이스</button>
                </div>
              </div>

              {!multiVoiceMode ? (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionTitle}>목소리</div>
                  <select
                    className={styles.voiceSelect}
                    value={pendingVoiceId ?? currentVoiceId ?? ""}
                    onChange={e => setPendingVoiceId(Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <option value="">선택하세요</option>
                    {voices.map(v => (
                      <option key={v.voiceId} value={v.voiceId}>
                        {v.voiceStyle} · {v.voiceType === "MALE" ? "남성" : v.voiceStyle === "귀여운" ? "아이" : "여성"}
                      </option>
                    ))}
                  </select>
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
              ) : (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionTitle}>멀티 보이스 설정</div>
                  <div className={styles.voiceSubLabel}>화자1 (첫 번째 대화)</div>
                  <select
                    className={styles.voiceSelect}
                    value={pendingMultiVoice.voice1Id ?? ""}
                    onChange={e => setPendingMultiVoice(p => ({ ...p, voice1Id: Number(e.target.value) }))}
                    disabled={isGenerating}
                  >
                    <option value="">선택하세요</option>
                    {voices.map(v => (
                      <option key={v.voiceId} value={v.voiceId}>
                        {v.voiceStyle} · {v.voiceType === "MALE" ? "남성" : "여성"}
                      </option>
                    ))}
                  </select>
                  <div className={styles.voiceSubLabel}>화자2 (두 번째 대화)</div>
                  <select
                    className={styles.voiceSelect}
                    value={pendingMultiVoice.voice2Id ?? ""}
                    onChange={e => setPendingMultiVoice(p => ({ ...p, voice2Id: Number(e.target.value) }))}
                    disabled={isGenerating}
                  >
                    <option value="">선택하세요</option>
                    {voices.map(v => (
                      <option key={v.voiceId} value={v.voiceId}>
                        {v.voiceStyle} · {v.voiceType === "MALE" ? "남성" : "여성"}
                      </option>
                    ))}
                  </select>
                  <div className={styles.voiceSubLabel}>서술자</div>
                  <select
                    className={styles.voiceSelect}
                    value={pendingMultiVoice.narratorVoiceId ?? ""}
                    onChange={e => setPendingMultiVoice(p => ({ ...p, narratorVoiceId: Number(e.target.value) }))}
                    disabled={isGenerating}
                  >
                    <option value="">선택하세요</option>
                    {voices.map(v => (
                      <option key={v.voiceId} value={v.voiceId}>
                        {v.voiceStyle} · {v.voiceType === "MALE" ? "남성" : "여성"}
                      </option>
                    ))}
                  </select>
                  <button
                    className={styles.applyBtn}
                    onClick={handleGenerateMultiVoiceTts}
                    disabled={isGenerating || !pendingMultiVoice.voice1Id || !pendingMultiVoice.voice2Id || !pendingMultiVoice.narratorVoiceId}
                  >
                    {isGenerating ? "생성 중..." : "적용"}
                  </button>
                </div>
              )}

              {/* 배속 섹션 */}
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionTitle}>배속 <span className={styles.speedValue}>{playbackRate}×</span></div>
                <div
                  className={styles.speedBarWrapper}
                  ref={speedBarRef}
                  onMouseDown={handleSpeedMouseDown}
                >
                  <div className={styles.speedBar}>
                    <div className={styles.speedFill} style={{ width: `${((playbackRate - 0.75) / 1.25) * 100}%` }} />
                    <div className={styles.speedThumb} style={{ left: `${((playbackRate - 0.75) / 1.25) * 100}%` }} />
                  </div>
                </div>
                <div className={styles.speedPresets}>
                  {SPEED_PRESETS.map(s => (
                    <button
                      key={s}
                      className={`${styles.speedPreset} ${playbackRate === s ? styles.speedPresetActive : ""}`}
                      onClick={(e) => { e.stopPropagation(); applySpeed(s) }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
          </div>
      )}

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
            // 🌟 아이디(id) 속성 꼭 추가!
            <div key={cm.id} id={`comment-${cm.id}`} className={styles.commentItem}>

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

              {/* 🌟 [수정 포인트] 삭제된 댓글은 차단하고, 정상 답글은 등록 후에도 창을 닫지 않게! */}
              {replyingId === cm.id && cm.text !== "삭제된 댓글입니다." && (
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
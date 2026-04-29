import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useCallback, useRef } from "react"
import api from "../api/axios"
import styles from "../styles/RelayNovelDetailPage.module.css"
import ReportModal from "../components/ReportModal" // 🌟 경로 확인 필수!

const MAX_CHARS = 500
const MIN_CHARS = 50

export default function RelayNovelDetailPage() {
  const navigate = useNavigate()
  const { relayNovelId } = useParams()
  
  const [myText, setMyText] = useState("")
  const [novel, setNovel] = useState(null)
  const [entries, setEntries] = useState([])
  const [isGuideOpen, setIsGuideOpen] = useState(true)
  const [isWriting, setIsWriting] = useState(false)
  const [guideline, setGuideline] = useState("") 
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 🌟 신고 및 메뉴 상태
  const [reportInfo, setReportInfo] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)

  const isLoggedIn = !!(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"))

  // ==========================================
  // TTS 상태
  // ==========================================
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
  const [totalChunks, setTotalChunks] = useState(0)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [chunkUrls, setChunkUrls] = useState({})
  const [chunkDurations, setChunkDurations] = useState({})
  const [waitingForChunk, setWaitingForChunk] = useState(false)
  const preloadingRef = useRef(false)
  const ttsConfigRef = useRef(null)
  const [multiVoiceMode, setMultiVoiceMode] = useState(false)
  const [pendingMultiVoice, setPendingMultiVoice] = useState({ voice1Id: null, voice2Id: null, narratorVoiceId: null })
  const speedBarRef = useRef(null)
  const progressBarRef = useRef(null)
  const settingsPanelRef = useRef(null)
  const settingsBtnRef = useRef(null)

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const loadDetail = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/api/relay-novels/${relayNovelId}`)
      setNovel(response.data)
      setEntries(response.data.entries || response.data.entryList || [])
    } catch (error) {
      setNovel({ title: "릴레이 소설 제목", starterNickname: "홍길동", uniqueParticipantCount: 12, entryCount: 4 })
      setEntries(Array.from({ length: 4 }, (_, i) => ({
        entryId: i + 1, userId: 200 + i, nickname: `참여자${i + 1}`, entryOrder: i + 1,
        entryText: `${i + 1}번째 이야기가 이어집니다.`,
        createdAt: `2026.04.${10 + i}`,
        status: i === 1 ? "BLINDED" : "PUBLISHED", 
        adminMessage: i === 1 ? "부적절한 내용이 감지되어 AI가 요약 처리했습니다." : ""
      })))
    } finally {
      setIsLoading(false)
    }
  }, [relayNovelId])

  const loadGuidelines = async () => {
    try {
      const response = await api.get("/api/relay-guideline") 
      const text = typeof response.data === 'string' ? response.data : response.data?.content
      setGuideline(text || "등록된 공식 가이드라인이 없습니다.")
    } catch {
      setGuideline("가이드라인을 불러오지 못했습니다.")
    }
  }

  useEffect(() => {
    loadDetail()
    loadGuidelines()
  }, [relayNovelId, loadDetail])

  // 청크 URL이 생기면 오디오 초기화 및 재생
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
      if (audio.duration && audio.currentTime / audio.duration > 0.7) {
        const next = currentChunkIndex + 1
        const cfg = ttsConfigRef.current
        if (next < totalChunks && !chunkUrls[next] && !preloadingRef.current && cfg) {
          preloadingRef.current = true
          const nextUrl = cfg.mode === 'single'
            ? `/api/relay-novels/${relayNovelId}/tts/chunk/${next}?voiceId=${cfg.voiceId}`
            : `/api/relay-novels/${relayNovelId}/tts/multi-voice/chunk/${next}?voice1Id=${cfg.voice1Id}&voice2Id=${cfg.voice2Id}&narratorVoiceId=${cfg.narratorVoiceId}`
          api.post(nextUrl)
            .then(res => { setChunkUrls(prev => ({ ...prev, [next]: res.data.url })); preloadingRef.current = false })
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
        if (!chunkUrls[next]) setWaitingForChunk(true)
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

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

  // ==========================================
  // TTS 이벤트 핸들러
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
    if (!audioRef.current) { handleSettingsClick(); return }
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
      const infoRes = await api.get(`/api/relay-novels/${relayNovelId}/tts/chunk-info?voiceId=${voiceId}`)
      const { totalChunks: total, chunkUrls: existing } = infoRes.data
      setTotalChunks(total)
      setCurrentChunkIndex(0)
      setChunkDurations({})
      preloadingRef.current = false

      let chunk0Url = existing["0"]
      if (!chunk0Url) {
        const res = await api.post(`/api/relay-novels/${relayNovelId}/tts/chunk/0?voiceId=${voiceId}`)
        chunk0Url = res.data.url
      }
      setChunkUrls({ ...existing, "0": chunk0Url })
      setCurrentVoiceId(voiceId)
      ttsConfigRef.current = { mode: 'single', voiceId }
      setShowSettings(false)
      playingRef.current = true
    } catch (e) {
      if (e?.response?.status === 404) {
        alert("릴레이소설 TTS 기능은 현재 준비 중입니다.")
      } else {
        alert("TTS 생성에 실패했습니다.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateMultiVoiceTts = async () => {
    const { voice1Id, voice2Id, narratorVoiceId } = pendingMultiVoice
    if (!voice1Id || !voice2Id || !narratorVoiceId) {
      alert("참여자1, 참여자2, 나머지 목소리를 모두 선택해주세요.")
      return
    }
    try {
      setIsGenerating(true)
      const infoRes = await api.get(
        `/api/relay-novels/${relayNovelId}/tts/multi-voice/chunk-info?voice1Id=${voice1Id}&voice2Id=${voice2Id}&narratorVoiceId=${narratorVoiceId}`
      )
      const { totalChunks: total, chunkUrls: existing } = infoRes.data
      setTotalChunks(total)
      setCurrentChunkIndex(0)
      setChunkDurations({})
      preloadingRef.current = false

      let chunk0Url = existing["0"]
      if (!chunk0Url) {
        const res = await api.post(
          `/api/relay-novels/${relayNovelId}/tts/multi-voice/chunk/0?voice1Id=${voice1Id}&voice2Id=${voice2Id}&narratorVoiceId=${narratorVoiceId}`
        )
        chunk0Url = res.data.url
      }
      setChunkUrls({ ...existing, "0": chunk0Url })
      setCurrentVoiceId(null)
      ttsConfigRef.current = { mode: 'multi', voice1Id, voice2Id, narratorVoiceId }
      setShowSettings(false)
      playingRef.current = true
    } catch (e) {
      if (e?.response?.status === 404) {
        alert("릴레이소설 TTS 기능은 현재 준비 중입니다.")
      } else {
        alert("멀티보이스 TTS 생성에 실패했습니다.")
      }
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

  const handleStartWriting = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    try {
      await api.post(`/api/relay-novels/${relayNovelId}/start`)
      setIsWriting(true) 
    } catch (error) {
      if (error.response?.status === 409) alert("현재 다른 작가님이 집필 중입니다. 🚫")
      else alert("서버 통신 중 오류가 발생했습니다.")
    }
  }


  const handleCancelWriting = async () => {
    setIsWriting(false); setMyText("")
    try { await api.post(`/api/relay-novels/${relayNovelId}/cancel`) } catch (e) { console.error(e) }
  }

  useEffect(() => {
    const handleBeforeUnload = () => { if (isWriting) api.post(`/api/relay-novels/${relayNovelId}/cancel`) }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (isWriting) api.post(`/api/relay-novels/${relayNovelId}/cancel`)
    }
  }, [isWriting, relayNovelId])

  const handleSubmit = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (myText.length < MIN_CHARS || myText.length > MAX_CHARS) return
    try {
      setIsSubmitting(true)
      await api.post(`/api/relay-novels/${relayNovelId}/submit`, { entryText: myText })
      alert("이어쓰기가 등록되었습니다!")
      setMyText(""); setIsWriting(false); loadDetail()
    } catch { alert("등록에 실패했습니다.") } finally { setIsSubmitting(false) }
  }
  

  // openEntryReport 함수 수정
const openEntryReport = (entry) => {
  setReportInfo({
    targetType: 'RELAY_ENTRY',
    targetId: entry.entryId,
    reportedUserId: entry.userId || entry.authorId,
    // 🌟 여기를 'n회차 내용' 대신 닉네임으로 변경!
    targetTitle: `${entry.nickname || "알 수 없음"} 님`
  });
  setActiveMenu(null);
}

  const charColor = () => (myText.length < MIN_CHARS || myText.length > MAX_CHARS) ? "#E53935" : "#2196F3"

  if (isLoading) return <div className={styles.pageWrapper}><div className={styles.loading}>불러오는 중...</div></div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/relay")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          목록
        </button>
        <div className={styles.headerTitle}>{novel?.title}</div>
        <div className={styles.headerMeta}>시작: {novel?.starterNickname} · 참여자 {novel?.uniqueParticipantCount}명 · 이어쓰기 {entries.length}개</div>
      </div>

      <div className={styles.content}>
        {guideline && (
          <div className={styles.guidelineBanner}>
            <div className={styles.guidelineBannerTitle} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                작성 가이드라인
              </div>
              <button onClick={() => setIsGuideOpen(!isGuideOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#1565C0" }}>
                {isGuideOpen ? "접기 ▲" : "펼치기 ▼"}
              </button>
            </div>
            {isGuideOpen && <div className={styles.guidelineContent} style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontSize: "13px", marginTop: "10px" }}>{guideline}</div>}
          </div>
        )}

        {entries.map((entry, idx) => (
          <div key={entry.entryId || idx} className={styles.entryCard}>
            <div className={styles.entryOrder}>
              <div className={styles.entryOrderNum}>{entry.entryOrder || idx + 1}</div>
              {idx < entries.length - 1 && <div className={styles.entryOrderLine} />}
            </div>
            <div className={styles.entryBody}>
              <div className={styles.entryHeader} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div className={styles.avatar} />
                <span className={styles.entryUser}>{entry.nickname}</span>
                <span className={styles.entryMeta}>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : entry.date}</span>
                
                <button 
                  onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#999', padding: '0 5px' }}
                >⋮</button>

                {activeMenu === idx && (
                  <div style={{ position: 'absolute', right: 0, top: '25px', background: 'white', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 100 }}>
                    <button 
                      onClick={() => openEntryReport(entry)}
                      style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#E53935', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                    >🚩 신고하기</button>
                  </div>
                )}
              </div>
              
              {entry.status === "BLINDED" ? (
                <div className={styles.blindBox}>
                  <div className={styles.blindTitle}>🚨 [가이드라인 위반으로 블라인드 처리된 회차입니다.]</div>
                  <div className={styles.blindText}><strong>🤖 AI 자동 요약본: </strong> {entry.adminMessage || entry.blindMessage}</div>
                </div>
              ) : (
                <div className={styles.entryText}>{entry.entryText || entry.text}</div>
              )}
            </div>
          </div>
        ))}

        {/* TTS 바 — 이어쓰기 참여하기 위에 나란히 */}
        <div className={styles.ttsBar}>
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
            <div className={styles.ttsProgressBarWrapper} ref={progressBarRef} onMouseDown={handleProgressMouseDown}>
              <div className={styles.ttsProgressBar}>
                <div className={styles.ttsProgressFill} style={{ width: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }} />
                <div className={styles.ttsProgressThumb} style={{ left: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }} />
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

          {showSettings && (
            <div ref={settingsPanelRef} className={styles.settingsPanel}>
              <div className={styles.settingsSection}>
                <div className={styles.modeToggle}>
                  <button className={`${styles.modeToggleBtn} ${!multiVoiceMode ? styles.modeToggleBtnActive : ""}`} onClick={() => setMultiVoiceMode(false)}>단일 보이스</button>
                  <button className={`${styles.modeToggleBtn} ${multiVoiceMode ? styles.modeToggleBtnActive : ""}`} onClick={() => setMultiVoiceMode(true)}>멀티 보이스</button>
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
                        {v.voiceStyle} · {v.voiceType === "MALE" ? "남성" : "여성"}
                      </option>
                    ))}
                  </select>
                  {(pendingVoiceId && pendingVoiceId !== currentVoiceId) && (
                    <button className={styles.applyBtn} onClick={() => handleGenerateTts(pendingVoiceId)} disabled={isGenerating}>{isGenerating ? "생성 중..." : "적용"}</button>
                  )}
                </div>
              ) : (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionTitle}>멀티 보이스 설정</div>
                  <div className={styles.voiceSubLabel}>참여자1 목소리</div>
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
                  <div className={styles.voiceSubLabel}>참여자2 목소리</div>
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
                  <div className={styles.voiceSubLabel}>나머지 참여자 목소리</div>
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
                  <button className={styles.applyBtn} onClick={handleGenerateMultiVoiceTts} disabled={isGenerating || !pendingMultiVoice.voice1Id || !pendingMultiVoice.voice2Id || !pendingMultiVoice.narratorVoiceId}>
                    {isGenerating ? "생성 중..." : "적용"}
                  </button>
                </div>
              )}
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionTitle}>배속 <span className={styles.speedValue}>{playbackRate}×</span></div>
                <div className={styles.speedBarWrapper} ref={speedBarRef} onMouseDown={handleSpeedMouseDown}>
                  <div className={styles.speedBar}>
                    <div className={styles.speedFill} style={{ width: `${((playbackRate - 0.75) / 1.25) * 100}%` }} />
                    <div className={styles.speedThumb} style={{ left: `${((playbackRate - 0.75) / 1.25) * 100}%` }} />
                  </div>
                </div>
                <div className={styles.speedPresets}>
                  {SPEED_PRESETS.map(s => (
                    <button key={s} className={`${styles.speedPreset} ${playbackRate === s ? styles.speedPresetActive : ""}`} onClick={(e) => { e.stopPropagation(); applySpeed(s) }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 이어쓰기 */}
        {!isWriting ? (
          <button className={styles.writeOpenBtn} onClick={handleStartWriting}>이어쓰기 참여하기 ✍️</button>
        ) : (
          <div className={styles.writeCard}>
            <div className={styles.writeHeader}>
              <div className={styles.writeTitle}>이어쓰기</div>
              <button className={styles.closeWriteBtn} onClick={handleCancelWriting}>✕ 닫기</button> 
            </div>
            <textarea value={myText} onChange={e => setMyText(e.target.value)} onFocus={() => !isLoggedIn && navigate("/login")} placeholder="이야기를 이어서 써주세요..." rows={6} className={styles.textarea} readOnly={!isLoggedIn} maxLength={MAX_CHARS + 50} />
            <div className={styles.writeFooter}>
              <div className={styles.charCountWrap}><span style={{ color: charColor(), fontWeight: 600 }}>{myText.length}</span> / {MAX_CHARS}자</div>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting || myText.length < MIN_CHARS || myText.length > MAX_CHARS}>
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        )}
      </div>

      <ReportModal 
        isOpen={!!reportInfo} 
        onClose={() => setReportInfo(null)} 
        targetInfo={reportInfo} 
      />
    </div>
  )
}
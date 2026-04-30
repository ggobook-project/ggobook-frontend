import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";
import styles from "../styles/RelayNovelDetailPage.module.css";
import ReportModal from "../components/ReportModal";

const MAX_CHARS = 500;
const MIN_CHARS = 50;

export default function RelayNovelDetailPage() {
  const navigate = useNavigate();
  const { relayNovelId } = useParams();
  const location = useLocation();
  
  const [myText, setMyText] = useState("");
  const [novel, setNovel] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [guideline, setGuideline] = useState(""); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reportInfo, setReportInfo] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const isLoggedIn = !!(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));

  // ==========================================
  // 🌟 [추가] 어드민 이동 시 자동 스크롤 로직
  // ==========================================
  useEffect(() => {
    if (isLoading || entries.length === 0) return;

    const params = new URLSearchParams(location.search);
    const targetId = params.get("targetId");

    if (targetId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`entry-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // CSS 모듈에 정의한 adminHighlight 클래스 추가
          element.classList.add(styles.adminHighlight);
          
          setTimeout(() => {
            element.classList.remove(styles.adminHighlight);
          }, 3000);
        }
      }, 600); 
      return () => clearTimeout(timer);
    }
  }, [location.search, isLoading, entries]);

  // ==========================================
  // TTS 상태 및 초기화
  // ==========================================
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const audioRef = useRef(null);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [voices, setVoices] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentVoiceId, setCurrentVoiceId] = useState(null);
  const [pendingVoiceId, setPendingVoiceId] = useState(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunkUrls, setChunkUrls] = useState({});
  const [chunkDurations, setChunkDurations] = useState({});
  const [waitingForChunk, setWaitingForChunk] = useState(false);
  const preloadingRef = useRef(false);
  const ttsConfigRef = useRef(null);
  const [multiVoiceMode, setMultiVoiceMode] = useState(false);
  const [pendingMultiVoice, setPendingMultiVoice] = useState({ voice1Id: null, voice2Id: null, narratorVoiceId: null });
  const speedBarRef = useRef(null);
  const progressBarRef = useRef(null);
  const settingsPanelRef = useRef(null);
  const settingsBtnRef = useRef(null);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const loadDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/relay-novels/${relayNovelId}`);
      setNovel(response.data);
      setEntries(response.data.entries || response.data.entryList || []);
    } catch (error) {
      setNovel({ title: "소설을 찾을 수 없습니다", starterNickname: "-", uniqueParticipantCount: 0, entryCount: 0 });
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [relayNovelId]);

  const loadGuidelines = async () => {
    try {
      const response = await api.get("/api/relay-guideline"); 
      const text = typeof response.data === 'string' ? response.data : response.data?.content;
      setGuideline(text || "등록된 공식 가이드라인이 없습니다.");
    } catch {
      setGuideline("가이드라인을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    loadDetail();
    loadGuidelines();
  }, [relayNovelId, loadDetail]);

  // TTS 재생 로직
  useEffect(() => {
    const url = chunkUrls[currentChunkIndex];
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.playbackRate = playbackRate;

    const onTimeUpdate = () => {
      setAudioTime(audio.currentTime);
      if (audio.duration && audio.currentTime / audio.duration > 0.7) {
        const next = currentChunkIndex + 1;
        const cfg = ttsConfigRef.current;
        if (next < totalChunks && !chunkUrls[next] && !preloadingRef.current && cfg) {
          preloadingRef.current = true;
          const nextUrl = cfg.mode === 'single'
            ? `/api/relay-novels/${relayNovelId}/tts/chunk/${next}?voiceId=${cfg.voiceId}`
            : `/api/relay-novels/${relayNovelId}/tts/multi-voice/chunk/${next}?voice1Id=${cfg.voice1Id}&voice2Id=${cfg.voice2Id}&narratorVoiceId=${cfg.narratorVoiceId}`;
          api.post(nextUrl)
            .then(res => { setChunkUrls(prev => ({ ...prev, [next]: res.data.url })); preloadingRef.current = false; })
            .catch(() => { preloadingRef.current = false; });
        }
      }
    };
    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setChunkDurations(prev => ({ ...prev, [currentChunkIndex]: audio.duration }));
    };
    const onEnded = () => {
      const next = currentChunkIndex + 1;
      if (next < totalChunks) {
        setCurrentChunkIndex(next);
        setAudioTime(0);
        if (!chunkUrls[next]) setWaitingForChunk(true);
      } else {
        playingRef.current = false;
        setPlaying(false);
        setAudioTime(0);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    if (playingRef.current || waitingForChunk) {
      setWaitingForChunk(false);
      audio.play().catch(console.error);
      setPlaying(true);
      playingRef.current = true;
    }

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [chunkUrls[currentChunkIndex], currentChunkIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // TTS 핸들러들
  const seekTo = (clientX) => {
    if (!audioRef.current || !audioDuration || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    audioRef.current.currentTime = ratio * audioDuration;
    setAudioTime(ratio * audioDuration);
  };

  const handleProgressMouseDown = (e) => {
    if (!audioRef.current || !audioDuration) return;
    seekTo(e.clientX);
    const onMove = (e) => seekTo(e.clientX);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handlePlayToggle = () => {
    if (!audioRef.current) { handleSettingsClick(); return; }
    if (playing) {
      audioRef.current.pause();
      playingRef.current = false;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      playingRef.current = true;
      setPlaying(true);
    }
  };

  const handleSettingsClick = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (showSettings) { setShowSettings(false); return; }
    try {
      const res = await api.get("/api/tts/voices");
      setVoices(res.data || []);
    } catch { setVoices([]); }
    setShowSettings(true);
  };

  const handleGenerateTts = async (voiceId) => {
    try {
      setIsGenerating(true);
      const infoRes = await api.get(`/api/relay-novels/${relayNovelId}/tts/chunk-info?voiceId=${voiceId}`);
      const { totalChunks: total, chunkUrls: existing } = infoRes.data;
      setTotalChunks(total);
      setCurrentChunkIndex(0);
      setChunkDurations({});
      preloadingRef.current = false;

      let chunk0Url = existing["0"];
      if (!chunk0Url) {
        const res = await api.post(`/api/relay-novels/${relayNovelId}/tts/chunk/0?voiceId=${voiceId}`);
        chunk0Url = res.data.url;
      }
      setChunkUrls({ ...existing, "0": chunk0Url });
      setCurrentVoiceId(voiceId);
      ttsConfigRef.current = { mode: 'single', voiceId };
      setShowSettings(false);
      playingRef.current = true;
    } catch (e) {
      alert("TTS 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMultiVoiceTts = async () => {
    const { voice1Id, voice2Id, narratorVoiceId } = pendingMultiVoice;
    if (!voice1Id || !voice2Id || !narratorVoiceId) { alert("모든 목소리를 선택해주세요."); return; }
    try {
      setIsGenerating(true);
      const infoRes = await api.get(`/api/relay-novels/${relayNovelId}/tts/multi-voice/chunk-info?voice1Id=${voice1Id}&voice2Id=${voice2Id}&narratorVoiceId=${narratorVoiceId}`);
      const { totalChunks: total, chunkUrls: existing } = infoRes.data;
      setTotalChunks(total);
      setCurrentChunkIndex(0);
      setChunkDurations({});
      preloadingRef.current = false;

      let chunk0Url = existing["0"];
      if (!chunk0Url) {
        const res = await api.post(`/api/relay-novels/${relayNovelId}/tts/multi-voice/chunk/0?voice1Id=${voice1Id}&voice2Id=${voice2Id}&narratorVoiceId=${narratorVoiceId}`);
        chunk0Url = res.data.url;
      }
      setChunkUrls({ ...existing, "0": chunk0Url });
      setCurrentVoiceId(null);
      ttsConfigRef.current = { mode: 'multi', voice1Id, voice2Id, narratorVoiceId };
      setShowSettings(false);
      playingRef.current = true;
    } catch (e) {
      alert("멀티보이스 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5, 2.0];
  const applySpeed = (speed) => {
    setPlaybackRate(speed);
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  const handleSpeedDrag = (clientX) => {
    if (!speedBarRef.current) return;
    const rect = speedBarRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const raw = 0.75 + ratio * (2.0 - 0.75);
    const nearest = SPEED_PRESETS.reduce((a, b) => Math.abs(b - raw) < Math.abs(a - raw) ? b : a);
    applySpeed(nearest);
  };

  const handleSpeedMouseDown = (e) => {
    e.stopPropagation();
    handleSpeedDrag(e.clientX);
    const onMove = (e) => handleSpeedDrag(e.clientX);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // 이어쓰기 로직
  const handleSubmit = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (myText.length < MIN_CHARS || myText.length > MAX_CHARS) return;
    try {
      setIsSubmitting(true);
      await api.post(`/api/relay-novels/${relayNovelId}/submit`, { entryText: myText });
      alert("이어쓰기가 등록되었습니다!");
      setMyText(""); setIsWriting(false); loadDetail();
    } catch { alert("등록에 실패했습니다."); } finally { setIsSubmitting(false); }
  };

  const handleStartWriting = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    try {
      await api.post(`/api/relay-novels/${relayNovelId}/start`);
      setIsWriting(true); 
    } catch (error) {
      if (error.response?.status === 409) alert("현재 다른 작가님이 집필 중입니다. 🚫");
      else alert("서버 통신 중 오류가 발생했습니다.");
    }
  };


  const handleCancelWriting = async () => {
    setIsWriting(false); setMyText("");
    try { await api.post(`/api/relay-novels/${relayNovelId}/cancel`); } catch (e) { console.error(e); }
  };

  // 신고 로직
  const openEntryReport = (entry) => {
  setReportInfo({
    targetType: 'RELAY_ENTRY',
    targetId: entry.entryId,
    targetParentId: relayNovelId, 
    reportedUserId: entry.userId || entry.authorId,
    targetTitle: `${entry.nickname || "알 수 없음"} 님`
  });
  setActiveMenu(null);
};

  const charColor = () => (myText.length < MIN_CHARS || myText.length > MAX_CHARS) ? "#E53935" : "#2196F3";

  if (isLoading) return <div className={styles.pageWrapper}><div className={styles.loading}>불러오는 중...</div></div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/relay")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          목록으로
        </button>
        <div className={styles.headerTitle}>{novel?.title}</div>
        <div className={styles.headerMeta}>시작: {novel?.starterNickname} · 참여자 {novel?.uniqueParticipantCount}명 · 이어쓰기 {entries.length}개</div>
      </div>

      <div className={styles.content}>
        {guideline && (
          <div className={styles.guidelineBanner}>
            <div className={styles.guidelineBannerTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              작성 가이드라인
              <button onClick={() => setIsGuideOpen(!isGuideOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#1565C0", marginLeft: "auto" }}>
                {isGuideOpen ? "접기 ▲" : "펼치기 ▼"}
              </button>
            </div>
            {isGuideOpen && <div className={styles.guidelineContent} style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontSize: "12px", marginTop: "8px" }}>{guideline}</div>}
          </div>
        )}

        {entries.map((entry, idx) => (
          <div key={entry.entryId || idx} id={`entry-${entry.entryId}`} className={styles.entryCard}>
            <div className={styles.entryOrder}>
              <div className={styles.entryOrderNum}>{entry.entryOrder || idx + 1}</div>
              {idx < entries.length - 1 && <div className={styles.entryOrderLine} />}
            </div>
            <div className={styles.entryBody}>
              <div className={styles.entryHeader} style={{ position: 'relative' }}>
                <div className={styles.avatar} />
                <span className={styles.entryUser}>{entry.nickname}</span>
                <span className={styles.entryMeta}>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}</span>
                
                <button 
                  className={styles.menuBtn}
                  onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                >⋮</button>

                {activeMenu === idx && (
                  <div className={styles.reportDropdown}>
                    <button onClick={() => openEntryReport(entry)} className={styles.reportBtn}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 18h14"></path>
                  <path d="M17 18v-5a5 5 0 0 0-10 0v5"></path>
                  <path d="M2 13h2"></path>
                  <path d="M20 13h2"></path>
                  <path d="M12 2v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 6.34 1.41-1.41"></path>
                </svg>신고하기
                    </button>
                  </div>
                )}
              </div>
              
              {entry.status === "BLINDED" ? (
                <div className={styles.blindBox}>
                  <div className={styles.blindTitle}>🚨 가이드라인 위반으로 블라인드 처리되었습니다.</div>
                  <div className={styles.blindText}><strong>🤖 AI 요약:</strong> {entry.adminMessage || "부적절한 내용이 포함되어 있습니다."}</div>
                </div>
              ) : (
                <div className={styles.entryText}>{entry.entryText}</div>
              )}
            </div>
          </div>
        ))}

        {/* TTS 컨트롤러 */}
        <div className={styles.ttsBar}>
          <div className={styles.ttsRow}>
            <button className={styles.playBtn} onClick={handlePlayToggle}>
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>
            <div className={styles.ttsProgressBarWrapper} ref={progressBarRef} onMouseDown={handleProgressMouseDown}>
              <div className={styles.ttsProgressBar}>
                <div className={styles.ttsProgressFill} style={{ width: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }} />
                <div className={styles.ttsProgressThumb} style={{ left: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }} />
              </div>
            </div>
            <span className={styles.timeLabel}>{formatTime(audioTime)} / {formatTime(audioDuration)}</span>
            <span className={styles.speedBadge}>{playbackRate}×</span>
            <button className={styles.settingsBtn} onClick={handleSettingsClick}>설정</button>
          </div>

          {showSettings && (
            <div className={styles.settingsPanel} ref={settingsPanelRef}>
              <div className={styles.settingsSection}>
                <div className={styles.modeToggle}>
                  <button className={`${styles.modeToggleBtn} ${!multiVoiceMode ? styles.modeToggleBtnActive : ""}`} onClick={() => setMultiVoiceMode(false)}>단일 목소리</button>
                  <button className={`${styles.modeToggleBtn} ${multiVoiceMode ? styles.modeToggleBtnActive : ""}`} onClick={() => setMultiVoiceMode(true)}>멀티 보이스</button>
                </div>
              </div>
              
              {!multiVoiceMode ? (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionTitle}>목소리 선택</div>
                  <select className={styles.voiceSelect} value={pendingVoiceId ?? currentVoiceId ?? ""} onChange={e => setPendingVoiceId(Number(e.target.value))}>
                    <option value="">목소리를 골라주세요</option>
                    {voices.map(v => <option key={v.voiceId} value={v.voiceId}>{v.voiceStyle} ({v.voiceType})</option>)}
                  </select>
                  {pendingVoiceId && <button className={styles.applyBtn} onClick={() => handleGenerateTts(pendingVoiceId)}>이 목소리로 생성</button>}
                </div>
              ) : (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionTitle}>멀티 보이스 설정</div>
                  <div className={styles.voiceSubLabel}>참여자 1</div>
                  <select className={styles.voiceSelect} onChange={e => setPendingMultiVoice(p => ({ ...p, voice1Id: Number(e.target.value) }))}>
                    <option value="">선택</option>
                    {voices.map(v => <option key={v.voiceId} value={v.voiceId}>{v.voiceStyle}</option>)}
                  </select>
                  <div className={styles.voiceSubLabel}>참여자 2</div>
                  <select className={styles.voiceSelect} onChange={e => setPendingMultiVoice(p => ({ ...p, voice2Id: Number(e.target.value) }))}>
                    <option value="">선택</option>
                    {voices.map(v => <option key={v.voiceId} value={v.voiceId}>{v.voiceStyle}</option>)}
                  </select>
                  <button className={styles.applyBtn} onClick={handleGenerateMultiVoiceTts}>멀티 보이스 생성</button>
                </div>
              )}

              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionTitle}>배속 조절</div>
                <div className={styles.speedBarWrapper} ref={speedBarRef} onMouseDown={handleSpeedMouseDown}>
                  <div className={styles.speedBar}>
                    <div className={styles.speedFill} style={{ width: `${((playbackRate - 0.75) / 1.25) * 100}%` }} />
                    <div className={styles.speedThumb} style={{ left: `${((playbackRate - 0.75) / 1.25) * 100}%` }} />
                  </div>
                </div>
                <div className={styles.speedPresets}>
                  {SPEED_PRESETS.map(s => <button key={s} className={`${styles.speedPreset} ${playbackRate === s ? styles.speedPresetActive : ""}`} onClick={() => applySpeed(s)}>{s}x</button>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 이어쓰기 하단 */}
        {!isWriting ? (
          <button className={styles.writeOpenBtn} onClick={handleStartWriting}>이야기 이어 쓰기 ✍️</button>
        ) : (
          <div className={styles.writeCard}>
            <div className={styles.writeHeader}>
              <div className={styles.writeTitle}>직접 쓰는 다음 이야기</div>
              <button className={styles.closeWriteBtn} onClick={handleCancelWriting}>✕ 취소</button> 
            </div>
            <textarea value={myText} onChange={e => setMyText(e.target.value)} placeholder="최소 50자 이상 작성해 주세요..." rows={6} className={styles.textarea} maxLength={MAX_CHARS + 20} />
            <div className={styles.writeFooter}>
              <div className={styles.charCountWrap}><span style={{ color: charColor() }}>{myText.length}</span> <span className={styles.charCountSep}>/</span> <span className={styles.charCountMax}>{MAX_CHARS}자</span></div>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting || myText.length < MIN_CHARS || myText.length > MAX_CHARS}>
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        )}
      </div>

      <ReportModal isOpen={!!reportInfo} onClose={() => setReportInfo(null)} targetInfo={reportInfo} />
    </div>
  );
}
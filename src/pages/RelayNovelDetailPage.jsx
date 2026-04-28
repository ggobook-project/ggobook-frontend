import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
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
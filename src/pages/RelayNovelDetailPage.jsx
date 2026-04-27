import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import api from "../api/axios" 
import styles from "../styles/RelayNovelDetailPage.module.css"

const MAX_CHARS = 500
const MIN_CHARS = 50

export default function RelayNovelDetailPage() {
  const navigate = useNavigate()
  const { relayNovelId } = useParams()
  const [myText, setMyText] = useState("")
  const [novel, setNovel] = useState(null)
  const [entries, setEntries] = useState([])
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [guideline, setGuideline] = useState("") 
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isLoggedIn = !!localStorage.getItem("accessToken")

  const loadDetail = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("accessToken")
      const response = await api.get(`/api/relay-novels/${relayNovelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNovel(response.data)
      setEntries(response.data.entries || response.data.entryList || [])
    } catch {
      setNovel({ title: "릴레이 소설 제목", starter: "홍길동", participantCount: 12, entryCount: 4 })
      setEntries(Array.from({ length: 4 }, (_, i) => ({
        entryId: i + 1, user: `참여자${i + 1}`, entryOrder: i + 1,
        entryText: `${i + 1}번째 이야기가 이어집니다. 주인공은 새로운 모험을 시작하게 되는데...`,
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

  const handleSubmit = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (myText.length < MIN_CHARS) { alert(`${MIN_CHARS}자 이상 작성해주세요.`); return }
    if (myText.length > MAX_CHARS) { alert(`${MAX_CHARS}자 이내로 작성해주세요.`); return }
    
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("accessToken")
      await api.post(`/api/relay-novels/${relayNovelId}/entries`, {
        entryText: myText
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      alert("이어쓰기가 등록되었습니다!")
      setMyText("")
      setIsWriting(false) // 🌟 제출 성공 시 폼 닫기
      loadDetail()
    } catch {
      alert("등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const charColor = () => {
    if (myText.length < MIN_CHARS) return "#E53935"
    if (myText.length > MAX_CHARS) return "#E53935"
    return "#2196F3"
  }

  if (isLoading) return <div className={styles.pageWrapper}><div className={styles.loading}>불러오는 중...</div></div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/relay")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <div className={styles.headerTitle}>{novel?.title}</div>
        <div className={styles.headerMeta}>
          시작: {novel?.starterNickname || "알 수 없음"} · 참여자 {novel.uniqueParticipantCount}명 · 이어쓰기 {entries.length}개
        </div>
      </div>

      <div className={styles.content}>
        
        {guideline && (
          <div className={styles.guidelineBanner}>
            <div className={styles.guidelineBannerTitle} style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                작성 가이드라인
              </div>
              <button 
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#1565C0" }}
              >
                {isGuideOpen ? "접기 ▲" : "펼치기 ▼"}
              </button>
            </div>
            
            {isGuideOpen && (
              <div className={styles.guidelineContent} style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontSize: "13px", marginTop: "10px" }}>
                {guideline}
              </div>
            )}
          </div>
        )}

        {entries.map((entry, idx) => (
          <div key={entry.entryId || entry.id} className={styles.entryCard}>
            <div className={styles.entryOrder}>
              <div className={styles.entryOrderNum}>{entry.entryOrder || idx + 1}</div>
              {idx < entries.length - 1 && <div className={styles.entryOrderLine} />}
            </div>
            <div className={styles.entryBody}>
              <div className={styles.entryHeader}>
                <div className={styles.avatar} />
                <span className={styles.entryUser}>{entry.nickname || "알 수 없음"}</span>
                <span className={styles.entryMeta}>
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : entry.date}
                </span>
              </div>
              
              {entry.status === "BLINDED" ? (
                <div className={styles.blindBox}>
                  <div className={styles.blindTitle}>
                    🚨 [가이드라인 위반으로 블라인드 처리된 회차입니다.]
                  </div>
                  <div className={styles.blindText}>
                    <strong>🤖 AI 자동 요약본: </strong> {entry.adminMessage || entry.blindMessage}
                  </div>
                </div>
              ) : (
                <div className={styles.entryText}>{entry.entryText || entry.text}</div>
              )}
            </div>
          </div>
        ))}

        {/* 🌟 수정된 부분: 이어쓰기 폼 토글 로직 적용 */}
        {!isWriting ? (
          <button 
            className={styles.writeOpenBtn}
            onClick={() => {
              if (!isLoggedIn) {
                navigate("/login");
              } else {
                setIsWriting(true);
              }
            }}
          >
            이어쓰기 참여하기 ✍️
          </button>
        ) : (
          <div className={styles.writeCard}>
            <div className={styles.writeHeader}>
              <div className={styles.writeTitle}>이어쓰기</div>
              <button className={styles.closeWriteBtn} onClick={() => setIsWriting(false)}>✕ 닫기</button>
            </div>
            
            <div className={styles.charGuide}>
              <span style={{ color: myText.length < MIN_CHARS ? "#E53935" : "#90A4C8" }}>
                최소 {MIN_CHARS}자
              </span>
              <span style={{ color: "#90A4C8" }}>~</span>
              <span style={{ color: myText.length > MAX_CHARS ? "#E53935" : "#90A4C8" }}>
                최대 {MAX_CHARS}자
              </span>
            </div>
            
            <textarea
              value={myText}
              onChange={e => setMyText(e.target.value)}
              onFocus={() => !isLoggedIn && navigate("/login")}
              placeholder={isLoggedIn ? "이야기를 이어서 써주세요..." : "로그인 후 이어쓰기를 작성할 수 있습니다"}
              rows={6}
              className={styles.textarea}
              readOnly={!isLoggedIn}
              maxLength={MAX_CHARS + 50}
            />
            
            <div className={styles.writeFooter}>
              <div className={styles.charCountWrap}>
                <span style={{ color: charColor(), fontWeight: 600 }}>{myText.length}</span>
                <span className={styles.charCountSep}>/</span>
                <span className={styles.charCountMax}>{MAX_CHARS}자</span>
                {myText.length < MIN_CHARS && myText.length > 0 && (
                  <span className={styles.charWarning}>{MIN_CHARS - myText.length}자 더 필요</span>
                )}
                {myText.length > MAX_CHARS && (
                  <span className={styles.charWarning}>{myText.length - MAX_CHARS}자 초과</span>
                )}
              </div>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSubmitting || myText.length < MIN_CHARS || myText.length > MAX_CHARS}
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </div>
            
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min((myText.length / MAX_CHARS) * 100, 100)}%`,
                  background: myText.length > MAX_CHARS ? "#E53935" : myText.length >= MIN_CHARS ? "#2196F3" : "#BBDEFB"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
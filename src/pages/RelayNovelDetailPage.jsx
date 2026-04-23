import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import axios from "../api/axios"
import styles from "../styles/RelayNovelDetailPage.module.css"

const MAX_CHARS = 500
const MIN_CHARS = 50

export default function RelayNovelDetailPage() {
  const navigate = useNavigate()
  const { relayNovelId } = useParams()
  const [myText, setMyText] = useState("")
  const [novel, setNovel] = useState(null)
  const [entries, setEntries] = useState([])
  const [guidelines, setGuidelines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoggedIn = !!localStorage.getItem("accessToken")

  const loadDetail = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("accessToken")
      const response = await axios.get(`http://localhost:8080/api/relay-novels/${relayNovelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNovel(response.data)
      setEntries(response.data.entries || [])
    } catch {
      // 더미 fallback
      setNovel({ title: "릴레이 소설 제목", starter: "홍길동", participantCount: 12, entryCount: 4 })
      setEntries(Array.from({ length: 4 }, (_, i) => ({
        entryId: i + 1, user: `참여자${i + 1}`, entryOrder: i + 1,
        entryText: `${i + 1}번째 이야기가 이어집니다. 주인공은 새로운 모험을 시작하게 되는데...`,
        createdAt: `2026.04.${10 + i}`
      })))
    } finally {
      setIsLoading(false)
    }
  }, [relayNovelId])

  const loadGuidelines = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/relay-guidelines")
      setGuidelines(response.data || [])
    } catch {
      setGuidelines([
        { id: 1, title: "분량 가이드", content: "각 이어쓰기는 50자 이상 500자 이내로 작성해주세요." },
        { id: 2, title: "내용 가이드", content: "이전 내용의 흐름을 자연스럽게 이어가야 합니다." },
        { id: 3, title: "금지 사항", content: "폭력적이거나 선정적인 내용은 작성할 수 없습니다." },
      ])
    }
  }

  useEffect(() => {
    loadDetail()
    loadGuidelines()
  }, [relayNovelId])

  const handleSubmit = async () => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (myText.length < MIN_CHARS) { alert(`${MIN_CHARS}자 이상 작성해주세요.`); return }
    if (myText.length > MAX_CHARS) { alert(`${MAX_CHARS}자 이내로 작성해주세요.`); return }
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("accessToken")
      await axios.post(`http://localhost:8080/api/relay-novels/${relayNovelId}/entries`, {
        entryText: myText
      }, { headers: { Authorization: `Bearer ${token}` } })
      alert("이어쓰기가 등록되었습니다!")
      setMyText("")
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
          시작: {novel?.starter || novel?.userId} · 참여자 {novel?.participantCount || 0}명 · 이어쓰기 {entries.length}개
        </div>
      </div>

      <div className={styles.content}>
        {/* 가이드라인 배너 */}
        {guidelines.length > 0 && (
          <div className={styles.guidelineBanner}>
            <div className={styles.guidelineBannerTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              작성 가이드라인
            </div>
            <div className={styles.guidelineList}>
              {guidelines.map(g => (
                <div key={g.id} className={styles.guidelineItem}>
                  <span className={styles.guidelineTitle}>{g.title}</span>
                  <span className={styles.guidelineContent}>{g.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 에피소드 흐름 */}
        {entries.map((entry, idx) => (
          <div key={entry.entryId || entry.id} className={styles.entryCard}>
            <div className={styles.entryOrder}>
              <div className={styles.entryOrderNum}>{entry.entryOrder || idx + 1}</div>
              {idx < entries.length - 1 && <div className={styles.entryOrderLine} />}
            </div>
            <div className={styles.entryBody}>
              <div className={styles.entryHeader}>
                <div className={styles.avatar} />
                <span className={styles.entryUser}>{entry.user || entry.userId}</span>
                <span className={styles.entryMeta}>
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : entry.date}
                </span>
              </div>
              <div className={styles.entryText}>{entry.entryText || entry.text}</div>
            </div>
          </div>
        ))}

        {/* 이어쓰기 폼 */}
        <div className={styles.writeCard}>
          <div className={styles.writeTitle}>이어쓰기</div>
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
          {/* 글자수 프로그레스바 */}
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
      </div>
    </div>
  )
}
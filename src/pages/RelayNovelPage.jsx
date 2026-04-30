import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../api/axios" 
import styles from "../styles/RelayNovelPage.module.css"
import ReportModal from "../components/ReportModal" 

export default function RelayNovelPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sort, setSort] = useState("최신순")
  const [relays, setRelays] = useState([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // 신고 관련 상태
  const [reportInfo, setReportInfo] = useState(null)

  const observerRef = useRef(null)

  // 🌟 [수정] 데이터 로드 로직 (기존 로직 완전 유지)
  const loadRelays = useCallback(async (pageNum, sortType) => {
    setIsLoading(true)
    const sortValue = sortType === "인기순" ? "popular" : "latest"

    try {
      const response = await api.get(`/api/relay-novels`, {
        params: { page: pageNum, size: 10, sortType: sortValue }
      })
      const data = response.data
      const list = Array.isArray(data) ? data : (data.content ? data.content : [])
      
      setRelays(prev => pageNum === 0 ? list : [...prev, ...list])
      setHasNext(data.last === false)
    } catch (error) {
      const dummy = Array.from({ length: 5 }, (_, i) => ({
        relayNovelId: i + 1 + pageNum * 5,
        title: `릴레이 소설 ${i + 1 + pageNum * 5}`,
        starterNickname: "홍길동",
        uniqueParticipantCount: i * 3 + 5,
        entryCount: i * 10 + 8,
        preview: "어느 날 갑자기 눈을 떴을 때...",
        userId: 100
      }))
      setRelays(prev => pageNum === 0 ? dummy : [...prev, ...dummy])
      setHasNext(pageNum < 2)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 🌟 정렬 기준 변경 시 초기 로드
  useEffect(() => {
    setPage(0)
    setRelays([])
    setHasNext(true)
    loadRelays(0, sort)
  }, [sort, loadRelays])

  // 🌟 무한 스크롤 핸들러 (기존 로직 유지)
  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasNext && !isLoading) {
      setPage(prevPage => {
        const nextPage = prevPage + 1
        loadRelays(nextPage, sort)
        return nextPage
      })
    }
  }, [hasNext, isLoading, sort, loadRelays])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 })
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  // 🌟 [추가] 어드민 이동 시 해당 카드 자동 스크롤 및 강조
  useEffect(() => {
    if (isLoading || relays.length === 0) return

    const params = new URLSearchParams(location.search)
    const novelId = params.get("novelId")

    if (novelId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`novel-${novelId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.classList.add(styles.adminHighlight)
          
          setTimeout(() => {
            element.classList.remove(styles.adminHighlight)
          }, 3000)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [location.search, isLoading, relays])

  // 신고 버튼 클릭 핸들러
  const handleReportClick = (e, relay) => {
    e.stopPropagation()
    setReportInfo({
      targetType: 'RELAY_NOVEL',
      targetId: relay.relayNovelId || relay.id,
      reportedUserId: relay.userId || relay.starterId || relay.memberId || relay.authorId,
      targetTitle: `${relay.starterNickname || "알 수 없음"} 님`
    })
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설</div>
        <div className={styles.headerSubtitle}>함께 써내려가는 이야기</div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.sortGroup}>
            {["최신순", "인기순"].map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`${styles.sortBtn} ${sort === s ? styles.sortBtnActive : ""}`}
              >{s}</button>
            ))}
          </div>
          <button className={styles.newBtn} onClick={() => navigate("/relay/register")}>릴레이 추가</button>
        </div>

        {relays.map(r => (
          <div
            key={r.relayNovelId || r.id}
            id={`novel-${r.relayNovelId || r.id}`} // 🌟 스크롤 타겟 ID 부여
            className={styles.relayCard}
            onClick={() => navigate(`/relay/${r.relayNovelId || r.id}`)}
          >
            <div className={styles.cardTopRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className={styles.relayTitle}>{r.title}</div>
              <button 
                className={styles.reportBtn} 
                onClick={(e) => handleReportClick(e, r)}
                title="신고하기"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 18h14"></path>
                  <path d="M17 18v-5a5 5 0 0 0-10 0v5"></path>
                  <path d="M2 13h2"></path>
                  <path d="M20 13h2"></path>
                  <path d="M12 2v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 6.34 1.41-1.41"></path>
                </svg>
              </button>
            </div>
            
            <div className={styles.relayMeta}>
              <span>시작: {r.starterNickname || "알 수 없음"}</span>
              <span>참여자 {r.uniqueParticipantCount || 0}명</span>
              <span>이어쓰기 {r.entryCount || (r.entries ? r.entries.length : 0)}개</span>
            </div>
            <div className={styles.relayPreview}>{r.preview || r.description || "내용 없음"}</div>
          </div>
        ))}

        <div ref={observerRef} className={styles.observer}>
          {isLoading && <span className={styles.observerText}>불러오는 중...</span>}
          {!hasNext && relays.length > 0 && <span className={styles.observerText}>모든 릴레이를 불러왔습니다.</span>}
        </div>
      </div>

      <ReportModal 
        isOpen={!!reportInfo} 
        onClose={() => setReportInfo(null)} 
        targetInfo={reportInfo} 
      />
    </div>
  )
}
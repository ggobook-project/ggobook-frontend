import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios" 
import styles from "../styles/RelayNovelPage.module.css"
import ReportModal from "../components/ReportModal" 

export default function RelayNovelPage() {
  const navigate = useNavigate()
  const [sort, setSort] = useState("최신순")
  const [relays, setRelays] = useState([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // 신고 관련 상태
  const [reportInfo, setReportInfo] = useState(null)

  const observerRef = useRef(null)

  // 🌟 [수정] 무한 루프 방지: 의존성 배열을 비우기 위해 필요한 값들을 인자로 직접 받음
  const loadRelays = useCallback(async (pageNum, sortType) => {
    // 로딩 중일 때는 중복 요청 방지
    setIsLoading(true)
    
    const sortValue = sortType === "인기순" ? "popular" : "latest"

    try {
      const response = await api.get(`/api/relay-novels`, {
        params: { page: pageNum, size: 10, sortType: sortValue }
      })
      const data = response.data
      const list = Array.isArray(data) ? data : (data.content ? data.content : [])
      
      // pageNum이 0이면 리스트 교체, 아니면 기존 리스트에 추가
      setRelays(prev => pageNum === 0 ? list : [...prev, ...list])
      setHasNext(data.last === false)
    } catch (error) {
      // 서버 에러 시 더미 데이터 로드
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
  }, []) // 🌟 함수가 절대 재생성되지 않도록 의존성 제거

  // 🌟 정렬 기준 변경 시 초기 로드
  useEffect(() => {
    setPage(0)
    setRelays([])
    setHasNext(true)
    loadRelays(0, sort)
  }, [sort, loadRelays])

  // 🌟 [수정] 스크롤 관찰자 핸들러: 최신 상태값을 참조하기 위해 함수형 업데이트 사용
  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    // 락(isLoading)이 걸려있지 않고, 다음 페이지가 있을 때만 실행
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

  const handleReportClick = (e, relay) => {
  e.stopPropagation();
  
  // 🌟 [중요] 여기서 relay를 찍었을 때, 숫자로 된 유저 ID가 
  // 어떤 필드(예: starterId, memberId 등)에 들어있는지 확인 후 아래에 추가하세요.
  console.log("부모에서 확인한 데이터:", relay); 

  setReportInfo({
    targetType: 'RELAY_NOVEL',
    targetId: relay.relayNovelId || relay.id,
    
    // 🌟 이 부분을 아래처럼 여러 후보군을 넣어서 undefined를 방지하세요!
    reportedUserId: relay.userId || relay.starterId || relay.memberId || relay.authorId,
    
    targetTitle: `${relay.starterNickname || "알 수 없음"} 님`
  });
};

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
    className={styles.relayCard}
    onClick={() => navigate(`/relay/${r.relayNovelId || r.id}`)}
  >
    <div className={styles.cardTopRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className={styles.relayTitle}>{r.title}</div>
      
      {/* 🌟 CSS 클래스로 깔끔하게 정리된 신고 버튼 */}
      <button 
  className={styles.reportBtn} 
  onClick={(e) => handleReportClick(e, r)}
  title="신고하기"
>
  {/* 🚨 진짜 사이렌(경고등) 모양 아이콘 */}
  <svg 
  width="20" 
  height="20" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
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

        <div ref={observerRef} className={styles.observer} style={{ minHeight: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
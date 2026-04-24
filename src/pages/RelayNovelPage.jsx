import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios" 
import styles from "../styles/RelayNovelPage.module.css"

export default function RelayNovelPage() {
  const navigate = useNavigate()
  const [sort, setSort] = useState("최신순")
  const [relays, setRelays] = useState([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef(null)

  const loadRelays = useCallback(async (pageNum, sortType) => {
    if (isLoading) return
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
    } catch {
      // 🌟 초보자 포인트: 더미 데이터를 넣더라도 무한루프에 빠지지 않도록 방어 로직이 필요합니다.
      const dummy = Array.from({ length: 5 }, (_, i) => ({
        relayNovelId: i + 1 + pageNum * 5,
        title: `릴레이 소설 ${i + 1 + pageNum * 5}`,
        starter: "홍길동",
        participantCount: i * 3 + 5,
        entryCount: i * 10 + 8,
        preview: "어느 날 갑자기 눈을 떴을 때..."
      }))
      setRelays(prev => pageNum === 0 ? dummy : [...prev, ...dummy])
      setHasNext(pageNum < 2)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(0)
    setRelays([])
    setHasNext(true)
    loadRelays(0, sort)
  }, [sort, loadRelays])

  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasNext && !isLoading) {
      const next = page + 1
      setPage(next)
      loadRelays(next, sort)
    }
  }, [hasNext, isLoading, page, sort, loadRelays])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 })
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설</div>
        <div className={styles.headerSubtitle}>함께 써내려가는 이야기</div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          {/* 팀장님 특유의 예쁜 밑줄 탭 디자인 영역 */}
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
            <div className={styles.relayTitle}>{r.title}</div>
            <div className={styles.relayMeta}>
  <span>시작: {r.starter || r.userId}</span>
  {/* participants가 배열로 올 경우를 대비해 length 처리 */}
  <span>참여자 {r.participantCount || (r.participants ? r.participants.length : 0)}명</span>
  {/* 🌟 entries 배열의 길이(length)를 출력하도록 수정! */}
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
    </div>
  )
}
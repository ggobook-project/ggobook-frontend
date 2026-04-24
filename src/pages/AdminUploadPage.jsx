import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import styles from "../styles/AdminUploadPage.module.css"

const days = ["월", "화", "수", "목", "금", "토", "일", "완결"]
const contentTypes = ["웹툰", "웹소설"]

const generateContents = (page, type) =>
  Array.from({ length: 12 }, (_, i) => ({
    contentId: page * 12 + i + 1,
    title: `작품 제목 ${page * 12 + i + 1}`,
    genre: i % 2 === 0 ? "액션" : "로맨스",
    thumbnailUrl: null,
    type,
  }))

export default function AdminUploadPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState("웹툰")
  const [activeDay, setActiveDay] = useState("월")
  const [query, setQuery] = useState("")
  const [contents, setContents] = useState(() => generateContents(0, "웹툰"))
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  // 탭 변경 시 초기화
  useEffect(() => {
    setContents(generateContents(0, activeType))
    setPage(0)
    setHasMore(true)
  }, [activeType, activeDay])

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    setLoading(true)
    setTimeout(() => {
      const nextPage = page + 1
      if (nextPage >= 5) { // 더미 데이터 최대 5페이지
        setHasMore(false)
        setLoading(false)
        return
      }
      setContents(prev => [...prev, ...generateContents(nextPage, activeType)])
      setPage(nextPage)
      setLoading(false)
    }, 600)
  }, [loading, hasMore, page, activeType])

  // IntersectionObserver 연결
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [loadMore])

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const CardItem = ({ item }) => (
    <div
      className={styles.cardItem}
      onClick={() => navigate(`/admin/uploads/${item.contentId}`)}
    >
      {item.thumbnailUrl
        ? <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder} />
      }
      <div className={styles.cardTitle}>{item.title}</div>
      <div className={styles.cardGenre}>{item.genre}</div>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 관리</div>
        <div className={styles.headerSubtitle}>회차 공개/비공개를 관리하세요</div>
        <div className={styles.headerInner}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="작품명, 작가명 검색"
              className={styles.searchInput}
            />
            {query && (
              <span onClick={() => setQuery("")} style={{ color: "#90A4C8", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>✕</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* 웹툰 / 웹소설 상위 탭 */}
        <div className={styles.tabGroup}>
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`${styles.tabBtn} ${activeType === type ? styles.tabBtnActive : ""}`}
            >{type}</button>
          ))}
        </div>

        {/* 요일 하위 탭 */}
        <div className={styles.tabGroup}>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`${styles.tabBtn} ${activeDay === d ? styles.tabBtnActive : ""}`}
            >{d}</button>
          ))}
        </div>

        <div className={styles.sectionTitle}>{activeDay}요 {activeType}</div>
        <div className={styles.dailyGrid}>
          {contents.map((item) => (
            <CardItem key={item.contentId} item={item} />
          ))}
        </div>

        {/* 무한스크롤 감지 sentinel */}
        <div ref={sentinelRef} className={styles.sentinel} />

        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        )}

        {!hasMore && (
          <div className={styles.noMore}>모든 작품을 불러왔습니다</div>
        )}
      </div>
    </div>
  )
}
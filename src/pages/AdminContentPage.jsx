import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import styles from "../styles/AdminContentPage.module.css"

const contentTypes = ["웹툰", "웹소설"]
const days = ["전체", "월", "화", "수", "목", "금", "토", "일", "완결"]
const PAGE_SIZE = 18

export default function AdminContentPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState("웹툰")
  const [query, setQuery] = useState("")
  const [activeDay, setActiveDay] = useState("전체")
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({ type: "웹툰", keyword: "", day: "전체" })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get("/api/admin/contents", {
          params: {
            type: filters.type,
            keyword: filters.keyword,
            day: filters.day === "전체" ? null : filters.day,
            page: currentPage,
            size: PAGE_SIZE
          }
        })
        setContents(response.data.content || [])
        setTotalPages(response.data.totalPages || 0)
      } catch (error) {
        console.error("작품 목록 로드 실패:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentPage, filters])

  const handleTypeChange = (type) => {
    setActiveType(type)
    setFilters(f => ({ ...f, type }))
    setCurrentPage(0)
  }

  const handleDayChange = (day) => {
    setActiveDay(day)
    setFilters(f => ({ ...f, day }))
    setCurrentPage(0)
  }

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setFilters(f => ({ ...f, keyword: query }))
      setCurrentPage(0)
    }
  }

  const renderPageButtons = () => {
    if (totalPages <= 1) return null
    const buttons = []
    const visible = new Set([0, totalPages - 1])
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
      visible.add(i)
    }
    const pages = [...visible].sort((a, b) => a - b)
    pages.forEach((page, idx) => {
      if (idx > 0 && page - pages[idx - 1] > 1) {
        buttons.push(<span key={`gap-${page}`} className={styles.ellipsis}>…</span>)
      }
      buttons.push(
        <button
          key={page}
          className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
          onClick={() => setCurrentPage(page)}
        >
          {page + 1}
        </button>
      )
    })
    return buttons
  }

  const CardItem = ({ item }) => (
    <div
      className={styles.cardItem}
      onClick={() => navigate(`/admin/content/${item.contentId}`)}
    >
      {item.thumbnailUrl
        ? <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder} />
      }
      <div className={styles.cardTitle}>{item.title}</div>
      <div className={styles.cardGenre}>{item.genre}</div>
      <div className={styles.cardStatus}>작가: {item.authorNickname}</div>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 관리</div>
        <div className={styles.headerSubtitle}>실제 연재 중인 작품 리스트입니다.</div>
        <div className={styles.headerInner}>
          <div className={styles.searchBox}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="작품명 또는 작가명 검색 후 엔터"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`${styles.tabBtn} ${activeType === type ? styles.tabBtnActive : ""}`}
            >{type}</button>
          ))}
        </div>
        <div className={styles.dayTabGroup}>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => handleDayChange(day)}
              className={`${styles.dayTabBtn} ${activeDay === day ? styles.dayTabBtnActive : ""}`}
            >{day}</button>
          ))}
        </div>

        <div className={styles.sectionTitle}>{activeType} 목록</div>

        {loading ? (
          <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
        ) : contents.length === 0 ? (
          <div className={styles.noMore}>검색 결과가 없거나 등록된 작품이 없습니다.</div>
        ) : (
          <div className={styles.dailyGrid}>
            {contents.map((item) => (
              <CardItem key={item.contentId} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageNavBtn}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >‹ 이전</button>
            {renderPageButtons()}
            <button
              className={styles.pageNavBtn}
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >다음 ›</button>
          </div>
        )}
      </div>
    </div>
  )
}

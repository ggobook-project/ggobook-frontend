import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "../styles/SearchResultPage.module.css"
import api from "../api/axios"

export default function SearchResultPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("keyword") || "")
  const [filter, setFilter] = useState("전체")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [tags, setTags] = useState([])

  const typeParam = (filter) => {
    if (filter === "웹툰") return "COMIC"
    if (filter === "웹소설") return "NOVEL"
    return null
  }

  const loadResults = async (keyword, filterType) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({ page: 0, size: 20 })
      if (keyword) params.append("keyword", keyword)
      if (filterType) params.append("type", filterType)
      const response = await api.get(`/api/contents/?${params.toString()}`)
      const data = response.data 
      const list = Array.isArray(data) ? data : (data.content ?? [])

       const listWithTags = await Promise.all(
        list.map(async (item) => {
            try {
                const tagRes = await api.get(`/api/contents/${item.contentId}/tags`)
                return { ...item, tags: tagRes.data || [] } 
            } catch {
                return { ...item, tags: [] }
            }
        })
    )

      setResults(listWithTags)
    setTotalCount(data.totalElements ?? listWithTags.length)
    } catch (error) {
      console.error("검색 실패 : ", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const keyword = searchParams.get("keyword") || ""
    setQuery(keyword)
    loadResults(keyword, typeParam(filter))
  }, [])

  useEffect(() => {
    loadResults(query, typeParam(filter))
  }, [filter])

  const handleSearch = () => {
    setSearchParams(query ? { keyword: query } : {})
    loadResults(query, typeParam(filter))
  }

  const typeLabel = (type) => {
    if (type === "COMIC") return "웹툰"
    if (type === "NOVEL") return "웹소설"
    return type ?? ""
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>검색</div>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="작품명, 작가명, 태그 검색"
            className={styles.searchInput}
          />
          {query && (
            <span onClick={() => setQuery("")} style={{ color: "#90A4C8", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>✕</span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterGroup}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            >{f}</button>
          ))}
        </div>

        {loading
          ? <div className={styles.resultCount}>검색 중...</div>
          : <div className={styles.resultCount}>검색 결과 {totalCount}건</div>
        }

        {!loading && results.length === 0 && (
          <div className={styles.emptyMsg}>검색 결과가 없습니다.</div>
        )}

        {results.map(r => (
          <div key={r.contentId} className={styles.card} onClick={() => navigate(`/contents/${r.contentId}`)}>
            <div className={styles.thumbnail}>
              {r.thumbnailUrl && <img src={r.thumbnailUrl} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div>
              <div className={styles.cardTitle}>{r.title}</div>
              <div className={styles.cardMeta}>{r.genre}</div>
              <div className={styles.badges}>
                <span className={styles.badge}>{typeLabel(r.type)}</span>
                {r.rating != null && <span className={styles.badge}>★ {r.rating.toFixed(1)}</span>}
              </div>
              {r.tags && r.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                    {r.tags.map(tag => (
                        <span key={tag.tagId} style={{
                            background: "#E3F2FD", borderRadius: 20,
                            padding: "2px 8px", fontSize: 11, color: "#1565C0"
                        }}>
                            #{tag.tagName}
                        </span>
                    ))}
                </div>
            )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
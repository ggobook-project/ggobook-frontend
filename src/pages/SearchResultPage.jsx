import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/SearchResultPage.module.css"

export default function SearchResultPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("전체")

  const results = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `검색 결과 작품 ${i + 1}`, author: "작가명",
    type: i % 2 === 0 ? "웹툰" : "웹소설",
    genre: ["로맨스", "판타지", "무협"][i % 3],
    rating: (4 + Math.random() * 0.9).toFixed(1)
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>검색</div>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="작품명, 작가명, 태그 검색" className={styles.searchInput} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterGroup}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}>{f}</button>
          ))}
        </div>
        <div className={styles.resultCount}>검색 결과 {results.length}건</div>
        {results.map(r => (
          <div key={r.id} className={styles.card} onClick={() => navigate("/contents/1")}>
            <div className={styles.thumbnail} />
            <div>
              <div className={styles.cardTitle}>{r.title}</div>
              <div className={styles.cardMeta}>{r.author} · {r.genre}</div>
              <div className={styles.badges}>
                <span className={styles.badge}>{r.type}</span>
                <span className={styles.badge}>★ {r.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
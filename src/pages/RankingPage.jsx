import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/axios" // 🌟 axios 추가
import styles from "../styles/RankingPage.module.css"

export default function RankingPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState("전체")
  const [items, setItems] = useState([]) // 🌟 진짜 데이터를 담을 그릇
  const [loading, setLoading] = useState(true)

  // 🌟 핵심: 카테고리가 바뀔 때마다 랭킹 데이터를 다시 불러옵니다.
  useEffect(() => {
    const fetchRankingData = async () => {
      setLoading(true)
      try {
        // "전체"면 type 파라미터를 안 보내고, "웹툰/웹소설"이면 보냅니다.
        // 그리고 🌟 sortType=popular 무전기를 달아줍니다!
        const typeParam = category === "전체" ? "" : `&type=${category}`
        const response = await api.get(`/api/contents/?sortType=popular&page=0&size=10${typeParam}`)
        
        // 가져온 데이터에 순위(rank) 번호를 매겨서 저장합니다.
        const rankedData = response.data.content.map((item, index) => ({
          ...item,
          rank: index + 1
        }))
        setItems(rankedData)
      } catch (error) {
        console.error("랭킹 데이터를 불러오는데 실패했습니다:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankingData()
  }, [category])

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>랭킹</div>
        <div className={styles.headerSubtitle}>지금 가장 인기있는 작품</div>
      </div>

      <div className={styles.content}>
        {/* 전체/웹툰/웹소설 탭 */}
        <div className={styles.tabGroup} style={{ marginBottom: 24 }}>
          {["전체", "웹툰", "웹소설"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`${styles.tabBtn} ${category === cat ? styles.tabBtnActive : ""}`}
            >{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#90A4C8' }}>랭킹을 불러오는 중...</div>
        ) : items.length > 0 ? (
          items.map(item => (
            <div key={item.contentId} className={styles.rankCard} onClick={() => navigate(`/contents/${item.contentId}`)}>
              <span className={`${styles.rank} ${item.rank <= 3 ? styles.rankTop : ""}`}>{item.rank}</span>
              <img src={item.thumbnailUrl} alt={item.title} className={styles.thumbnail} />
              <div className={styles.info}>
                <div className={styles.title}>{item.title}</div>
                {/* 🌟 실제 작가명, 장르를 뿌려줍니다 */}
                <div className={styles.meta}>{item.authorName || "작가명"} · {item.genre}</div>
              </div>
            
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#90A4C8' }}>랭킹 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  )
}
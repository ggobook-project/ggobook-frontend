import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/RankingPage.module.css"

export default function RankingPage() {
  const navigate = useNavigate()
  const [type, setType] = useState("인기")
  const [category, setCategory] = useState("전체")

  const items = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1, title: `인기 작품 ${i + 1}`, author: "작가명",
    genre: ["로맨스", "판타지", "무협", "현대"][i % 4],
    likes: (Math.floor(2400 / (i + 1) * 10) / 10) + "k"
  }))

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

        {items.map(item => (
          <div key={item.rank} className={styles.rankCard} onClick={() => navigate("/contents/1")}>
            <span className={`${styles.rank} ${item.rank <= 3 ? styles.rankTop : ""}`}>{item.rank}</span>
            <div className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.meta}>{item.author} · {item.genre}</div>
            </div>
            <span className={styles.likes}>♡ {item.likes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
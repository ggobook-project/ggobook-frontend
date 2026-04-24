import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/LikedContentPage.module.css"

export default function LikedContentPage() {
  const navigate = useNavigate()

  const [items, setItems] = useState([
    { contentId: 1, title: "어느 날 나는 용사가 되었다", author: "김판타지", type: "웹소설", status: "APPROVED" },
    { contentId: 2, title: "달빛 아래 로맨스", author: "이로맨스", type: "웹툰", status: "APPROVED" },
    { contentId: 3, title: "최강 무협전", author: "박무협", type: "웹소설", status: "COMPLETED" },
    { contentId: 4, title: "현대판 마법사", author: "최마법", type: "웹툰", status: "APPROVED" },
    { contentId: 5, title: "학교 뒤편의 비밀", author: "한스릴러", type: "웹소설", status: "APPROVED" },
    { contentId: 6, title: "별이 빛나는 밤에", author: "정감성", type: "웹툰", status: "APPROVED" },
  ])

  const handleUnlike = (e, contentId) => {
    e.stopPropagation()
    if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return
    setItems(prev => prev.filter(item => item.contentId !== contentId))
  }

  const statusMap = { DRAFT: "연재 대기", APPROVED: "연재 중", REJECTED: "승인 거절", COMPLETED: "완결" }
  const typeMap = { WEBTOON: "웹툰", NOVEL: "웹소설", 웹툰: "웹툰", 웹소설: "웹소설" }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>찜한 작품</div>
        <div className={styles.headerSubtitle}>총 {items.length}개</div>
      </div>
      <div className={styles.content}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#4A6FA5" }}>찜한 작품이 없습니다.</div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item.contentId} className={styles.card} onClick={() => navigate(`/contents/${item.contentId}`)}>
                <div className={styles.thumbnail}>
                  <div className={styles.heartIcon} onClick={(e) => handleUnlike(e, item.contentId)}>♥</div>
                </div>
                <div className={styles.cardTitle}>{item.title}</div>
                <div className={styles.cardAuthor}>{item.author}</div>
                <div className={styles.badges}>
                  <span className={styles.badge}>{typeMap[item.type] || item.type}</span>
                  <span className={styles.badge}>{statusMap[item.status] || item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

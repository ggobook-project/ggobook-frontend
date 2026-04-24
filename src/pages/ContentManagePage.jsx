import { useNavigate } from "react-router-dom"
import styles from "../styles/ContentManagePage.module.css"

export default function ContentManagePage() {
  const navigate = useNavigate()

  const myContents = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `내 작품 ${i + 1}`, type: i % 2 === 0 ? "웹툰" : "웹소설",
    episodes: i * 5 + 3, status: i % 3 === 0 ? "검수중" : "연재중"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 관리</div>
        <div className={styles.headerSubtitle}>내 작품을 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>
            내 작품 <span className={styles.listCount}>{myContents.length}</span>
          </span>
          <button className={styles.registerBtn} onClick={() => navigate("/author/contents/register")}>
            작품 등록
          </button>
        </div>

        {myContents.map(item => (
          <div key={item.id} className={styles.itemCard} onClick={() => navigate(`/author/contents/${item.id}`)}>
            <div className={styles.itemLeft}>
              <div className={styles.thumbnail} />
              <div>
                <div className={styles.itemTitle}>{item.title}</div>
                <div className={styles.itemMeta}>{item.type} · 총 {item.episodes}화</div>
                <span className={`${styles.statusBadge} ${item.status === "검수중" ? styles.statusReview : styles.statusActive}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className={styles.itemActions}>
              <button
                className={styles.editBtn}
                onClick={e => { e.stopPropagation(); navigate(`/author/contents/${item.id}/edit`) }}
              >
                수정
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

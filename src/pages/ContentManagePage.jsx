import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import styles from "../styles/ContentManagePage.module.css"

export default function ContentManagePage() {
  const navigate = useNavigate()
  const [myContents, setMyContents] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pendingContents") || "[]")
    setMyContents(stored)
  }, [])

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

        {myContents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>
            등록한 작품이 없습니다.<br />작품을 등록하면 관리자 검수 후 게시됩니다.
          </div>
        ) : (
          myContents.map(item => (
            <div key={item.id} className={styles.itemCard} onClick={() => navigate(`/author/contents/${item.id}`)}>
              <div className={styles.itemLeft}>
                <div className={styles.thumbnail} />
                <div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMeta}>{item.type} · {item.genre}</div>
                  <span className={`${styles.statusBadge} ${
                    item.status === "검수중" ? styles.statusReview :
                    item.status === "반려됨" ? styles.statusReject :
                    styles.statusActive
                  }`}>
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
          ))
        )}
      </div>
    </div>
  )
}

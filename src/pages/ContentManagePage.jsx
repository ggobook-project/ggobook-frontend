import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/axios"
import styles from "../styles/ContentManagePage.module.css"

const STATUS_LABEL = {
  PENDING: "검수중",
  APPROVED: "연재중",
  REJECTED: "반려됨",
  DRAFT: "임시저장",
  BLINDED: "블라인드",
}

const STATUS_STYLE = {
  PENDING: "statusReview",
  APPROVED: "statusActive",
  REJECTED: "statusReject",
  DRAFT: "statusReview",
  BLINDED: "statusReject",
}

export default function ContentManagePage() {
  const navigate = useNavigate()
  const [myContents, setMyContents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/mypage")
      .then(res => setMyContents(res.data.myPosts || []))
      .catch(() => setMyContents([]))
      .finally(() => setLoading(false))
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

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>불러오는 중...</div>
        ) : myContents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>
            등록한 작품이 없습니다.<br />작품을 등록하면 관리자 검수 후 게시됩니다.
          </div>
        ) : (
          myContents.map(item => (
            <div key={item.contentId} className={styles.itemCard} onClick={() => navigate(`/author/contents/${item.contentId}`)}>
              <div className={styles.itemLeft}>
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} className={styles.thumbnail} alt="썸네일" style={{ objectFit: "cover" }} />
                ) : (
                  <div className={styles.thumbnail} />
                )}
                <div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMeta}>{item.type} · {item.genre || "장르 미설정"}</div>
                  <span className={`${styles.statusBadge} ${styles[STATUS_STYLE[item.status]] || styles.statusReview}`}>
                    {STATUS_LABEL[item.status] || item.status}
                  </span>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={styles.editBtn}
                  onClick={e => { e.stopPropagation(); navigate(`/author/contents/${item.contentId}/edit`) }}
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

import { useNavigate } from "react-router-dom"
import styles from "../styles/AdminUploadPage.module.css"

export default function AdminUploadPage() {
  const navigate = useNavigate()

  const items = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, contentTitle: `작품 제목 ${i + 1}`, episodeNum: `${i + 1}화`,
    type: i % 2 === 0 ? "웹툰" : "웹소설",
    status: i % 3 === 0 ? "비공개" : "공개", date: "2026.04.13"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>업로드 관리</div>
        <div className={styles.headerSubtitle}>회차 공개/비공개를 관리하세요</div>
      </div>
      <div className={styles.content}>
        {items.map(item => (
          <div
            key={item.id}
            className={styles.itemCard}
            onClick={() => navigate(`/admin/uploads/${item.id}`)}
          >
            <div>
              <div className={styles.itemTitle}>{item.contentTitle} · {item.episodeNum}</div>
              <div className={styles.itemMeta}>{item.type} · {item.date}</div>
            </div>
            <div className={styles.itemRight} onClick={e => e.stopPropagation()}>
              <span className={`${styles.statusBadge} ${item.status === "공개" ? styles.statusPublic : styles.statusPrivate}`}>
                {item.status}
              </span>
              <button className={styles.changeBtn}>변경</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
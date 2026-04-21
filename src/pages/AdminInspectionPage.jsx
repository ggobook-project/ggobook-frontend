import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/AdminInspectionPage.module.css"

export default function AdminInspectionPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("전체")

  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: `작품 제목 ${i + 1}`, author: "작가명",
    type: i % 2 === 0 ? "웹툰" : "웹소설", date: "2026.04.13",
    status: "대기"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>검수 관리</div>
        <div className={styles.headerSubtitle}>등록된 작품을 검토하고 승인/반려하세요</div>
      </div>
      <div className={styles.content}>
        <div className={styles.filterGroup}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
        {items.map(item => (
          <div key={item.id} className={styles.itemCard}
          onClick={() => navigate(`/admin/inspection/${item.id}`)}>
            <div className={styles.itemLeft}>
              <div className={styles.thumbnail} />
              <div>
                <div className={styles.itemTitle}>{item.title}</div>
                <div className={styles.itemMeta}>{item.author} · {item.type} · {item.date}</div>
              </div>
            </div>
            <div className={styles.actionGroup}>
              <button className={styles.btnApprove}>승인</button>
              <button className={styles.btnReject}>반려</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
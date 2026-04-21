import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/AdminReportPage.module.css"

export default function AdminReportPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("전체")

  const reports = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, targetType: ["CONTENT", "COMMENT", "RELAY"][i % 3],
    reason: ["욕설/비방", "음란물", "스포일러"][i % 3],
    reporter: `신고자${i + 1}`, date: "2026.04.13", status: "대기"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>신고 관리</div>
        <div className={styles.headerSubtitle}>접수된 신고를 처리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterGroup}>
          {["전체", "CONTENT", "COMMENT", "RELAY"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            >
              {f}
            </button>
          ))}
        </div>

        {reports.map(r => (
          <div key={r.id} className={styles.reportCard}>
            <div className={styles.reportTop}>
              <div className={styles.reportLeft}>
                <span className={styles.typeBadge}>{r.targetType}</span>
                <span className={styles.reportReason}>{r.reason}</span>
              </div>
              <span className={styles.reportDate}>{r.date}</span>
            </div>
            <div className={styles.reportReporter}>신고자: {r.reporter}</div>
            <div className={styles.reportActions}>
              <button className={styles.deleteBtn}>콘텐츠 삭제</button>
              <button className={styles.doneBtn}>처리완료</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
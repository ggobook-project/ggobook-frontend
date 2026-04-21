import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/AdminNoticePage.module.css"

export default function AdminNoticePage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  const notices = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `공지사항 제목 ${i + 1}`, date: `2026.04.${13 - i}`
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>공지사항 관리</div>
        <div className={styles.headerSubtitle}>공지사항을 등록하고 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <button className={styles.registerBtn} onClick={() => setShowForm(!showForm)}>공지 등록</button>
        </div>

        {showForm && (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <div className={styles.formLabel}>제목</div>
              <input placeholder="공지 제목 입력" className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.formLabel}>내용</div>
              <textarea rows={4} placeholder="공지 내용 입력" className={styles.formTextarea} />
            </div>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>취소</button>
              <button className={styles.submitBtn}>등록</button>
            </div>
          </div>
        )}

        {notices.map(n => (
          <div
            key={n.id}
            className={styles.noticeCard}
            onClick={() => navigate(`/admin/notices/${n.id}`)}
          >
            <div>
              <div className={styles.noticeTitle}>{n.title}</div>
              <div className={styles.noticeDate}>{n.date}</div>
            </div>
            <div className={styles.noticeActions} onClick={e => e.stopPropagation()}>
              <button className={styles.editBtn}>수정</button>
              <button className={styles.deleteBtn}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
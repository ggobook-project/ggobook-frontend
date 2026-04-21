import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/AdminRelayPage.module.css"

export default function AdminRelayPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("릴레이 목록")

  const relays = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`, starter: "홍길동",
    entries: i * 5 + 3, date: "2026.04.10"
  }))

  const topics = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1, title: `관리자 주제 ${i + 1}`, date: "2026.04.01"
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설 관리</div>
        <div className={styles.headerSubtitle}>릴레이 소설과 주제를 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {["릴레이 목록", "주제 관리"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "릴레이 목록" && relays.map(r => (
          <div key={r.id} className={styles.card}>
            <div>
              <div className={styles.cardTitle}>{r.title}</div>
              <div className={styles.cardMeta}>시작: {r.starter} · 이어쓰기 {r.entries}개 · {r.date}</div>
            </div>
            <button className={styles.deleteBtn}>삭제</button>
          </div>
        ))}

        {tab === "주제 관리" && (
          <>
            <div className={styles.topicForm}>
              <div className={styles.topicInputRow}>
                <input placeholder="새 주제 입력" className={styles.topicInput} />
                <button className={styles.registerBtn}>등록</button>
              </div>
            </div>
            {topics.map(t => (
              <div key={t.id} className={styles.card}>
                <div>
                  <div className={styles.cardTitle}>{t.title}</div>
                  <div className={styles.cardMeta}>{t.date}</div>
                </div>
                <button className={styles.deleteBtn}>삭제</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
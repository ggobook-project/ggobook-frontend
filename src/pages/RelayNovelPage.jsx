import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "../styles/RelayNovelPage.module.css"

export default function RelayNovelPage() {
  const navigate = useNavigate()
  const [sort, setSort] = useState("최신순")

  const relays = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`, starter: "홍길동",
    participants: i * 3 + 5, entries: i * 10 + 8,
    preview: "어느 날 갑자기 눈을 떴을 때, 나는 낯선 방 안에 있었다. 창문 너머로 보이는 풍경은 내가 알던 세상과 달랐다..."
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitle}>릴레이 소설</div>
          <div className={styles.headerSubtitle}>함께 써내려가는 이야기</div>
        </div>
        <button className={styles.newBtn} onClick={() => navigate("/relay/register")}>+ 새 릴레이</button>
      </div>

      <div className={styles.content}>
        <div className={styles.sortGroup}>
          {["최신순", "인기순"].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`${styles.sortBtn} ${sort === s ? styles.sortBtnActive : ""}`}
            >
              {s}
            </button>
          ))}
        </div>

        {relays.map(r => (
          <div
            key={r.id}
            className={styles.relayCard}
            onClick={() => navigate(`/relay/${r.id}`)}
          >
            <div className={styles.relayTitle}>{r.title}</div>
            <div className={styles.relayMeta}>
              <span>시작: {r.starter}</span>
              <span>참여자 {r.participants}명</span>
              <span>이어쓰기 {r.entries}개</span>
            </div>
            <div className={styles.relayPreview}>{r.preview}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
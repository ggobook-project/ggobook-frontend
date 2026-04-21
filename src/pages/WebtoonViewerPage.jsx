import { useNavigate } from "react-router-dom"
import styles from "../styles/WebtoonViewerPage.module.css"

export default function WebtoonViewerPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topBar}>
        <button className={styles.topBtn} onClick={() => navigate("/contents/1")}>← 목록</button>
        <span className={styles.topTitle}>작품명 1화</span>
        <span className={styles.topPage}>1 / 8</span>
      </div>

      <div className={styles.content}>
        {[180, 140, 200, 160, 180, 150].map((h, i) => (
          <div key={i} className={`${styles.panel} ${i % 2 === 0 ? styles.panelEven : styles.panelOdd}`} style={{ height: h }} />
        ))}
      </div>

      <div className={styles.bottomBar}>
        <button className={styles.prevBtn}>← 이전화</button>
        <button className={styles.listBtn} onClick={() => navigate("/contents/1")}>목록</button>
        <button className={styles.nextBtn}>다음화 →</button>
      </div>
    </div>
  )
}
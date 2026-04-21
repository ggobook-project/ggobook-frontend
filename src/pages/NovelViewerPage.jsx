import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/NovelViewerPage.module.css"

export default function NovelViewerPage() {
  const navigate = useNavigate()
  const [playing, setPlaying] = useState(false)

  const paragraphs = [
    "그날의 하늘은 유독 맑았다. 바람 한 점 없이 고요한 오후, 주인공은 창문 너머로 먼 산을 바라보며 생각에 잠겼다.",
    "오래된 편지 한 통이 그의 손 안에서 조용히 떨리고 있었다. 발신인 이름을 확인한 순간, 그의 심장은 잠시 멈추는 것 같았다.",
    "십 년 전 이별 후 단 한 번도 연락이 없었던 그 사람. 지금 이 순간, 무슨 말을 전하려는 것일까.",
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topBar}>
        <button className={styles.topBtn} onClick={() => navigate("/contents/1")}>← 목록</button>
        <span className={styles.topTitle}>소설 제목 1화</span>
        <button className={styles.topBtn}>설정</button>
      </div>

      <div className={styles.content}>
        <div className={styles.chapterLabel}>— 1화 —</div>
        {paragraphs.map((p, i) => (
          <p key={i} className={styles.paragraph}>{p}</p>
        ))}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <div className={styles.ttsRow}>
            <button className={styles.playBtn} onClick={() => setPlaying(!playing)}>
              {playing ? "⏸" : "▶"}
            </button>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
            <span className={styles.timeLabel}>02:14 / 08:30</span>
            <span className={styles.voiceBtn}>목소리</span>
          </div>
          <div className={styles.navRow}>
            <button className={styles.prevBtn}>← 이전화</button>
            <button className={styles.nextBtn}>다음화 →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
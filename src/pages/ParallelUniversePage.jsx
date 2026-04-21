import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/ParallelUniversePage.module.css"

export default function ParallelUniversePage() {
  const navigate = useNavigate()
  const [scenario, setScenario] = useState("")
  const [generated, setGenerated] = useState(false)

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/novel/viewer/1")}>← 돌아가기</button>
        <div className={styles.headerTitle}>평행우주 외전</div>
        <div className={styles.headerSubtitle}>AI가 새로운 결말을 만들어 드립니다</div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>현재 회차</div>
          <div className={styles.currentEp}>작품 제목 · 3화 기준</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>나만의 시나리오</div>
          <div className={styles.scenarioList}>
            {["주인공이 다른 선택을 한다면?", "두 주인공이 처음부터 만나지 않았다면?", "악당이 주인공이 된다면?"].map(s => (
              <div
                key={s}
                onClick={() => setScenario(s)}
                className={`${styles.scenarioItem} ${scenario === s ? styles.scenarioItemActive : ""}`}
              >{s}</div>
            ))}
          </div>
          <textarea
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            placeholder="직접 시나리오를 입력하세요..."
            rows={3}
            className={styles.textarea}
          />
          <button className={styles.generateBtn} onClick={() => setGenerated(true)}>외전 생성하기</button>
        </div>

        {generated && (
          <div className={styles.resultCard}>
            <div className={styles.resultTitle}>AI 생성 외전</div>
            <p className={styles.resultText}>
              만약 그 날 주인공이 다른 선택을 했다면, 이야기는 전혀 다른 방향으로 흘러갔을 것이다. 창문 너머 내리는 빗소리를 들으며...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
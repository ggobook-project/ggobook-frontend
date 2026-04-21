import { useNavigate } from "react-router-dom"
import styles from "../styles/AdminTTSPage.module.css"

export default function AdminTTSPage() {
  const navigate = useNavigate()

  const voices = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, name: `목소리 ${i + 1}`,
    type: i % 2 === 0 ? "여성" : "남성",
    style: ["차분한", "활발한", "진중한"][i % 3],
    isDefault: i === 0
  }))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>TTS 관리</div>
        <div className={styles.headerSubtitle}>TTS 목소리를 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <button className={styles.addBtn}>목소리 추가</button>
        </div>

        {voices.map(v => (
          <div key={v.id} className={`${styles.voiceCard} ${v.isDefault ? styles.voiceCardDefault : ""}`}>
            <div className={styles.voiceLeft}>
              <div className={styles.voiceIcon}>🎙</div>
              <div>
                <div className={styles.voiceNameRow}>
                  <span className={styles.voiceName}>{v.name}</span>
                  {v.isDefault && <span className={styles.defaultBadge}>기본</span>}
                </div>
                <div className={styles.voiceMeta}>{v.type} · {v.style}</div>
              </div>
            </div>
            <div className={styles.voiceActions}>
              <button className={styles.previewBtn}>미리듣기</button>
              <button className={styles.deleteBtn}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
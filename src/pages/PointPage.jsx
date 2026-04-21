import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/PointPage.module.css"

export default function PointPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("내역")

  const history = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    type: i % 3 === 0 ? "충전" : i % 3 === 1 ? "사용" : "관리자 지급",
    amount: i % 3 === 1 ? -500 : 1000,
    desc: i % 3 === 0 ? "포인트 충전" : i % 3 === 1 ? "작품 소장" : "이벤트 지급",
    date: "2026.04.13"
  }))

  const packages = [
    { point: 1000, price: 1000 }, { point: 3000, price: 2900 },
    { point: 5000, price: 4500 }, { point: 10000, price: 8900 }
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>포인트</div>
        <div className={styles.pointDisplay}>
          <span className={styles.pointValue}>1,200</span>
          <span className={styles.pointLabel}>P 보유</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {["충전", "내역"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}>{t}</button>
          ))}
        </div>

        {tab === "충전" && (
          <div className={styles.packageGrid}>
            {packages.map(pkg => (
              <div key={pkg.point} className={styles.packageCard}>
                <div className={styles.packagePoint}>{pkg.point.toLocaleString()} P</div>
                <div className={styles.packagePrice}>{pkg.price.toLocaleString()}원</div>
                <button className={styles.chargeBtn}>충전하기</button>
              </div>
            ))}
          </div>
        )}

        {tab === "내역" && history.map(h => (
          <div key={h.id} className={styles.historyItem}>
            <div>
              <div className={styles.historyDesc}>{h.desc}</div>
              <div className={styles.historyDate}>{h.date}</div>
            </div>
            <div className={`${styles.historyAmount} ${h.amount > 0 ? styles.amountPlus : styles.amountMinus}`}>
              {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString()} P
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
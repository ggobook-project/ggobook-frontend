MainPage

import { useNavigate } from "react-router-dom"
import styles from "../styles/MainPage.module.css"

const webtoonGif = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Y3YmRsaGVrbTA2cDcwazN1OG00MjdzOGFiaGhoNWZycG1sYWdiNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IqjiyPP4uwserSAQss/giphy.gif"
const novelGif = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHEydmNxdzVjc3N2aHo4djRjOGZvZjdiMGl4Y3ByeXM3aWJwam5hMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wkSjSYVJPTDoHAU4ki/giphy.gif"

export default function MainPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* 웹툰 */}
      <div
        className={styles.panel}
        onClick={() => navigate("/webtoon")}
        onMouseEnter={e => e.currentTarget.style.flex = "1.08"}
        onMouseLeave={e => e.currentTarget.style.flex = "1"}
      >
        <img src={webtoonGif} alt="웹툰" className={styles.panelBg} />
        <div className={styles.gradient} />
        <div className={styles.panelText}>
          <div className={styles.panelLabel}>꼬북의 웹툰을 즐겨보세요</div>
        </div>
      </div>

      {/* 웹소설 */}
      <div
        className={styles.panel}
        onClick={() => navigate("/novel")}
        onMouseEnter={e => e.currentTarget.style.flex = "1.08"}
        onMouseLeave={e => e.currentTarget.style.flex = "1"}
      >
        <img src={novelGif} alt="웹소설" className={styles.panelBg} />
        <div className={styles.gradient} />
        <div className={styles.panelText}>
          <div className={styles.panelLabel}>꼬북의 들으며 읽는 웹소설</div>
        </div>
      </div>

      {/* 가운데 로고 */}
      <div className={styles.logo}>GGoBook</div>
    </div>
  )
}
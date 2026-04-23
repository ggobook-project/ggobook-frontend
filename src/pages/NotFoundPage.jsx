import { useNavigate } from "react-router-dom"
import styles from "../styles/NotFoundPage.module.css"


export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.code}>404</div>
        <div className={styles.title}>페이지를 찾을 수 없습니다</div>
        <div className={styles.subtitle}>요청하신 페이지가 존재하지 않거나 이동되었습니다</div>
        <button className={styles.btn} onClick={() => navigate("/")}>메인으로 돌아가기</button>
      </div>
    </div>
  )
}
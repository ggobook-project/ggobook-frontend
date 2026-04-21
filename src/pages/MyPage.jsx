import { useNavigate } from "react-router-dom"
import styles from "../styles/MyPage.module.css"

export default function MyPage() {
  const navigate = useNavigate()

  const menus = [
    { label: "내 정보 수정", sub: "프로필 및 비밀번호 변경" },
    { label: "찜한 작품", sub: "저장한 작품 목록" },
    { label: "소장한 작품", sub: "구매한 완결 작품" },
    { label: "최근 본 작품", sub: "열람 기록" },
    { label: "내가 쓴 댓글", sub: "댓글 관리" },
    { label: "내 릴레이 소설", sub: "참여 현황" },
    { label: "포인트 충전 / 내역", sub: "1,200 P 보유" },
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.profile}>
          <div className={styles.avatar} />
          <div>
            <div className={styles.name}>홍길동</div>
            <div className={styles.email}>example@email.com</div>
            <div className={styles.badges}>
              <span className={styles.pointBadge}>1,200 P</span>
              <span className={styles.roleBadge}>일반 회원</span>
            </div>
          </div>
        </div>

        <div className={styles.menuList}>
          {menus.map((m, i) => (
            <div key={i} className={styles.menuItem}>
              <div>
                <div className={styles.menuLabel}>{m.label}</div>
                <div className={styles.menuSub}>{m.sub}</div>
              </div>
              <span className={styles.menuArrow}>›</span>
            </div>
          ))}
        </div>

        <div className={styles.logoutWrap}>
          <button className={styles.logoutBtn} onClick={() => navigate("/login")}>로그아웃</button>
        </div>
      </div>
    </div>
  )
}
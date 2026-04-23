import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getMyPageMainData } from "../api/mypageApi" // 🌟 API 호출 모듈 분리
import styles from "../styles/MyPage.module.css"

export default function MyPage() {
  const navigate = useNavigate()
  
  // 🌟 진짜 데이터를 담을 바구니 (초기값은 텅 빈 상태)
  const [userInfo, setUserInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 화면이 처음 켜질 때 딱 한 번 백엔드에 데이터 요청
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyPageMainData()
        setUserInfo(data)
      } catch (error) {
        alert("정보를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // 데이터를 받아오기 전까지 보여줄 로딩 화면 (뼈대 깨짐 방지)
  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>로딩중...</div>

  // 🌟 동적 메뉴: 포인트 잔액을 DB 데이터로 즉시 반영
  const menus = [
    { label: "내 정보 수정", sub: "프로필 및 비밀번호 변경", path: "/mypage/edit" },
    { label: "찜한 작품", sub: "저장한 작품 목록", path: "/mypage/likes" },
    { label: "소장한 작품", sub: "구매한 완결 작품", path: "/mypage/library" },
    { label: "최근 본 작품", sub: "열람 기록", path: "/mypage/recent" },
    { label: "내가 쓴 댓글", sub: "댓글 관리", path: "/mypage/comments" },
    { label: "내 릴레이 소설", sub: "참여 현황", path: "/mypage/relay" },
    { label: "포인트 충전 / 내역", sub: `${userInfo?.points?.toLocaleString() || 0} P 보유`, path: "/mypage/points" },
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.profile}>
          <div className={styles.avatar} />
          <div>
            {/* 🌟 가짜 데이터 대신 진짜 이름과 이메일 출력 */}
            <div className={styles.name}>{userInfo?.profile?.name || "알 수 없음"}</div>
            <div className={styles.email}>{userInfo?.profile?.email || "이메일 없음"}</div>
            <div className={styles.badges}>
              <span className={styles.pointBadge}>
                {userInfo?.points?.toLocaleString() || 0} P
              </span>
              <span className={styles.roleBadge}>일반 회원</span>
            </div>
          </div>
        </div>

        <div className={styles.menuList}>
          {menus.map((m, i) => (
            <div 
              key={i} 
              className={styles.menuItem}
              onClick={() => navigate(m.path)} // 🌟 클릭 시 해당 페이지로 이동하도록 생명력 부여
            >
              <div>
                <div className={styles.menuLabel}>{m.label}</div>
                <div className={styles.menuSub}>{m.sub}</div>
              </div>
              <span className={styles.menuArrow}>›</span>
            </div>
          ))}
        </div>

        <div className={styles.logoutWrap}>
          {/* 이미 Header.jsx에 로그아웃 로직이 있지만 여기서도 동일하게 작동하도록 처리 가능 */}
          <button 
            className={styles.logoutBtn} 
            onClick={() => {
              if (window.confirm("로그아웃 하시겠습니까?")) {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
              }
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
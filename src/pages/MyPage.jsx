import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getMyPageMainData } from "../api/mypageApi" 

import api from "../api/axios" 
import styles from "../styles/MyPage.module.css"

const getRoleFromToken = () => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const r = payload.role || payload.roles?.[0] || payload.authority;
    return typeof r === "string" ? r.replace("ROLE_", "") : null;
  } catch { return null; }
}

export default function MyPage() {
  const navigate = useNavigate()
  const role = getRoleFromToken() || localStorage.getItem("userRole") || "USER"
  
  const [userInfo, setUserInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (role === "ADMIN") navigate("/admin")
  }, [role, navigate])

  useEffect(() => {
    const fetchData = async () => {
      // 🌟 핵심 수정 1: 왼쪽 주머니, 오른쪽 주머니 둘 다 없어야만 파업(return)하도록 수정!
      if (!(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"))) {
        setIsLoading(false); // 무한 로딩 방지
        return;
      }

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

  // 🌟 추가: 회원 탈퇴 전용 함수
  const handleWithdraw = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까? 탈퇴 후 계정 복구는 불가능합니다.")) return;

    try {
      // 방금 백엔드 MyPageController에 뚫어둔 주소를 호출합니다!
      await api.post("/api/mypage/withdraw"); 
      
      alert("그동안 이용해 주셔서 감사합니다. 탈퇴 처리가 완료되었습니다.");
      
      // 탈퇴도 결국 로그아웃과 똑같이 주머니를 싹 다 털고 내쫓아야 합니다!
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken"); 
      navigate("/", { replace: true });
      
    } catch (error) {
      alert("탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>로딩중...</div>

  const menus = [
    { label: "내 정보 수정", sub: "프로필 및 비밀번호 변경", path: "/mypage/edit" },
    { label: "내 작품 관리", sub: "업로드한 작품 및 에피소드 관리", path: "/author/contents" },
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
            <div className={styles.name}>{userInfo?.profile?.name || "알 수 없음"}</div>
            <div className={styles.email}>{userInfo?.profile?.email || "이메일 없음"}</div>
            <div className={styles.badges}>
              <span className={styles.pointBadge}>
                {userInfo?.points?.toLocaleString() || 0} P
              </span>
              <span className={
                role === "ADMIN" ? styles.roleAdmin :
                role === "AUTHOR" ? styles.roleAuthor : styles.roleBadge
              }>
                {role === "ADMIN" ? "관리자" : role === "AUTHOR" ? "작가" : "일반 회원"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.menuList}>
          {menus.map((m, i) => (
            <div 
              key={i} 
              className={styles.menuItem}
              onClick={() => navigate(m.path)} 
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
          {/* 🌟 수정: 로그아웃 버튼을 회원 탈퇴 버튼으로 교체 */}
          <button 
            className={styles.logoutBtn} 
            style={{ backgroundColor: "#FAFAFA", color: "#E53935", border: "1px solid #E53935" }} // 위험한 버튼 느낌 주기
            onClick={handleWithdraw}
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  )
}
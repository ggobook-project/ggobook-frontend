import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // 팀장님의 API 인스턴스 경로
import styles from "../styles/AdminMainPage.module.css";

export default function AdminMainPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);

  // 1. 대시보드 데이터 로드
  useEffect(() => {
    api.get("/api/admin/dashboard")
       .then((res) => {
         setDashboard(res.data);
       })
       .catch((err) => {
         console.error("대시보드 데이터 로드 실패:", err);
       });
  }, []);

  // 2. 통계 데이터 매핑 (API 데이터가 오면 자동 갱신)
  const stats = [
    { label: "검수 대기", value: dashboard?.pendingInspectionCount || 0, color: "#2196F3" },
    { label: "신고 접수", value: dashboard?.reportCount || 0, color: "#E53935" },
    { label: "전체 회원", value: dashboard?.totalUserCount || 0, color: "#1565C0" },
    { label: "오늘 가입", value: dashboard?.todayJoinCount || 0, color: "#0288D1" },
  ];

  // 3. 메뉴 아이템 매핑
  const menuItems = [
    { label: "작품 검수", desc: "등록 요청된 작품 승인/반려", path: "/admin/inspections", badge: dashboard?.inspectionBadge || 0 },
    { label: "작품 관리", desc: "작품 및 회차 관리", path: "/admin/content", badge: 0 },
    { label: "회원 관리", desc: "회원 정보 조회 및 제재", path: "/admin/members", badge: 0 },
    { label: "신고 관리", desc: "신고된 콘텐츠 처리", path: "/admin/reports", badge: dashboard?.reportBadge || 0 },
    { label: "공지사항", desc: "공지사항 등록 및 관리", path: "/admin/notices", badge: 0 },
    { label: "릴레이 소설", desc: "릴레이 소설 주제 관리", path: "/admin/relays", badge: 0 },
    { label: "TTS 관리", desc: "TTS 목소리 설정 관리", path: "/admin/tts", badge: 0 },
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>관리자 페이지</div>
        <div className={styles.headerSubtitle}>GGoBook 서비스 관리 대시보드</div>
      </div>

      <div className={styles.content}>
        {/* 4. 통계 그리드 */}
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 5. 메뉴 그리드 */}
        <div className={styles.menuTitle}>관리 메뉴</div>
        <div className={styles.menuGrid}>
          {menuItems.map((item) => (
            <div 
              key={item.label} 
              className={styles.menuCard} 
              onClick={() => navigate(item.path)}
            >
              {item.badge > 0 && (
                <div className={styles.menuBadge}>
                  {item.badge > 99 ? "99+" : item.badge}
                </div>
              )}
              <div className={styles.menuIcon}>{item.icon}</div>
              <div className={styles.menuLabel}>{item.label}</div>
              <div className={styles.menuDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
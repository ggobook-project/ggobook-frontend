import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminMainPage.module.css"

const menuItems = [
  { label: "작품 검수", desc: "등록 요청된 작품 승인/반려", path: "/admin/inspections" },
  { label: "업로드 관리", desc: "예약 업로드 및 회차 관리", path: "/admin/uploads" },
  { label: "회원 관리", desc: "회원 정보 조회 및 제재", path: "/admin/members" },
  { label: "신고 관리", desc: "신고된 콘텐츠 처리", path: "/admin/reports" },
  { label: "공지사항", desc: "공지사항 등록 및 관리", path: "/admin/notices" },
  { label: "릴레이 소설", desc: "릴레이 소설 주제 관리", path: "/admin/relays" },
  { label: "TTS 관리", desc: "TTS 목소리 설정 관리", path: "/admin/tts" },
];

const stats = [
  { label: "검수 대기", value: "-", color: "#2196F3" },
  { label: "신고 접수", value: "-", color: "#E53935" },
  { label: "전체 회원", value: "-", color: "#1565C0" },
  { label: "오늘 가입", value: "-", color: "#0288D1" },
];

export default function AdminMainPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>관리자 페이지</div>
        <div className={styles.headerSubtitle}>GGoBook 서비스 관리 대시보드</div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.menuTitle}>관리 메뉴</div>
        <div className={styles.menuGrid}>
          {menuItems.map((item) => (
            <div key={item.label} className={styles.menuCard} onClick={() => navigate(item.path)}>
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
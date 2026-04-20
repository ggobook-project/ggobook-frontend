import { useNavigate } from "react-router-dom";
import theme from "../styles/theme";
const { colors: c } = theme;

const menuItems = [
  { label: "작품 검수", desc: "등록 요청된 작품 승인/반려", icon: "📋", path: "/admin/inspections" },
  { label: "업로드 관리", desc: "예약 업로드 및 회차 관리", icon: "📤", path: "/admin/uploads" },
  { label: "회원 관리", desc: "회원 정보 조회 및 제재", icon: "👥", path: "/admin/members" },
  { label: "신고 관리", desc: "신고된 콘텐츠 처리", icon: "🚨", path: "/admin/reports" },
  { label: "공지사항", desc: "공지사항 등록 및 관리", icon: "📢", path: "/admin/notices" },
  { label: "릴레이 소설", desc: "릴레이 소설 주제 관리", icon: "✍️", path: "/admin/relays" },
  { label: "TTS 관리", desc: "TTS 목소리 설정 관리", icon: "🔊", path: "/admin/tts" },
];

export default function AdminMainPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      {/* 헤더 */}
      <div style={{
        background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`,
        padding: "32px 40px 24px",
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>관리자 페이지</div>
        <div style={{ fontSize: 14, color: c.textSub }}>GGoBook 서비스 관리 대시보드</div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>

        {/* 빠른 통계 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { label: "검수 대기", value: "-", color: c.primary },
            { label: "신고 접수", value: "-", color: "#ef4444" },
            { label: "전체 회원", value: "-", color: "#10b981" },
            { label: "오늘 가입", value: "-", color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: c.bgWhite, borderRadius: theme.radius.md,
              border: `1px solid ${c.border}`, padding: "20px 24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginBottom: 6 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: c.textSub }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 메뉴 그리드 */}
        <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 16 }}>관리 메뉴</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                background: c.bgWhite, borderRadius: theme.radius.md,
                border: `1px solid ${c.border}`, padding: "24px",
                cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = c.primary;
                e.currentTarget.style.boxShadow = `0 4px 16px rgba(33,150,243,0.12)`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: c.textSub }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
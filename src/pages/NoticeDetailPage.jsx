import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function NoticeDetailPage() {
  const navigate = useNavigate()
  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <button onClick={() => navigate("/notices")} style={{ background: "none", border: "none", color: c.textSub, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>← 목록</button>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 6 }}>공지사항 제목</div>
        <div style={{ fontSize: 13, color: c.textMuted }}>2026.04.13 · 관리자</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 40px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 32 }}>
          <p style={{ fontSize: 15, color: c.text, lineHeight: 1.9, marginBottom: 20 }}>
            안녕하세요, 꼬북 팀입니다. 서비스 이용에 관한 중요한 공지사항을 안내드립니다.
          </p>
          <p style={{ fontSize: 15, color: c.text, lineHeight: 1.9, marginBottom: 20 }}>
            이번 업데이트를 통해 TTS 기능이 개선되었으며, 더욱 자연스러운 음성으로 웹소설을 즐기실 수 있습니다.
          </p>
          <p style={{ fontSize: 15, color: c.text, lineHeight: 1.9 }}>
            이용해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
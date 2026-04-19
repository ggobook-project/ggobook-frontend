import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

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
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{
          background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`,
          padding: "28px 24px", borderBottom: `1px solid ${c.border}`,
          display: "flex", gap: 18, alignItems: "center"
        }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: c.bgWhite, border: `2px solid ${c.primary}`, flexShrink: 0 }}></div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 4 }}>홍길동</div>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 10 }}>example@email.com</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 12, padding: "4px 12px", background: c.bgSurface, color: c.primary, borderRadius: theme.radius.full, fontWeight: 500, border: `1px solid ${c.border}` }}>1,200 P</span>
              <span style={{ fontSize: 12, padding: "4px 12px", background: c.bgSurface, border: `1px solid ${c.border}`, color: c.textSub, borderRadius: theme.radius.full }}>일반 회원</span>
            </div>
          </div>
        </div>

        <div style={{ background: c.bgWhite }}>
          {menus.map((m, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 24px", borderBottom: `1px solid ${c.bgSurface}`, cursor: "pointer"
            }}
              onMouseEnter={e => e.currentTarget.style.background = c.bgSurface}
              onMouseLeave={e => e.currentTarget.style.background = c.bgWhite}
            >
              <div>
                <div style={{ fontSize: 14, color: c.text, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{m.sub}</div>
              </div>
              <span style={{ color: c.textMuted, fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 24px" }}>
          <button onClick={() => navigate("/login")} style={{ width: "100%", padding: 12, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 13, cursor: "pointer" }}>로그아웃</button>
        </div>
      </div>
    </div>
  )
}
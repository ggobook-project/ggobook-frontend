import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function MyCommentPage() {
  const navigate = useNavigate()
  const comments = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, content: `댓글 내용 ${i + 1} - 정말 재밌는 작품이에요!`,
    contentTitle: `작품 제목 ${i + 1}`, episode: `${i + 1}화`, date: "2026.04.13"
  }))

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>내가 쓴 댓글</div>
        <div style={{ fontSize: 14, color: c.textSub }}>총 {comments.length}개</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 40px" }}>
        {comments.map(cm => (
          <div key={cm.id} style={{ padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span onClick={() => navigate("/contents/1")} style={{ fontSize: 13, fontWeight: 600, color: c.primary, cursor: "pointer" }}>{cm.contentTitle} · {cm.episode}</span>
              <span style={{ fontSize: 12, color: c.textMuted }}>{cm.date}</span>
            </div>
            <div style={{ fontSize: 14, color: c.text, marginBottom: 10 }}>{cm.content}</div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={{ padding: "5px 12px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.sm, color: c.danger, fontSize: 12, cursor: "pointer" }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
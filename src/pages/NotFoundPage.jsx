import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", background: c.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 80, fontWeight: 700, color: c.primary, marginBottom: 8 }}>404</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: c.text, marginBottom: 8 }}>페이지를 찾을 수 없습니다</div>
        <div style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>요청하신 페이지가 존재하지 않거나 이동되었습니다</div>
        <button onClick={() => navigate("/")} style={{ padding: "12px 32px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>메인으로 돌아가기</button>
      </div>
    </div>
  )
}
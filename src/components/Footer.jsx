import theme from "../styles/theme"
const { colors: c } = theme

export default function Footer() {
  return (
    <footer style={{
  background: "#FFFFFF",
  borderTop: "1px solid #BBDEFB",
  padding: "20px 40px",
}}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: c.textMuted }}>© 2026 GGoBook. All rights reserved.</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span style={{ fontSize: 13, color: c.textMuted, fontWeight: 600 }}>한국정보교육원</span>
          <span style={{ fontSize: 12, color: c.textMuted }}>현업에서 바로 통하는 자바 풀스택 & 생성형AI 서비스개발</span>
        </div>
      </div>
    </footer>
  )
}
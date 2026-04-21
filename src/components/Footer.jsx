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
        <div style={{ display: "flex", gap: 20 }}>
          {["이용약관", "개인정보처리방침", "문의하기"].map(item => (
            <span key={item} style={{ fontSize: 13, color: c.textMuted, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
            >{item}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
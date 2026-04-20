import theme from "./theme";
const { colors: c, radius: r } = theme;

export const authStyles = {
  container: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", position: "relative", padding: "40px 24px"
  },
  waveBg: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundSize: "cover", backgroundPosition: "center",
    opacity: 0.08, zIndex: 0, pointerEvents: "none"
  },
  cardWrap: { width: "100%", maxWidth: 420, position: "relative", zIndex: 1 },
  card: {
    background: c.bgWhite, borderRadius: r.lg,
    border: `1px solid ${c.border}`, padding: "40px 36px",
    boxShadow: "0 4px 24px rgba(33,150,243,0.1)"
  },
  header: { textAlign: "center", marginBottom: 28 },
  logo: { fontSize: 28, fontWeight: 700, marginBottom: 6, color: c.primary, cursor: "pointer" },
  subtitle: { fontSize: 14, color: c.textSub },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: c.textSub, marginBottom: 5, fontWeight: 500 },
  inputRow: { display: "flex", gap: 8 },
  input: {
    flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, 
    borderRadius: r.md, padding: "10px 12px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box"
  },
  
  // 소셜 로그인 관련
  socialDivider: { borderTop: `1px solid ${c.border}`, paddingTop: 20 },
  socialLabel: { fontSize: 12, color: c.textMuted, textAlign: "center", marginBottom: 14 },
  socialWrap: { display: "flex", justifyContent: "center", gap: 16 }
};
import { useNavigate } from "react-router-dom"

const webtoonGif = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Y3YmRsaGVrbTA2cDcwazN1OG00MjdzOGFiaGhoNWZycG1sYWdiNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IqjiyPP4uwserSAQss/giphy.gif"
const novelGif = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHEydmNxdzVjc3N2aHo4djRjOGZvZjdiMGl4Y3ByeXM3aWJwam5hMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wkSjSYVJPTDoHAU4ki/giphy.gif"

export default function MainPage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* 웹툰 */}
      <div onClick={() => navigate("/webtoon")} style={{
        flex: 1, cursor: "pointer", position: "relative",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end",
        paddingBottom: 52,
        transition: "flex 0.5s ease"
      }}
        onMouseEnter={e => e.currentTarget.style.flex = "1.08"}
        onMouseLeave={e => e.currentTarget.style.flex = "1"}
      >
        <img src={webtoonGif} alt="웹툰" style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%", objectFit: "cover"
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)"
        }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            fontSize: 20, fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.05em",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)"
          }}>
            꼬북의 웹툰을 즐겨보세요
          </div>
        </div>
      </div>

      {/* 웹소설 */}
      <div onClick={() => navigate("/novel")} style={{
        flex: 1, cursor: "pointer", position: "relative",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end",
        paddingBottom: 52,
        transition: "flex 0.5s ease"
      }}
        onMouseEnter={e => e.currentTarget.style.flex = "1.08"}
        onMouseLeave={e => e.currentTarget.style.flex = "1"}
      >
        <img src={novelGif} alt="웹소설" style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%", objectFit: "cover"
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)"
        }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            fontSize: 20, fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.05em",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)"
          }}>
            꼬북의 들으며 읽는 웹소설
          </div>
        </div>
      </div>

      {/* 가운데 GGoBOOK 로고 */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10, textAlign: "center",
        pointerEvents: "none"
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 80, fontWeight: 400,
          color: "#fff",
          letterSpacing: "0.15em",
          textShadow: "0 4px 32px rgba(0,0,0,0.7)"
        }}>
          GGoBOOK
        </div>
      </div>

    </div>
  )
}
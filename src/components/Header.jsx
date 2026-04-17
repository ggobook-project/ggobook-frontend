import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")

  const menus = [
    { path: "/webtoon", label: "웹툰" },
    { path: "/novel", label: "웹소설" },
    { path: "/relay", label: "릴레이" },
    { path: "/ranking", label: "랭킹" },
  ]

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${query}`)
      setSearchOpen(false)
      setQuery("")
    }
  }

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: c.bgWhite,
      borderBottom: `1px solid ${c.border}`,
      padding: "0 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 60,
    }}>
      {/* 로고 */}
      <span onClick={() => navigate("/")} style={{
        fontSize: 22, fontWeight: 700, cursor: "pointer",
        color: c.primary, letterSpacing: "-0.5px", flexShrink: 0
      }}>GGoBook</span>

      {/* 가운데 메뉴 or 검색창 */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {/* 검색창 - searchOpen일 때만 표시 */}
        {searchOpen ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: c.bgSurface, border: `1px solid ${c.primary}`,
            borderRadius: theme.radius.full, padding: "6px 16px",
            width: 280, transition: "all 0.3s"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: c.textMuted, flexShrink: 0 }}>
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="작품명, 작가명 검색"
              style={{
                flex: 1, background: "none", border: "none",
                outline: "none", color: c.text, fontSize: 13
              }}
            />
            {/* X 버튼 */}
            <span onClick={() => { setSearchOpen(false); setQuery("") }} style={{
              color: c.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1
            }}>×</span>
          </div>
        ) : (
          <>
            {menus.map(m => (
              <span key={m.path} onClick={() => navigate(m.path)} style={{
                fontSize: 14, cursor: "pointer",
                fontWeight: currentPath === m.path ? 600 : 400,
                color: currentPath === m.path ? c.primary : c.textSub,
                borderBottom: currentPath === m.path ? `2px solid ${c.primary}` : "2px solid transparent",
                paddingBottom: 4, transition: "color 0.2s, border-bottom 0.2s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = c.primary
                  e.currentTarget.style.borderBottom = `2px solid ${c.primary}`
                }}
                onMouseLeave={e => {
                  if (currentPath !== m.path) {
                    e.currentTarget.style.color = c.textSub
                    e.currentTarget.style.borderBottom = "2px solid transparent"
                  }
                }}
              >{m.label}</span>
            ))}
          </>
        )}
      </div>

      {/* 오른쪽 버튼들 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* 돋보기 아이콘 */}
        <span onClick={() => setSearchOpen(!searchOpen)} style={{
  cursor: "pointer", padding: "6px 8px", display: "flex", alignItems: "center",
  color: searchOpen ? c.primary : c.textSub, transition: "color 0.2s"
}}
  onMouseEnter={e => e.currentTarget.style.color = c.primary}
  onMouseLeave={e => e.currentTarget.style.color = searchOpen ? c.primary : c.textSub}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
</span>

        <span style={{ fontSize: 13, color: c.textMuted }}>|</span>

        <span onClick={() => navigate("/login")} style={{
          fontSize: 13, color: c.textSub, cursor: "pointer",
          padding: "6px 12px", transition: "color 0.2s"
        }}
          onMouseEnter={e => e.currentTarget.style.color = c.primary}
          onMouseLeave={e => e.currentTarget.style.color = c.textSub}
        >로그인</span>

        <span style={{ fontSize: 13, color: c.textMuted }}>|</span>

        <span onClick={() => navigate("/mypage")} style={{
          fontSize: 13, color: c.textSub, cursor: "pointer",
          padding: "6px 12px", transition: "color 0.2s"
        }}
          onMouseEnter={e => e.currentTarget.style.color = c.primary}
          onMouseLeave={e => e.currentTarget.style.color = c.textSub}
        >마이페이지</span>
      </div>
    </nav>
  )
}
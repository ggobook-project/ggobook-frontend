import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import theme from "../styles/theme"
const { colors: c } = theme

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, type: "comment", message: "독자1님이 댓글을 달았습니다.", time: "방금", read: false },
    { id: 2, type: "reply", message: "독자2님이 답글을 달았습니다.", time: "5분 전", read: false },
    { id: 3, type: "like", message: "작품에 좋아요가 달렸습니다.", time: "1시간 전", read: true },
  ])
  const notificationRef = useRef(null)

  const isLoggedIn = !!localStorage.getItem("accessToken")
  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken")
      alert("성공적으로 로그아웃 되었습니다.")
      window.location.reload()
    }
  }

  const menus = [
    { path: "/webtoon", label: "웹툰" },
    { path: "/novel", label: "웹소설" },
    { path: "/relay", label: "릴레이" },
    { path: "/ranking", label: "랭킹" },
    { path: "/notices", label: "공지" },
  ]

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setSearchOpen(false)
      setQuery("")
    }
  }

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))
  const markRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const btnStyle = {
    fontSize: 13, color: c.textSub, cursor: "pointer",
    padding: "6px 12px", transition: "color 0.2s", background: "none", border: "none"
  }

  const iconBtnStyle = (active) => ({
    cursor: "pointer", padding: "6px 8px", display: "flex", alignItems: "center",
    color: active ? c.primary : c.textSub, transition: "color 0.2s",
    borderRadius: 8, background: "none", border: "none", position: "relative"
  })

  const notifIconBg = () => "#E3F2FD"

const NotifIcon = ({ type }) => {
  if (type === "like") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2196F3" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
  if (type === "comment") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  )
}
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(8px)",
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
        {searchOpen ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid #BBDEFB",
            borderRadius: 10, padding: "7px 16px",
            width: 400, transition: "all 0.2s",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                outline: "none", color: "#0D1B2A", fontSize: 13
              }}
            />
            <span
              onClick={() => { setSearchOpen(false); setQuery("") }}
              style={{ color: "#90A4C8", cursor: "pointer", fontSize: 15, lineHeight: 1, flexShrink: 0 }}
            >✕</span>
          </div>
        ) : (
          <>
            {menus.map(m => (
              <span
                key={m.path}
                onClick={() => navigate(m.path)}
                style={{
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
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>

        {/* 돋보기 */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          style={iconBtnStyle(searchOpen)}
          onMouseEnter={e => e.currentTarget.style.color = c.primary}
          onMouseLeave={e => e.currentTarget.style.color = searchOpen ? c.primary : c.textSub}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* 알림 - 로그인시만 */}
        {isLoggedIn && (
          <div ref={notificationRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={iconBtnStyle(showNotifications)}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = showNotifications ? c.primary : c.textSub}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 5, right: 5,
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#E53935", border: "1.5px solid #fff"
                }} />
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 320, background: "#fff",
                border: "1px solid #BBDEFB", borderRadius: 12,
                boxShadow: "0 8px 24px rgba(33,150,243,0.12)",
                zIndex: 200, overflow: "hidden"
              }}>
                {/* 드롭다운 헤더 */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", borderBottom: "1px solid #E8F4FD"
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1565C0" }}>
                    알림 {unreadCount > 0 && (
                      <span style={{ fontSize: 12, color: "#2196F3" }}>({unreadCount})</span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{
                      background: "none", border: "none", fontSize: 12,
                      color: "#2196F3", cursor: "pointer", padding: 0
                    }}>모두 읽음</button>
                  )}
                </div>

                {/* 알림 목록 */}
                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center", color: "#90A4C8", fontSize: 13 }}>
                      알림이 없습니다
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          padding: "12px 16px",
                          background: n.read ? "#fff" : "#EEF7FF",
                          borderBottom: "1px solid #E8F4FD",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          display: "flex", gap: 10, alignItems: "flex-start"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#E3F2FD"}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? "#fff" : "#EEF7FF"}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: notifIconBg(n.type),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <NotifIcon type={n.type} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "#0D1B2A", lineHeight: 1.5 }}>{n.message}</div>
                          <div style={{ fontSize: 11, color: "#90A4C8", marginTop: 3 }}>{n.time}</div>
                        </div>
                        {!n.read && (
                          <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#2196F3", marginTop: 4, flexShrink: 0
                          }} />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* 드롭다운 푸터 */}
                <div style={{
                  padding: "10px 16px", borderTop: "1px solid #E8F4FD",
                  textAlign: "center"
                }}>
                  <button style={{
                    background: "none", border: "none", fontSize: 12,
                    color: "#4A6FA5", cursor: "pointer"
                  }}>알림 전체 보기</button>
                </div>
              </div>
            )}
          </div>
        )}

        <span style={{ fontSize: 13, color: c.border }}>|</span>

        {isLoggedIn ? (
          <>
            <button
              onClick={handleLogout}
              style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >로그아웃</button>

            <span style={{ fontSize: 13, color: c.border }}>|</span>

            <button
              onClick={() => navigate("/mypage")}
              style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >마이페이지</button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >로그인</button>

            <span style={{ fontSize: 13, color: c.border }}>|</span>

            <button
              onClick={() => navigate("/signup")}
              style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >회원가입</button>
          </>
        )}
      </div>
    </nav>
  )
}
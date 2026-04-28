import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import theme from "../styles/theme";
import NotificationBell from "./NotificationBell";
import api from "../api/axios"; 

const { colors: c } = theme;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const getRole = () => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const r = payload.role || payload.roles?.[0] || payload.authority;
    return typeof r === "string" ? r.replace("ROLE_", "") : null;
  } catch { return null; }
}
  const role = getRole() || localStorage.getItem("userRole") || "USER"
  const isAdmin = role === "ADMIN"
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  const isTokenExpired = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true; 
    }
  }

    if (token) {
      if (isTokenExpired(token)) {
        // 🌟 핵심 수정 1: 토큰 썩었을 때 양쪽 주머니 모두 파기!
        localStorage.removeItem("accessToken")
        sessionStorage.removeItem("accessToken")
        setIsLoggedIn(false)
      } else {
        setIsLoggedIn(true)
      }
    } else {
      setIsLoggedIn(false)
    }
  }, [currentPath]) 

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("로그아웃 에러:", error);
    } finally {
      // 🌟 핵심 수정 2: 로그아웃 할 때 양쪽 주머니 모두 파기!
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      navigate("/", { replace: true });
    }
  };

  const menus = [
    { path: "/webtoon", label: "웹툰" },
    { path: "/novel", label: "웹소설" },
    { path: "/relay", label: "릴레이" },
    { path: "/ranking", label: "랭킹" },
    { path: "/notices", label: "공지" },
  ];

const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
        navigate(`/search?keyword=${encodeURIComponent(query)}`); // ✅ q → keyword
        setSearchOpen(false); // ✅ searchOpen(false) → setSearchOpen(false)
        setQuery("");
    }
};

  const btnStyle = {
    fontSize: 13, color: c.textSub, cursor: "pointer",
    padding: "6px 12px", transition: "color 0.2s", background: "none", border: "none"
  };

  const iconBtnStyle = (active) => ({
    cursor: "pointer", padding: "6px 8px", display: "flex", alignItems: "center",
    color: active ? c.primary : c.textSub, transition: "color 0.2s",
    borderRadius: 8, background: "none", border: "none", position: "relative"
  });

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
      background: "#FFFFFF",
      borderBottom: `1px solid ${c.border}`,
      padding: "0 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 60,
    }}>
      <span onClick={() => navigate("/")} style={{
        fontSize: 22, fontWeight: 700, cursor: "pointer",
        color: c.primary, letterSpacing: "-0.5px", flexShrink: 0
      }}>GGoBook</span>

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
                  e.currentTarget.style.color = c.primary;
                  e.currentTarget.style.borderBottom = `2px solid ${c.primary}`;
                }}
                onMouseLeave={e => {
                  if (currentPath !== m.path) {
                    e.currentTarget.style.color = c.textSub;
                    e.currentTarget.style.borderBottom = "2px solid transparent";
                  }
                }}
              >{m.label}</span>
            ))}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        
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

        {/* 🌟 로그인 한 유저에게만 알림 벨 표시 */}
        {isLoggedIn && role === 'USER' && <NotificationBell />}

        <span style={{ fontSize: 13, color: c.border }}>|</span>

        {isLoggedIn ? (
          <>
            <button onClick={handleLogout} style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >로그아웃</button>
            <span style={{ fontSize: 13, color: c.border }}>|</span>

            <button
              onClick={() => navigate(isAdmin ? "/admin" : "/mypage")}
              style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >{isAdmin ? "관리자페이지" : "마이페이지"}</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")} style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >로그인</button>
            <span style={{ fontSize: 13, color: c.border }}>|</span>
            <button onClick={() => navigate("/signup")} style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSub}
            >회원가입</button>
          </>
        )}
      </div>
    </nav>
  );
}
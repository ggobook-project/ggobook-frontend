import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import theme from "../styles/theme";
import wave from "../assets/wave.png";

const { colors: c } = theme;
const days = ["전체", "월", "화", "수", "목", "금", "토", "일"];

const HERO_ITEMS = [
  {
    gif: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTduaDd0ZHd6eTY1b3Q4eHdva3VydGh4cm9zcWpia2R2bGcybmJsaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BTjTA688xvJn5oJRxf/giphy.gif",
    label: "이번 주 추천 작품",
  },
  {
    gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExam44M3kxd2cxcHQ3eThjYm12YWY2dmNldXhjanR4YjBubDM3ZmU5OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hVyqFRRRaWUQNaZPrj/giphy.gif",
    label: "신작 추천",
  },
  {
    gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVpaXd5Z3o4NGJtb3pya20wNzZiMGZ4ZGV1MDcwdHZ1d2xqeDdqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/llyXLc2WzUs2hPzn74/giphy.gif",
    label: "인기 급상승",
  },
  {
    gif: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXBrdW82a3ZldzlxOHMxOHNpdDA5aTN0bzJjM2pwaWd1dmczYnEzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KxhWr1rf6uvGiXPA2z/giphy.gif",
    label: "완결 추천",
  },
];

const swiperNavStyle = `
  .swiper-button-prev, .swiper-button-next { display: none !important; }
  .swiper { overflow: hidden !important; }
`;

function NavBtn({ direction, swiperRef }) {
  return (
    <button
      onClick={() => direction === "prev" ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext()}
      style={{
        position: "absolute", top: "40%", transform: "translateY(-50%)",
        [direction === "prev" ? "left" : "right"]: -48,
        zIndex: 10, background: "none", border: "none",
        cursor: "pointer", padding: 4, opacity: 0.4,
        transition: "opacity 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-50%) scale(1.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "0.4"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
    >
      <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke={c.textSub} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev"
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

export default function WebtoonPage() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("전체");
  const [query, setQuery] = useState("");
  const [popularContents, setPopularContents] = useState([]);
  const [newContents, setNewContents] = useState([]);
  const [dailyContents, setDailyContents] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const popularSwiperRef = useRef(null);
  const newSwiperRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_ITEMS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMainData = async () => {
    try {
      const [popRes, newRes] = await Promise.all([
        fetch(`http://localhost:8080/api/contents/?type=웹툰&page=0&size=10`),
        fetch(`http://localhost:8080/api/contents/?type=웹툰&page=0&size=10`),
      ]);
      if (popRes.ok) { const d = await popRes.json(); setPopularContents(d.content); }
      if (newRes.ok) { const d = await newRes.json(); setNewContents(d.content); }
    } catch (error) { console.error("메인 데이터 로딩 실패:", error); }
  };

  const fetchDailyData = async (pageNum, day) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/contents/?type=웹툰&page=${pageNum}&size=10&serialDay=${day}`
      );
      if (response.ok) {
        const data = await response.json();
        setDailyContents((prev) => pageNum === 0 ? data.content : [...prev, ...data.content]);
        setHasNext(!data.last);
      }
    } catch (error) { console.error("요일별 웹툰 불러오기 실패:", error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeDay === "전체") {
      setDailyContents([]);
      setPage(0);
      setHasNext(true);
      fetchMainData();
    } else {
      setDailyContents([]);
      setPage(0);
      setHasNext(true);
      fetchDailyData(0, activeDay);
    }
  }, [activeDay]);

  // 전체 탭 돌아올 때 Swiper 강제 업데이트
  useEffect(() => {
    if (activeDay === "전체") {
      setTimeout(() => {
        popularSwiperRef.current?.update();
        newSwiperRef.current?.update();
      }, 50);
    }
  }, [activeDay]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasNext && !isLoading && activeDay !== "전체") {
      setPage((prev) => { const next = prev + 1; fetchDailyData(next, activeDay); return next; });
    }
  }, [hasNext, isLoading, activeDay]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver, activeDay]);

  const heroItem = popularContents[heroIndex] || null;
  const currentHero = HERO_ITEMS[heroIndex];

  const cardStyle = {
    width: "100%", aspectRatio: "3/4", objectFit: "cover",
    borderRadius: theme.radius.md, border: `1px solid ${c.border}`,
    marginBottom: 10, display: "block",
  };

  return (
    <div style={{ background: "transparent", minHeight: "calc(100vh - 60px)", position: "relative" }}>

      <style>{swiperNavStyle}</style>

      {/* 파도 배경 */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${wave})`, backgroundSize: "cover",
        backgroundPosition: "center", opacity: 0.08, zIndex: 0, pointerEvents: "none",
      }} />

      {/* 히어로 섹션 */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: 420, overflow: "hidden" }}>
        {HERO_ITEMS.map((item, i) => (
          <img key={i} src={item.gif} alt="" style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%", objectFit: "cover",
            filter: "blur(3px) brightness(0.35)", transform: "scale(1.06)",
            opacity: i === heroIndex ? 1 : 0,
            transition: "opacity 0.8s ease", zIndex: 0,
          }} />
        ))}

        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1100, margin: "0 auto", padding: "0 40px",
          height: "100%", display: "flex", alignItems: "center", gap: 48,
        }}>
          <div style={{
            flexShrink: 0, width: 260, height: 360,
            borderRadius: theme.radius.lg, overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            border: "2px solid rgba(255,255,255,0.15)", position: "relative",
          }}>
            {HERO_ITEMS.map((item, i) => (
              <img key={i} src={item.gif} alt={`hero-${i}`} style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%", objectFit: "cover",
                opacity: i === heroIndex ? 1 : 0, transition: "opacity 0.8s ease",
              }} />
            ))}
          </div>

          <div style={{ flex: 1, color: "#fff" }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 2,
              color: "rgba(255,255,255,0.6)", marginBottom: 10, textTransform: "uppercase",
            }}>
              🔥 {currentHero.label}
            </div>
            {heroItem ? (
              <>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{heroItem.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                  {heroItem.authorName || "작가명"} · {heroItem.genre}
                </div>
                <div style={{
                  fontSize: 14, color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.7, marginBottom: 28, maxWidth: 480,
                  display: "-webkit-box", WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {heroItem.description || heroItem.summary || "줄거리 정보가 없습니다."}
                </div>
                <button
                  onClick={() => navigate(`/contents/${heroItem.contentId}`)}
                  style={{
                    padding: "12px 28px", background: c.primary, border: "none",
                    borderRadius: theme.radius.md, color: "#fff",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    transition: "background 0.2s, transform 0.1s",
                    boxShadow: "0 4px 16px rgba(33,150,243,0.4)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = c.primaryDark}
                  onMouseLeave={e => e.currentTarget.style.background = c.primary}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >바로 보기 →</button>
              </>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 700 }}>GGoBook 웹툰</div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 32 }}>
              {HERO_ITEMS.map((_, i) => (
                <div key={i} onClick={() => setHeroIndex(i)} style={{
                  width: i === heroIndex ? 24 : 8, height: 8,
                  borderRadius: 4, cursor: "pointer",
                  background: i === heroIndex ? "#fff" : "rgba(255,255,255,0.35)",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 60px", position: "relative", zIndex: 1 }}>

        {/* 검색 */}
        <div style={{
          display: "flex", gap: 10, alignItems: "center",
          background: c.bgWhite, border: `1px solid ${c.border}`,
          borderRadius: theme.radius.md, padding: "10px 16px", marginBottom: 24,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="작품명, 작가명 검색"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: c.text, fontSize: 14 }}
          />
        </div>

        {/* 요일 탭 */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${c.border}` }}>
          {days.map((d) => (
            <button key={d} onClick={() => setActiveDay(d)} style={{
              padding: "8px 18px", fontSize: 13, cursor: "pointer",
              background: "none", border: "none",
              borderBottom: activeDay === d ? `2px solid ${c.primary}` : "2px solid transparent",
              color: activeDay === d ? c.primary : c.textSub,
              fontWeight: activeDay === d ? 600 : 400,
              transition: "color 0.2s, border-color 0.2s",
              marginBottom: -1,
            }}
              onMouseEnter={e => { if (activeDay !== d) e.currentTarget.style.color = c.text }}
              onMouseLeave={e => { if (activeDay !== d) e.currentTarget.style.color = c.textSub }}
            >{d}</button>
          ))}
        </div>

        {activeDay === "전체" ? (
          <div>
            {/* 인기 웹툰 */}
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>인기 웹툰</div>
            <div style={{ position: "relative", marginBottom: 36 }}>
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={4}
                onSwiper={(s) => (popularSwiperRef.current = s)}
                style={{ width: "100%", maxWidth: "100%" }}
              >
                {popularContents.map((item) => (
                  <SwiperSlide key={item.contentId}>
                    <div onClick={() => navigate(`/contents/${item.contentId}`)} style={{ cursor: "pointer" }}>
                      <img src={item.thumbnailUrl} alt={item.title} style={cardStyle} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: c.textMuted }}>{item.genre}</div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <NavBtn direction="prev" swiperRef={popularSwiperRef} />
              <NavBtn direction="next" swiperRef={popularSwiperRef} />
            </div>

            {/* 신작 웹툰 */}
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>신작 웹툰</div>
            <div style={{ position: "relative", marginBottom: 36 }}>
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={4}
                onSwiper={(s) => (newSwiperRef.current = s)}
                style={{ width: "100%", maxWidth: "100%" }}
              >
                {newContents.map((item) => (
                  <SwiperSlide key={item.contentId}>
                    <div onClick={() => navigate(`/contents/${item.contentId}`)} style={{ cursor: "pointer" }}>
                      <img src={item.thumbnailUrl} alt={item.title} style={cardStyle} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: c.textMuted }}>{item.genre}</div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <NavBtn direction="prev" swiperRef={newSwiperRef} />
              <NavBtn direction="next" swiperRef={newSwiperRef} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>{activeDay}요 웹툰</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
              {dailyContents.map((item) => (
                <div key={item.contentId} onClick={() => navigate(`/contents/${item.contentId}`)} style={{ cursor: "pointer" }}>
                  <img src={item.thumbnailUrl} alt={item.title} style={cardStyle} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: c.textMuted }}>{item.genre}</div>
                </div>
              ))}
            </div>
            <div ref={observerRef} style={{ height: 50, display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
              {isLoading && <span style={{ color: c.textMuted }}>데이터를 불러오는 중입니다...</span>}
              {!hasNext && !isLoading && dailyContents.length > 0 && (
                <span style={{ color: c.textMuted }}>모든 작품을 다 보셨습니다.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
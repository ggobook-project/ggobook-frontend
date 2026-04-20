import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import theme from "../styles/theme";
import wave from "../assets/wave.png";

const { colors: c } = theme;
const genres = ["전체", "로맨스", "판타지", "무협", "현대", "스릴러", "BL"];

const HERO_ITEMS = [
  {
    gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGxwbnlmcWF4NGcwMnJ0NHlpaDdvZXQ2cWJhNHNhN21zdTdqOHBhcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/e90FexJLguhdDMugYq/giphy.gif",
    label: "이번 주 추천 소설",
  },
  {
    gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3l2cnhiMjZyZ29nNzg4bXkzb29mb3ZvbGMwbGdnZGhoenlrOWdvcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/T4DwzWhfZpJfh4A3U2/giphy.gif",
    label: "신작 추천",
  },
  {
    gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTgyMWtmazUxZmgzNGhibjFjcm41NnA3dmI5bGhmemJ1YmF3bjJ3biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RjzUPCMgzZqAdepaOB/giphy.gif",
    label: "인기 급상승",
  },
  {
    gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWFmMDBvbmo2ZnkxeXJnem52NW1ta2kwYTAxajZkYmp5em44czVuNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Meyy8tFOoqnGSqkCAt/giphy.gif",
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
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={c.textSub} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev"
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

export default function NovelPage() {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState("전체");
  const [heroIndex, setHeroIndex] = useState(0);
  const [popularContents, setPopularContents] = useState([]);
  const [newContents, setNewContents] = useState([]);
  const [genreContents, setGenreContents] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const popularSwiperRef = useRef(null);
  const newSwiperRef = useRef(null);

  // 히어로 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_ITEMS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 인기/신작 데이터
  const fetchMainData = async () => {
    try {
      const [popRes, newRes] = await Promise.all([
        fetch(`http://localhost:8080/api/contents/?type=웹소설&page=0&size=10`),
        fetch(`http://localhost:8080/api/contents/?type=웹소설&page=0&size=10`),
      ]);
      if (popRes.ok) { const d = await popRes.json(); setPopularContents(d.content); }
      if (newRes.ok) { const d = await newRes.json(); setNewContents(d.content); }
    } catch (error) { console.error("메인 데이터 로딩 실패:", error); }
  };

  // 장르별 데이터 (무한 스크롤)
  const fetchGenreData = async (pageNum, genre) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const genreParam = genre === "전체" ? "" : `&genre=${genre}`;
      const response = await fetch(
        `http://localhost:8080/api/contents/?type=웹소설&page=${pageNum}&size=10${genreParam}`
      );
      if (response.ok) {
        const data = await response.json();
        setGenreContents((prev) => pageNum === 0 ? data.content : [...prev, ...data.content]);
        setHasNext(!data.last);
      }
    } catch (error) { console.error("장르별 소설 불러오기 실패:", error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeGenre === "전체") {
      setGenreContents([]);
      setPage(0);
      setHasNext(true);
      fetchMainData();
    } else {
      setGenreContents([]);
      setPage(0);
      setHasNext(true);
      fetchGenreData(0, activeGenre);
    }
  }, [activeGenre]);

  // 전체 탭 돌아올 때 Swiper 강제 업데이트
  useEffect(() => {
    if (activeGenre === "전체") {
      setTimeout(() => {
        popularSwiperRef.current?.update();
        newSwiperRef.current?.update();
      }, 50);
    }
  }, [activeGenre]);

  // 무한 스크롤
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasNext && !isLoading && activeGenre !== "전체") {
      setPage((prev) => { const next = prev + 1; fetchGenreData(next, activeGenre); return next; });
    }
  }, [hasNext, isLoading, activeGenre]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver, activeGenre]);

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
              📖 {currentHero.label}
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
                >바로 읽기 →</button>
              </>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 700 }}>GGoBook 웹소설</div>
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

        {/* 장르 탭 */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${c.border}` }}>
          {genres.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)} style={{
              padding: "8px 18px", fontSize: 13, cursor: "pointer",
              background: "none", border: "none",
              borderBottom: activeGenre === g ? `2px solid ${c.primary}` : "2px solid transparent",
              color: activeGenre === g ? c.primary : c.textSub,
              fontWeight: activeGenre === g ? 600 : 400,
              transition: "color 0.2s, border-color 0.2s",
              marginBottom: -1,
            }}
              onMouseEnter={e => { if (activeGenre !== g) e.currentTarget.style.color = c.text }}
              onMouseLeave={e => { if (activeGenre !== g) e.currentTarget.style.color = c.textSub }}
            >{g}</button>
          ))}
        </div>

        {/* 전체 탭 */}
        {activeGenre === "전체" ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>인기 웹소설</div>
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

            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>신작 웹소설</div>
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
          /* 장르별 탭 - 세로 목록 + 무한 스크롤 */
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>{activeGenre} 웹소설</div>
            {genreContents.map((n) => (
              <div key={n.contentId} onClick={() => navigate(`/contents/${n.contentId}`)} style={{
                display: "flex", gap: 16, padding: 16,
                background: c.bgWhite, borderRadius: theme.radius.md,
                border: `1px solid ${c.border}`, marginBottom: 10, cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.boxShadow = `0 4px 12px rgba(33,150,243,0.1)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "none"; }}
              >
                <img
                  src={n.thumbnailUrl} alt={n.title}
                  style={{ width: 60, height: 78, objectFit: "cover", borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 5 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>
                    {n.authorName || "작가명"} · {n.genre}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.textSub }}>
                      {n.status || "연재중"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div ref={observerRef} style={{ height: 50, display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
              {isLoading && <span style={{ color: c.textMuted }}>데이터를 불러오는 중입니다...</span>}
              {!hasNext && !isLoading && genreContents.length > 0 && (
                <span style={{ color: c.textMuted }}>모든 작품을 다 보셨습니다.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "../styles/NovelPage.module.css";
import AiChatbotWidget from "../components/AiChatbotWidget";

const genres = ["전체", "로맨스", "판타지", "무협", "현대", "스릴러", "BL"];

const HERO_ITEMS = [
  { gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGxwbnlmcWF4NGcwMnJ0NHlpaDdvZXQ2cWJhNHNhN21zdTdqOHBhcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/e90FexJLguhdDMugYq/giphy.gif", label: "이번 주 추천 소설" },
  { gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3l2cnhiMjZyZ29nNzg4bXkzb29mb3ZvbGMwbGdnZGhoenlrOWdvcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/T4DwzWhfZpJfh4A3U2/giphy.gif", label: "신작 추천" },
  { gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTgyMWtmazUxZmgzNGhibjFjcm41NnA3dmI5bGhmemJ1YmF3bjJ3biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RjzUPCMgzZqAdepaOB/giphy.gif", label: "인기 급상승" },
  { gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWFmMDBvbmo2ZnkxeXJnem52NW1ta2kwYTAxajZkYmp5em44czVuNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Meyy8tFOoqnGSqkCAt/giphy.gif", label: "완결 추천" },
];

const swiperNavStyle = `
  .swiper-button-prev, .swiper-button-next { display: none !important; }
  .swiper { overflow: hidden !important; }
`;

function NavBtn({ direction, swiperRef }) {
  return (
    <button
      className={`${styles.navBtn} ${direction === "prev" ? styles.navBtnPrev : styles.navBtnNext}`}
      onClick={() => direction === "prev" ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext()}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A6FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
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
  const [query, setQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_ITEMS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchGenreData = async (pageNum, genre) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const genreParam = genre === "전체" ? "" : `&genre=${genre}`;
      const response = await fetch(`http://localhost:8080/api/contents/?type=웹소설&page=${pageNum}&size=10${genreParam}`);
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
      setGenreContents([]); setPage(0); setHasNext(true);
      fetchMainData();
    } else {
      setGenreContents([]); setPage(0); setHasNext(true);
      fetchGenreData(0, activeGenre);
    }
  }, [activeGenre]);

  useEffect(() => {
    if (activeGenre === "전체") {
      setTimeout(() => {
        popularSwiperRef.current?.update();
        newSwiperRef.current?.update();
      }, 50);
    }
  }, [activeGenre]);

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

  return (
    <div className={styles.pageWrapper}>
      <style>{swiperNavStyle}</style>

      <div className={styles.heroSection}>
        {HERO_ITEMS.map((item, i) => (
          <img key={i} src={item.gif} alt="" className={`${styles.heroBg} ${i === heroIndex ? styles.heroBgActive : ""}`} />
        ))}
        <div className={styles.heroInner}>
          <div className={styles.heroCard}>
            {HERO_ITEMS.map((item, i) => (
              <img key={i} src={item.gif} alt={`hero-${i}`} className={`${styles.heroCardImg} ${i === heroIndex ? styles.heroCardImgActive : ""}`} />
            ))}
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroLabel}>📖 {currentHero.label}</div>
            {heroItem ? (
              <>
                <div className={styles.heroTitle}>{heroItem.title}</div>
                <div className={styles.heroAuthor}>{heroItem.authorName || "작가명"} · {heroItem.genre}</div>
                <div className={styles.heroDesc}>{heroItem.description || heroItem.summary || "줄거리 정보가 없습니다."}</div>
                <button className={styles.heroBtn} onClick={() => navigate(`/contents/${heroItem.contentId}`)}>바로 읽기 →</button>
              </>
            ) : (
              <div className={styles.heroFallback}>GGoBook 웹소설</div>
            )}
            <div className={styles.heroDots}>
              {HERO_ITEMS.map((_, i) => (
                <div key={i} onClick={() => setHeroIndex(i)} className={`${styles.heroDot} ${i === heroIndex ? styles.heroDotActive : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {genres.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)} className={`${styles.tabBtn} ${activeGenre === g ? styles.tabBtnActive : ""}`}>{g}</button>
          ))}
        </div>

        {activeGenre === "전체" ? (
          <div>
            <div className={styles.sectionTitle}>인기 웹소설</div>
            <div className={styles.swiperWrap}>
              <Swiper modules={[Navigation]} spaceBetween={20} slidesPerView={4} onSwiper={(s) => (popularSwiperRef.current = s)} style={{ width: "100%", maxWidth: "100%" }}>
                {popularContents.map((item) => (
                  <SwiperSlide key={item.contentId}>
                    <div onClick={() => navigate(`/contents/${item.contentId}`)} className={styles.cardItem}>
                      <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
                      <div className={styles.cardTitle}>{item.title}</div>
                      <div className={styles.cardGenre}>{item.genre}</div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <NavBtn direction="prev" swiperRef={popularSwiperRef} />
              <NavBtn direction="next" swiperRef={popularSwiperRef} />
            </div>

            <div className={styles.sectionTitle}>신작 웹소설</div>
            <div className={styles.swiperWrap}>
              <Swiper modules={[Navigation]} spaceBetween={20} slidesPerView={4} onSwiper={(s) => (newSwiperRef.current = s)} style={{ width: "100%", maxWidth: "100%" }}>
                {newContents.map((item) => (
                  <SwiperSlide key={item.contentId}>
                    <div onClick={() => navigate(`/contents/${item.contentId}`)} className={styles.cardItem}>
                      <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
                      <div className={styles.cardTitle}>{item.title}</div>
                      <div className={styles.cardGenre}>{item.genre}</div>
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
            <div className={styles.sectionTitle}>{activeGenre} 웹소설</div>
            {genreContents.map((n) => (
              <div key={n.contentId} className={styles.genreCard} onClick={() => navigate(`/contents/${n.contentId}`)}>
                <img src={n.thumbnailUrl} alt={n.title} className={styles.genreCardImg} />
                <div>
                  <div className={styles.genreCardTitle}>{n.title}</div>
                  <div className={styles.genreCardMeta}>{n.authorName || "작가명"} · {n.genre}</div>
                  <div className={styles.genreCardBadges}>
                    <span className={styles.badge}>{n.status || "연재중"}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={observerRef} className={styles.observer}>
              {isLoading && <span className={styles.observerText}>데이터를 불러오는 중입니다...</span>}
              {!hasNext && !isLoading && genreContents.length > 0 && <span className={styles.observerText}>모든 작품을 다 보셨습니다.</span>}
            </div>
          </div>
        )}
      </div>
      <AiChatbotWidget />
    </div>
  );
}
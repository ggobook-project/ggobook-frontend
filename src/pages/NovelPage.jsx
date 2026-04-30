import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "../styles/NovelPage.module.css";
import AiChatbotWidget from "../components/AiChatbotWidget";
import api from "../api/axios"; // 🌟 axios 추가

const days = ["전체", "월", "화", "수", "목", "금", "토", "일", "완결"];

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
  const [activeDay, setActiveDay] = useState("전체");
  const [heroIndex, setHeroIndex] = useState(0);
  const [popularContents, setPopularContents] = useState([]);
  const [newContents, setNewContents] = useState([]);
  const [dayContents, setDayContents] = useState([]);
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
      // 🌟 핵심: fetch 대신 api.get 사용, 인기작에는 sortType=popular 부착
      const [popRes, newRes] = await Promise.all([
        api.get(`/api/contents/?type=웹소설&sortType=popular&page=0&size=10`),
        api.get(`/api/contents/?type=웹소설&page=0&size=10`),
      ]);
      setPopularContents(popRes.data.content);
      setNewContents(newRes.data.content);
    } catch (error) { console.error("메인 데이터 로딩 실패:", error); }
  };

  const fetchDayData = async (pageNum, day) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const dayParam = day === "전체" ? "" : `&serialDay=${day}`;
      // 🌟 핵심: 요일별 데이터도 api.get 사용
      const response = await api.get(`/api/contents/?type=웹소설&page=${pageNum}&size=10${dayParam}`);
      const data = response.data;
      setDayContents((prev) => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setHasNext(!data.last);
    } catch (error) { console.error("요일별 소설 불러오기 실패:", error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeDay === "전체") {
      setDayContents([]); setPage(0); setHasNext(true);
      fetchMainData();
    } else {
      setDayContents([]); setPage(0); setHasNext(true);
      fetchDayData(0, activeDay);
    }
  }, [activeDay]);

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
      setPage((prev) => { const next = prev + 1; fetchDayData(next, activeDay); return next; });
    }
  }, [hasNext, isLoading, activeDay]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver, activeDay]);

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

        
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query)}`)
              }
            }}
            placeholder="작품명, 작가명, 태그 검색"
            className={styles.searchInput}
          />
        </div>

        
        <div className={styles.tabGroup}>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`${styles.tabBtn} ${activeDay === d ? styles.tabBtnActive : ""}`}
            >{d}</button>
          ))}
        </div>

        {activeDay === "전체" ? (
          <div>
            <div className={styles.sectionTitle}>인기 웹소설</div>
            <div className={styles.swiperWrap}>
              <Swiper modules={[Navigation]} spaceBetween={20} slidesPerView={4} onSwiper={(s) => (popularSwiperRef.current = s)} style={{ width: "100%", maxWidth: "100%" }}>
                {popularContents.map((item) => (
                  <SwiperSlide key="{item.contentId}">
                    <div onClick={() => navigate(`/contents/${item.contentId}`)} className={styles.cardItem}>
                      <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
                      <div className={styles.cardTitle}>{item.title}</div>
                      <div className={styles.cardGenre}>{item.genre}</div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <NavBtn direction="prev" swiperRef="{popularSwiperRef}"/>
              <NavBtn direction="next" swiperRef="{popularSwiperRef}"/>
            </div>

            <div className={styles.sectionTitle}>신작 웹소설</div>
            <div className={styles.swiperWrap}>
              <Swiper modules={[Navigation]} spaceBetween={20} slidesPerView={4} onSwiper={(s) => (newSwiperRef.current = s)} style={{ width: "100%", maxWidth: "100%" }}>
                {newContents.map((item) => (
                  <SwiperSlide key="{item.contentId}">
                    <div onClick={() => navigate(`/contents/${item.contentId}`)} className={styles.cardItem}>
                      <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
                      <div className={styles.cardTitle}>{item.title}</div>
                      <div className={styles.cardGenre}>{item.genre}</div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <NavBtn direction="prev" swiperRef="{newSwiperRef}"/>
              <NavBtn direction="next" swiperRef="{newSwiperRef}"/>
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.sectionTitle}>{activeDay}요일 웹소설</div>
            {dayContents.map((n) => (
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
              {!hasNext && !isLoading && dayContents.length > 0 && <span className={styles.observerText}>모든 작품을 다 보셨습니다.</span>}
            </div>
          </div>
        )}
      </div>
      <AiChatbotWidget/>
    </div>
  );
}
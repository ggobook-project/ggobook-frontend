import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import wave from "../assets/wave.png";
import styles from "../styles/WebtoonPage.module.css"

const days = ["전체", "월", "화", "수", "목", "금", "토", "일"];

const HERO_ITEMS = [
  { gif: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTduaDd0ZHd6eTY1b3Q4eHdva3VydGh4cm9zcWpia2R2bGcybmJsaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BTjTA688xvJn5oJRxf/giphy.gif", label: "이번 주 추천 작품" },
  { gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExam44M3kxd2cxcHQ3eThjYm12YWY2dmNldXhjanR4YjBubDM3ZmU5OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hVyqFRRRaWUQNaZPrj/giphy.gif", label: "신작 추천" },
  { gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVpaXd5Z3o4NGJtb3pya20wNzZiMGZ4ZGV1MDcwdHZ1d2xqeDdqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/llyXLc2WzUs2hPzn74/giphy.gif", label: "인기 급상승" },
  { gif: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXBrdW82a3ZldzlxOHMxOHNpdDA5aTN0bzJjM2pwaWd1dmczYnEzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KxhWr1rf6uvGiXPA2z/giphy.gif", label: "완결 추천" },
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
      <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#4A6FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      setDailyContents([]); setPage(0); setHasNext(true);
      fetchMainData();
    } else {
      setDailyContents([]); setPage(0); setHasNext(true);
      fetchDailyData(0, activeDay);
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

  return (
    <div className={styles.pageWrapper}>
      <style>{swiperNavStyle}</style>

      {/* 파도 배경 */}
      <div style={{
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundImage: `url(${wave})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  opacity: 0.08, zIndex: 0, pointerEvents: "none",
}} />

      {/* 히어로 섹션 */}
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
            <div className={styles.heroLabel}>🔥 {currentHero.label}</div>
            {heroItem ? (
              <>
                <div className={styles.heroTitle}>{heroItem.title}</div>
                <div className={styles.heroAuthor}>{heroItem.authorName || "작가명"} · {heroItem.genre}</div>
                <div className={styles.heroDesc}>{heroItem.description || heroItem.summary || "줄거리 정보가 없습니다."}</div>
                <button className={styles.heroBtn} onClick={() => navigate(`/contents/${heroItem.contentId}`)}>바로 보기 →</button>
              </>
            ) : (
              <div className={styles.heroFallback}>GGoBook 웹툰</div>
            )}
            <div className={styles.heroDots}>
              {HERO_ITEMS.map((_, i) => (
                <div key={i} onClick={() => setHeroIndex(i)} className={`${styles.heroDot} ${i === heroIndex ? styles.heroDotActive : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className={styles.content}>
        {/* 검색 */}
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="작품명, 작가명 검색" className={styles.searchInput} />
        </div>

        {/* 요일 탭 */}
        <div className={styles.tabGroup}>
          {days.map((d) => (
            <button key={d} onClick={() => setActiveDay(d)} className={`${styles.tabBtn} ${activeDay === d ? styles.tabBtnActive : ""}`}>{d}</button>
          ))}
        </div>

        {activeDay === "전체" ? (
          <div>
            <div className={styles.sectionTitle}>인기 웹툰</div>
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

            <div className={styles.sectionTitle}>신작 웹툰</div>
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
            <div className={styles.sectionTitle}>{activeDay}요 웹툰</div>
            <div className={styles.dailyGrid}>
              {dailyContents.map((item) => (
                <div key={item.contentId} onClick={() => navigate(`/contents/${item.contentId}`)} className={styles.cardItem}>
                  <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
                  <div className={styles.cardTitle}>{item.title}</div>
                  <div className={styles.cardGenre}>{item.genre}</div>
                </div>
              ))}
            </div>
            <div ref={observerRef} className={styles.observer}>
              {isLoading && <span className={styles.observerText}>데이터를 불러오는 중입니다...</span>}
              {!hasNext && !isLoading && dailyContents.length > 0 && <span className={styles.observerText}>모든 작품을 다 보셨습니다.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
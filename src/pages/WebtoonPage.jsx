import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import theme from "../styles/theme";
import wave from "../assets/wave.png";
import webtoon1 from "../assets/webtoon1.jpg";
import webtoon2 from "../assets/webtoon2.jpg";
import webtoon3 from "../assets/webtoon3.jpg";
import webtoon4 from "../assets/webtoon4.jpg";
import webtoon5 from "../assets/webtoon5.jpg";
import webtoon6 from "../assets/webtoon6.jpg";
import webtoon7 from "../assets/webtoon7.jpg";
import webtoon8 from "../assets/webtoon8.jpg";
const { colors: c } = theme;

const days = ["전체", "월", "화", "수", "목", "금", "토", "일"];
const mockItems = [
  {
    id: 1,
    title: "웹툰 작품 1",
    author: "작가명",
    genre: "로맨스",
    free: true,
    img: webtoon1,
  },
  {
    id: 2,
    title: "웹툰 작품 2",
    author: "작가명",
    genre: "판타지",
    free: false,
    img: webtoon2,
  },
  {
    id: 3,
    title: "웹툰 작품 3",
    author: "작가명",
    genre: "액션",
    free: true,
    img: webtoon3,
  },
  {
    id: 4,
    title: "웹툰 작품 4",
    author: "작가명",
    genre: "일상",
    free: false,
    img: webtoon4,
  },
  {
    id: 5,
    title: "웹툰 작품 5",
    author: "작가명",
    genre: "로맨스",
    free: true,
    img: webtoon5,
  },
  {
    id: 6,
    title: "웹툰 작품 6",
    author: "작가명",
    genre: "판타지",
    free: false,
    img: webtoon6,
  },
  {
    id: 7,
    title: "웹툰 작품 7",
    author: "작가명",
    genre: "액션",
    free: true,
    img: webtoon7,
  },
  {
    id: 8,
    title: "웹툰 작품 8",
    author: "작가명",
    genre: "일상",
    free: false,
    img: webtoon8,
  },
];

export default function WebtoonPage() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("전체");
  const [query, setQuery] = useState("");

  // 랭킹 작품(가로로 넘김)
  const [popularContents, setPopularContents] = useState([]);

  // 신작 작품
  const [newContents, setNewContents] = useState([]);

  // 요일별 작품(세로로 무한 스크롤)
  const [dailyContents, setDailyContents] = useState([]);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef(null);

  // 인기, 신작 랭킹 데이터 함수(가로 스크롤)
  const fetchMainData = async () => {
    try {
      const [popRes, newRes] = await Promise.all([
        fetch(`http://localhost:8080/api/contents/?type=웹툰&page=0&size=10`),
        fetch(`http://localhost:8080/api/contents/?type=웹툰&page=0&size=10`), // 필요시 정렬 파라미터 추가
      ]);

      if (popRes.ok) {
        const popData = await popRes.json();
        setPopularContents(popData.content);
      }
      if (newRes.ok) {
        const newData = await newRes.json();
        setNewContents(newData.content);
      }
    } catch (error) {
      console.error("메인 데이터 로딩 실패:", error);
    }
  };

  // 요일별 작품 가져오는 함수(무한 스크롤)
  const fetchDailyData = async (pageNum, day) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/contents/?type=웹툰&page=${pageNum}&size=10&serialDay=${day}`,
      );
      if (response.ok) {
        const data = await response.json();
        setDailyContents((prev) =>
          pageNum === 0 ? data.content : [...prev, ...data.content],
        );
        setHasNext(!data.last);
      }
    } catch (error) {
      console.error("요일별 웹툰 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeDay === "전체") {
      fetchMainData();
    } else {
      setDailyContents([]);
      setPage(0);
      setHasNext(true);
      fetchDailyData(0, activeDay);
    }
  }, [activeDay]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        hasNext &&
        !isLoading &&
        activeDay !== "전체"
      ) {
        setPage((prev) => {
          const nextPage = prev + 1;
          fetchDailyData(nextPage, activeDay);
          return nextPage;
        });
      }
    },
    [hasNext, isLoading, activeDay],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver, activeDay]);

  return (
    <div
      style={{
        background: "transparent",
        minHeight: "calc(100vh - 60px)",
        position: "relative",
      }}
    >
      {/* 파도 배경 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${wave})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.08,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "transparent",
          padding: "32px 40px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: c.text,
            marginBottom: 4,
          }}
        >
          WEBTOON
        </div>
        <div style={{ fontSize: 14, color: c.textSub }}>
          매일 새로운 이야기를 만나보세요
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: c.bgWhite,
            border: `1px solid ${c.border}`,
            borderRadius: theme.radius.md,
            padding: "10px 16px",
            marginBottom: 20,
          }}
        >
          <span style={{ color: c.textMuted }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="작품명, 작가명 검색"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: c.text,
              fontSize: 14,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              style={{
                padding: "6px 16px",
                borderRadius: theme.radius.full,
                fontSize: 13,
                cursor: "pointer",
                background: activeDay === d ? c.primary : c.bgWhite,
                color: activeDay === d ? "#fff" : c.textSub,
                border: `1px solid ${activeDay === d ? c.primary : c.border}`,
                fontWeight: activeDay === d ? 500 : 400,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {activeDay === "전체" ? (
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: c.text,
                marginBottom: 14,
              }}
            >
              인기 웹툰
            </div>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={4}
              navigation
              style={{ marginBottom: 36 }}
            >
              {popularContents.map((item) => (
                <SwiperSlide key={item.contentId}>
                  <div
                    onClick={() => navigate(`/contents/${item.contentId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      style={{
                        width: "100%",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                        borderRadius: theme.radius.md,
                        border: `1px solid ${c.border}`,
                        marginBottom: 10,
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: c.text,
                        marginBottom: 2,
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: c.textMuted }}>
                      {item.genre}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: c.text,
                marginBottom: 14,
              }}
            >
              신작 웹툰
            </div>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={4}
              navigation
              style={{ marginBottom: 36 }}
            >
              {newContents.map((item) => (
                <SwiperSlide key={item.contentId}>
                  <div
                    onClick={() => navigate(`/contents/${item.contentId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      style={{
                        width: "100%",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                        borderRadius: theme.radius.md,
                        border: `1px solid ${c.border}`,
                        marginBottom: 10,
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: c.text,
                        marginBottom: 2,
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: c.textMuted }}>
                      {item.genre}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: c.text,
                marginBottom: 14,
              }}
            >
              {activeDay}요 웹툰
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 20,
              }}
            >
              {dailyContents.map((item) => (
                <div
                  key={item.contentId}
                  onClick={() => navigate(`/contents/${item.contentId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    style={{
                      width: "100%",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                      borderRadius: theme.radius.md,
                      border: `1px solid ${c.border}`,
                      marginBottom: 10,
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: c.text,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted }}>
                    {item.genre}
                  </div>
                </div>
              ))}
            </div>

            <div
              ref={observerRef}
              style={{
                height: 50,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              {isLoading && (
                <span style={{ color: c.textMuted }}>
                  데이터를 불러오는 중입니다...
                </span>
              )}
              {!hasNext && !isLoading && dailyContents.length > 0 && (
                <span style={{ color: c.textMuted }}>
                  모든 작품을 다 보셨습니다.
                </span>
              )}
            </div>
          </div>
        )}
        {/* <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>인기 웹툰</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 36 }}>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20} 
            slidesPerView={4}
            navigation
          >
          
          {contents.map(item => (
            <SwiperSlide key = {item.contentId}>
            <div key={item.id} onClick={() => navigate(`/contents/${item.contentId}`)} style={{ cursor: "pointer" }}>
              <img src={item.thumbnailUrl} alt={item.title} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10, display: "block" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{item.authorName || "작가명"}</div>
              <div style={{ display: "flex", gap: 4 }}>
                {item.free && <span style={{ fontSize: 11, padding: "2px 7px", background: c.bgSurface, color: c.free, borderRadius: theme.radius.sm, fontWeight: 500 }}>무료</span>}
                <span style={{ fontSize: 11, padding: "2px 7px", background: c.bgSurface, color: c.textSub, borderRadius: theme.radius.sm }}>{item.genre}</span>
              </div>
            </div>
            </SwiperSlide>
          ))}
          </Swiper>
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 14 }}>신작</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {mockItems.slice(4, 8).map(item => (
            <div key={item.id} onClick={() => navigate("/contents/1")} style={{ cursor: "pointer" }}>
              <img src={item.img} alt={item.title} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10, display: "block" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{item.author}</div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}

import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import styles from "../styles/AdminUploadPage.module.css"

const days = ["월", "화", "수", "목", "금", "토", "일", "완결"]

const swiperNavStyle = `
  .swiper-button-prev, .swiper-button-next { display: none !important; }
  .swiper { overflow: hidden !important; }
`

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
  )
}

const dummyContents = Array.from({ length: 12 }, (_, i) => ({
  contentId: i + 1,
  title: `작품 제목 ${i + 1}`,
  genre: i % 2 === 0 ? "액션" : "로맨스",
  thumbnailUrl: null,
  type: i % 2 === 0 ? "웹툰" : "웹소설",
}))

export default function AdminUploadPage() {
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState("월")
  const [query, setQuery] = useState("")
  const popularSwiperRef = useRef(null)
  const newSwiperRef = useRef(null)

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const CardItem = ({ item }) => (
    <div
      className={styles.cardItem}
      onClick={() => navigate(`/admin/uploads/${item.contentId}`)}
    >
      {item.thumbnailUrl
        ? <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder} />
      }
      <div className={styles.cardTitle}>{item.title}</div>
      <div className={styles.cardGenre}>{item.genre}</div>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <style>{swiperNavStyle}</style>

      <div className={styles.header}>
  <div className={styles.headerTitle}>작품 관리</div>
  <div className={styles.headerSubtitle}>회차 공개/비공개를 관리하세요</div>
  <div className={styles.headerInner}>
    <div className={styles.searchBox}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleSearch}
        placeholder="작품명, 작가명 검색"
        className={styles.searchInput}
      />
      {query && (
        <span onClick={() => setQuery("")} style={{ color: "#90A4C8", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>✕</span>
      )}
    </div>
  </div>
</div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`${styles.tabBtn} ${activeDay === d ? styles.tabBtnActive : ""}`}
            >{d}</button>
          ))}
        </div>

        <div className={styles.sectionTitle}>인기 작품</div>
        <div className={styles.swiperWrap}>
          <Swiper modules={[Navigation]} spaceBetween={16} slidesPerView={6} onSwiper={(s) => (popularSwiperRef.current = s)} style={{ width: "100%", maxWidth: "100%" }}>
            {dummyContents.map((item) => (
              <SwiperSlide key={item.contentId}>
                <CardItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
          <NavBtn direction="prev" swiperRef={popularSwiperRef} />
          <NavBtn direction="next" swiperRef={popularSwiperRef} />
        </div>

        <div className={styles.sectionTitle}>신작</div>
        <div className={styles.swiperWrap}>
          <Swiper modules={[Navigation]} spaceBetween={16} slidesPerView={6} onSwiper={(s) => (newSwiperRef.current = s)} style={{ width: "100%", maxWidth: "100%" }}>
            {dummyContents.map((item) => (
              <SwiperSlide key={item.contentId}>
                <CardItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
          <NavBtn direction="prev" swiperRef={newSwiperRef} />
          <NavBtn direction="next" swiperRef={newSwiperRef} />
        </div>

        <div className={styles.sectionTitle}>{activeDay}요 작품</div>
        <div className={styles.dailyGrid}>
          {dummyContents.map((item) => (
            <CardItem key={item.contentId} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
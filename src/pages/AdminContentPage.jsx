import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import styles from "../styles/AdminContentPage.module.css"

const contentTypes = ["웹툰", "웹소설"]
const days = ["전체", "월", "화", "수", "목", "금", "토", "일", "완결"];

export default function AdminContentPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState("웹툰")
  const [query, setQuery] = useState("")
  const [activeDay, setActiveDay] = useState("전체");
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)

  // 🌟 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 백엔드 API로부터 타입과 검색어를 기반으로 작품 목록 조회
  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/contents", {
        params: { 
          type: activeType,
          keyword: query,
          day: activeDay === "전체" ? null : activeDay, // 전체일 경우 null로 전송
          page: currentPage - 1, // 🌟 스프링(Spring)은 0페이지부터 시작하므로 -1 처리
          size: 18 // 한 페이지당 10개
        }
      });
      
      // 🌟 백엔드가 Page 객체로 주므로 .content를 꺼내서 세팅
      setContents(response.data.content || []);
      // 🌟 전체 페이지 수 세팅
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("작품 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [activeType, query, activeDay, currentPage]); // currentPage 의존성 추가

  // 탭, 검색어, 페이지가 바뀔 때 데이터 다시 불러오기
  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // 🌟 카테고리나 요일을 바꾸면 무조건 1페이지로 돌아가도록 처리
  const handleTypeChange = (type) => {
    setActiveType(type);
    setCurrentPage(1);
  };

  const handleDayChange = (day) => {
    setActiveDay(day);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1); // 검색 시에도 1페이지부터 보기
      loadContents(); 
    }
  }

  const CardItem = ({ item }) => (
    <div
      className={styles.cardItem}
      onClick={() => navigate(`/admin/content/${item.contentId}`)}
    >
      {item.thumbnailUrl
        ? <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder} />
      }
      <div className={styles.cardTitle}>{item.title}</div>
      <div className={styles.cardGenre}>{item.genre}</div>
      <div className={styles.cardStatus} style={{fontSize: '12px', color: '#666'}}>
        작가: {item.authorNickname}
      </div>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        {/* 뒤로 가기 버튼 추가 (필요시) */}
        <button 
          className={styles.backBtn} 
          onClick={() => navigate("/admin")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          관리자 페이지로
        </button>

        <div className={styles.headerTitle}>작품 관리</div>
        <div className={styles.headerSubtitle}>실제 연재 중인 작품 리스트입니다.</div>
        <div className={styles.headerInner}>
          <div className={styles.searchBox}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="작품명 또는 작가명 검색 후 엔터"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`${styles.tabBtn} ${activeType === type ? styles.tabBtnActive : ""}`}
            >{type}</button>
          ))}
        </div>
        <div className={styles.dayTabGroup} style={{ marginBottom: "20px" }}>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDayChange(day)}
            className={`${styles.dayTabBtn} ${activeDay === day ? styles.dayTabBtnActive : ""}`}
          >
            {day}
          </button>
        ))}
      </div>

        <div className={styles.sectionTitle}>{activeType} 목록</div>
        
        {loading ? (
          <div className={styles.loadingWrap}>로딩 중...</div>
        ) : contents.length === 0 ? (
          <div className={styles.noMore}>검색 결과가 없거나 등록된 작품이 없습니다.</div>
        ) : (
          <>
            <div className={styles.dailyGrid}>
              {contents.map((item) => (
                <CardItem key={item.contentId} item={item} />
              ))}
            </div>

            {/* 🌟 페이지네이션 UI 추가 */}
            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

//  변경 1: 동네 퀵서비스(axios) 해고! 우리 전용 요원(api)을 고용합니다.
// (경로는 팀장님이 만드신 파일 위치에 맞게 ../api/axios 가 맞는지 확인해 주세요)
import api from "../api/axios" 

import { getMyLikedContents } from "../api/mypageApi"
import styles from "../styles/LikedContentPage.module.css"

export default function LikedContentPage() {
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ALL")

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const data = await getMyLikedContents(0);
        setItems(data.content || []); 
      } catch (error) {
        console.error("찜 목록 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikes();
  }, [])

  const handleUnlike = async (e, contentId) => {
    e.stopPropagation(); 
    
    if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return;

    try {
      //  변경 2: 지갑에서 토큰 꺼내던 코드 (localStorage.getItem...) 삭제!
      // 요원이 출발하기 전에 알아서 꺼내서 챙겨갑니다.

      //  변경 3: 주소창 앞부분 생략! 헤더(headers) 셋팅 싹 다 삭제!
      // api 요원이 baseURL과 토큰 셋팅을 전부 대신 해줍니다.
      const response = await api.post(`/api/likes/${contentId}`);

      if (response.status === 200 || response.status === 201) {
        setItems(prevItems => prevItems.filter(item => item.contentId !== contentId));
      }
    } catch (error) {
      console.error("찜 취소 에러:", error);
      alert("찜 취소에 실패했습니다.");
    }
  }

  const filteredItems = items.filter(item => {
    if (activeTab === "ALL") return true;
    const type = (item.type || "").trim().toUpperCase();
    if (activeTab === "WEBTOON") return type === "WEBTOON" || type === "웹툰";
    if (activeTab === "NOVEL") return type === "NOVEL" || type === "웹소설";
    return true;
  });

  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>데이터를 불러오는 중입니다...</div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>찜한 작품</div>
        <div className={styles.headerSubtitle}>총 {filteredItems.length}개</div>
      </div>
      
      <div className={styles.content}>
        
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'ALL' ? styles.activeTab : ''}`} onClick={() => setActiveTab('ALL')}>전체</button>
          <button className={`${styles.tab} ${activeTab === 'WEBTOON' ? styles.activeTab : ''}`} onClick={() => setActiveTab('WEBTOON')}>웹툰</button>
          <button className={`${styles.tab} ${activeTab === 'NOVEL' ? styles.activeTab : ''}`} onClick={() => setActiveTab('NOVEL')}>웹소설</button>
        </div>

        {filteredItems.length === 0 ? (
          <div className={styles.emptyMsg}>해당하는 찜한 작품이 없습니다.</div>
        ) : (
          <div className={styles.grid}>
            {filteredItems.map(item => {
              
              const statusMap = {
                "DRAFT": "연재 대기", 
                "APPROVED": "연재 중",
                "REJECTED": "승인 거절",
                "COMPLETED": "완결" 
              };

              const typeMap = {
                "WEBTOON": "웹툰",
                "NOVEL": "웹소설",
                "웹툰": "웹툰",     
                "웹소설": "웹소설" 
              };

              return (
                <div 
                  key={item.contentId} 
                  className={styles.card} 
                  onClick={() => navigate(`/contents/${item.contentId}`)}
                >
                  <div 
                    className={styles.thumbnail}
                    style={{
                      backgroundImage: item.thumbnailUrl ? `url(${item.thumbnailUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <button className={styles.heartBtn} onClick={(e) => handleUnlike(e, item.contentId)} title="찜 취소">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#E53935" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className={styles.cardTitle}>{item.title}</div>
                  <div className={styles.cardAuthor}>{item.author}</div>
                  <div className={styles.badges}>
                    <span className={styles.badge}>{typeMap[item.type] || item.type}</span>
                    <span className={styles.badge}>{statusMap[item.status] || item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
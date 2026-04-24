import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios"; // 🌟 우리가 만든 만능 요원 투입!
import styles from "../styles/RecentContentPage.module.css";

export default function RecentContentPage() {
  const navigate = useNavigate();
  
  // 🌟 상태 1: 진짜 데이터를 담을 바구니
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🌟 상태 2: 현재 선택된 탭 (기본값: 전체)
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, WEBTOON, WEB_NOVEL

  // 🌟 백엔드에서 데이터를 썰어서(Slice) 가져오는 함수
  const fetchRecentViews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/recent-views?page=0");
      console.log("🚨 백엔드에서 온 데이터:", response.data);
      
      setItems(response.data.content || []); 
    } catch (error) {
      console.error("최근 본 작품 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentViews();
  }, []);

  // 🌟 탭 필터링 로직: 선택된 탭에 맞춰서 보여줄 아이템만 걸러냅니다.
  const filteredItems = items.filter((item) => {
    if (activeTab === "ALL") return true;
    
    // 백엔드에서 온 타입 글자를 무조건 대문자로 바꾸고 공백을 없앱니다. (방어 로직)
    const type = item.contentType ? item.contentType.toUpperCase().trim() : "";

    if (activeTab === "WEBTOON") {
      // DB 값이 WEBTOON, 웹툰 둘 중 하나면 통과!
      return type === "WEBTOON" || type === "웹툰";
    }
    
    if (activeTab === "WEB_NOVEL") {
      // DB 값이 WEB_NOVEL, WEBNOVEL, NOVEL, 웹소설 중 하나면 통과!
      return type === "WEB_NOVEL" || type === "WEBNOVEL" || type === "NOVEL" || type === "웹소설";
    }
    
    return false;
  });

  // 🌟 시간 변환기: 백엔드 시간(2026-04-24T...)을 "2시간 전" 처럼 예쁘게 변환
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ padding: "50px", textAlign: "center", color: "#90A4C8" }}>
          최근 본 작품을 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>최근 본 작품</div>
        <div className={styles.headerSubtitle}>이어서 읽어보세요</div>
      </div>

      {/* 🌟 수정: justifyContent: 'center' 추가로 완벽한 중앙 정렬! */}
      <div className={styles.tabMenu} style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '0 0 10px 0', marginBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
        <button 
          onClick={() => setActiveTab("ALL")}
          style={{ padding: '0 4px 10px 4px', marginBottom: '-11px', border: 'none', background: 'none', fontSize: '16px', fontWeight: activeTab === "ALL" ? 'bold' : 'normal', color: activeTab === "ALL" ? '#2196F3' : '#90A4C8', borderBottom: activeTab === "ALL" ? '2px solid #2196F3' : '2px solid transparent', cursor: 'pointer' }}
        >
          전체
        </button>
        <button 
          onClick={() => setActiveTab("WEBTOON")}
          style={{ padding: '0 4px 10px 4px', marginBottom: '-11px', border: 'none', background: 'none', fontSize: '16px', fontWeight: activeTab === "WEBTOON" ? 'bold' : 'normal', color: activeTab === "WEBTOON" ? '#2196F3' : '#90A4C8', borderBottom: activeTab === "WEBTOON" ? '2px solid #2196F3' : '2px solid transparent', cursor: 'pointer' }}
        >
          웹툰
        </button>
        <button 
          onClick={() => setActiveTab("WEB_NOVEL")}
          style={{ padding: '0 4px 10px 4px', marginBottom: '-11px', border: 'none', background: 'none', fontSize: '16px', fontWeight: activeTab === "WEB_NOVEL" ? 'bold' : 'normal', color: activeTab === "WEB_NOVEL" ? '#2196F3' : '#90A4C8', borderBottom: activeTab === "WEB_NOVEL" ? '2px solid #2196F3' : '2px solid transparent', cursor: 'pointer' }}
        >
          웹소설
        </button>
      </div>
      
      <div className={styles.content}>
        {/* items 대신 filteredItems 로 렌더링! */}
        {filteredItems.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#90A4C8", fontSize: "14px" }}>
            해당하는 작품이 없습니다.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className={styles.card} onClick={() => navigate(`/contents/${item.id}`)}>
              
              <div 
                className={styles.thumbnail} 
                style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              />
              
              <div className={styles.info}>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.meta}>
                  {item.author} · 마지막: {item.lastEpisode} · {timeAgo(item.date)}
                </div>
                
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${item.progress}%` }} />
                </div>
                <div className={styles.progressLabel}>진행률 {item.progress}%</div>
              </div>

              <button 
                className={styles.continueBtn}
                onClick={(e) => {
                  e.stopPropagation(); 
                  if (item.lastEpisodeId) {
                    // 🌟 핵심 수정: 작품 타입에 따라 갈 길(webtoon vs novel)을 알아서 판단합니다!
                    const viewerType = item.contentType === "WEB_NOVEL" ? "novel" : "webtoon";
                    navigate(`/${viewerType}/viewer/${item.lastEpisodeId}?contentId=${item.id}&progress=${item.progress}`);
                  } else {
                    navigate(`/contents/${item.id}`); 
                  }
                }}
              >
                이어보기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
// 🌟 아까 만든 API 호출 함수를 불러옵니다. (경로는 프로젝트에 맞게 확인해주세요)
import { getMyLikedContents, unlikeContent } from "../api/mypageApi"
import styles from "../styles/LikedContentPage.module.css"

export default function LikedContentPage() {
  const navigate = useNavigate()

  // 🌟 1. 팀원이 만든 가짜 데이터 삭제하고, 진짜 데이터를 담을 바구니(State) 준비
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 🌟 2. 화면이 켜지자마자 백엔드에 찜 목록 달라고 요청 (최초 1회)
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const data = await getMyLikedContents(0);
        // 백엔드 컨트롤러가 Slice 객체로 주기 때문에, 실제 배열인 data.content를 빼서 넣습니다.
        setItems(data.content || []); 
      } catch (error) {
        console.error("찜 목록 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikes();
  }, [])

  // 🌟 3. 찜 취소 (하트 클릭 시) 로직
  const handleUnlike = async (e, contentId) => {
    e.stopPropagation(); // 중요: 하트 눌렀을 때 상세페이지로 넘어가는 것을 막음!
    
    if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return;

    try {
      await unlikeContent(contentId); // 백엔드에 지워달라고 요청
      // 백엔드 요청 성공하면, 화면에서도 새로고침 없이 즉시 스르륵 날려버림
      setItems(prevItems => prevItems.filter(item => item.contentId !== contentId));
    } catch (error) {
      alert("찜 취소에 실패했습니다.");
    }
  }

  // 로딩 중일 때 뼈대 깨짐 방지
  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>데이터를 불러오는 중입니다...</div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>찜한 작품</div>
        <div className={styles.headerSubtitle}>총 {items.length}개</div>
      </div>
      
      <div className={styles.content}>
        {/* 🌟 4. 데이터가 없을 때의 예외 처리 */}
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            찜한 작품이 없습니다.
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => {
              
              // 🌟 대기업 클린 코드: 백엔드의 날것 데이터를 한글로 예쁘게 번역하는 딕셔너리
              const statusMap = {
                "DRAFT": "연재 대기", 
                "APPROVED": "연재 중",
                "REJECTED": "승인 거절",
                "COMPLETED": "완결" // (나중에 추가될 경우를 대비)
              };

              const typeMap = {
                "WEBTOON": "웹툰",
                "NOVEL": "웹소설",
                "웹툰": "웹툰",     // DB에 이미 한글로 들어있을 경우 방어
                "웹소설": "웹소설" // DB에 이미 한글로 들어있을 경우 방어
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
                    <div className={styles.heartIcon} onClick={(e) => handleUnlike(e, item.contentId)}>
                      ♥
                    </div>
                  </div>
                  
                  <div className={styles.cardTitle}>{item.title}</div>
                  <div className={styles.cardAuthor}>{item.author}</div>
                  <div className={styles.badges}>
                    {/* 🌟 번역기를 통과시킨 한글을 화면에 렌더링! */}
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
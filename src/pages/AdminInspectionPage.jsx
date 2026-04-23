import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/AdminInspectionPage.module.css";

export default function AdminInspectionPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [items, setItems] = useState([]); // 🌟 실제 DB 데이터를 담을 공간

  // ==========================================
  // [연동 1] 백엔드에서 실제 검수 대기 목록 불러오기
  // ==========================================
  const loadInspectionList = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/inspections");
      
      // 🌟 [추가] 백엔드가 정확히 어떤 모양으로 데이터를 주는지 콘솔에서 확인합니다.
      console.log("=== 목록 응답 데이터 ===", response.data);

      // 🌟 [강력한 방어 코드] 어떤 껍데기로 오든 배열(Array)만 정확히 찾아냅니다.
      let dataList = [];
      if (Array.isArray(response.data)) {
        dataList = response.data; // 껍데기 없이 순수 리스트만 왔을 때
      } else if (response.data && Array.isArray(response.data.content)) {
        dataList = response.data.content; // Spring Boot의 Page<> 객체로 왔을 때
      } else if (response.data && Array.isArray(response.data.data)) {
        dataList = response.data.data; // 커스텀 API Response 객체로 왔을 때
      }

      setItems(dataList); // 안전하게 추출된 배열만 상태에 저장!
    } catch (error) {
      console.error("목록을 불러오는데 실패했습니다.", error);
    }
  };

  useEffect(() => {
    loadInspectionList();
  }, []);

  const filteredItems = items.filter(item => {
    // 1. "전체" 탭이면 모두 통과
    if (filter === "전체") return true;

    // 🌟 2. DB에 한글("웹소설", "웹툰")로 저장되어 있으므로, 한글 글자 그대로 비교합니다!
    const type = item.content?.type; 

    if (filter === "웹소설" && type === "웹소설") return true;
    if (filter === "웹툰" && type === "웹툰") return true; 

    return false;
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>검수 관리</div>
        <div className={styles.headerSubtitle}>등록된 작품을 검토하고 승인/반려하세요</div>
      </div>
      
      <div className={styles.content}>
        {/* 필터 탭 (임시 UI - 실제 필터링 로직은 추후 추가 가능) */}
        <div className={styles.filterGroup}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 🌟 실제 데이터 렌더링 영역 */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            현재 대기 중인 검수 요청이 없습니다.
          </div>
        ) : (
          /* 🌟 기존에 items.map 을 filteredItems.map 으로 변경! */
          filteredItems.map(item => {
            const contentInfo = item.content || {};

            return (
              <div 
                key={item.episodeId} 
                className={styles.itemCard}
                // 🌟 [핵심] 목적지를 App.js에 등록한 "detail/" 이 포함된 주소로 완벽히 수정!
                onClick={() => navigate(`/admin/inspection/detail/${item.episodeId}`)}
              >
                <div className={styles.itemLeft}>
                  {/* 썸네일 표시 */}
                  {contentInfo.thumbnailUrl ? (
                     <img src={contentInfo.thumbnailUrl} className={styles.thumbnail} alt="썸네일" style={{ objectFit: "cover" }}/>
                  ) : (
                     <div className={styles.thumbnail} style={{display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999"}}>No IMG</div>
                  )}
                  
                  <div>
                    {/* 백엔드 DTO 규격에 맞춰 제목과 정보 출력 */}
                    <div className={styles.itemTitle}>{contentInfo.title || item.episodeTitle || "제목 없음"}</div>
                      <div className={styles.itemMeta}>
                      작가: {contentInfo.author?.nickname || contentInfo.author?.id || "미상"} · {contentInfo.type === "웹소설" || contentInfo.type === "NOVEL" ? "웹소설" : "웹툰"} · {item.episodeNumber}화
                      </div>
                  </div>
                </div>
                
                {/* 🌟 밖에서 대충 승인하지 못하게 버튼들을 지우고 화살표 아이콘이나 안내 문구로 대체 */}
                <div className={styles.actionGroup}>
                  <span style={{ fontSize: "13px", color: "#2196F3", fontWeight: "600" }}>
                    상세 검토하기 ➔
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
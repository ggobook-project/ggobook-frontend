import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios"; // 🌟 팀원의 api 요원 적용
import styles from "../styles/AdminInspectionPage.module.css";

export default function AdminInspectionPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [items, setItems] = useState([]);

  const loadInspectionList = async () => {
    try {
      // 🌟 api.get 사용 (baseURL과 토큰 헤더 자동 적용)
      const response = await api.get("/api/admin/inspections");
      
      let dataList = [];
      if (Array.isArray(response.data)) {
        dataList = response.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        dataList = response.data.content;
      } else if (response.data && Array.isArray(response.data.data)) {
        dataList = response.data.data;
      }

      setItems(dataList);
    } catch (error) {
      console.error("목록을 불러오는데 실패했습니다.", error);
    }
  };

  useEffect(() => {
    loadInspectionList();
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === "전체") return true;
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

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            현재 대기 중인 검수 요청이 없습니다.
          </div>
        ) : (
          filteredItems.map(item => {
            const contentInfo = item.content || {};
            return (
              <div 
                key={item.episodeId} 
                className={styles.itemCard}
                onClick={() => navigate(`/admin/inspection/detail/${item.episodeId}`)}
              >
                <div className={styles.itemLeft}>
                  {contentInfo.thumbnailUrl ? (
                     <img src={contentInfo.thumbnailUrl} className={styles.thumbnail} alt="썸네일" style={{ objectFit: "cover" }}/>
                  ) : (
                     <div className={styles.thumbnail} style={{display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999"}}>No IMG</div>
                  )}
                  <div>
                    <div className={styles.itemTitle}>{contentInfo.title || item.episodeTitle || "제목 없음"}</div>
                    <div className={styles.itemMeta}>
                      작가: {contentInfo.author?.nickname || contentInfo.author?.id || "미상"} · {contentInfo.type === "웹소설" || contentInfo.type === "NOVEL" ? "웹소설" : "웹툰"} · {item.episodeNumber}화
                    </div>
                  </div>
                </div>
                <div className={styles.actionGroup}>
                  <span style={{ fontSize: "13px", color: "#2196F3", fontWeight: "600" }}>상세 검토하기 ➔</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
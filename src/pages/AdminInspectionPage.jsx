import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios"; 
import styles from "../styles/AdminInspectionPage.module.css";

const ITEMS_PER_PAGE = 10;

export default function AdminInspectionPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [items, setItems] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadInspectionList = async () => {
      try {
        const response = await api.get("/api/admin/inspections");

        let dataList = [];
        if (Array.isArray(response.data)) {
          dataList = response.data;
        } else if (response.data && Array.isArray(response.data.content)) {
          dataList = response.data.content;
        } else if (response.data && Array.isArray(response.data.data)) {
          dataList = response.data.data;
        }

        dataList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.createdDate || 0).getTime();
          const dateB = new Date(b.createdAt || b.createdDate || 0).getTime();
          return dateA - dateB; 
        });

        setItems(dataList);
      } catch (error) {
        console.error("목록을 불러오는데 실패했습니다.", error);
      }
    };
    loadInspectionList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filteredItems = items.filter((item) => {
    if (filter === "전체") return true;
    const type = item.content?.type;
    if (filter === "웹소설" && (type === "웹소설" || type === "NOVEL")) return true;
    if (filter === "웹툰" && (type === "웹툰" || type === "WEBTOON")) return true;
    return false;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        {/* 🌟 추가됨: 관리자 메인으로 돌아가는 뒤로가기 버튼 */}
        <button 
          className={styles.backBtn} 
          onClick={() => navigate("/admin")} // 관리자 메인 경로. (필요시 navigate(-1)로 변경 가능)
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          관리자 페이지로
        </button>

        <div className={styles.headerTitle}>검수 관리</div>
        <div className={styles.headerSubtitle}>
          등록된 작품을 검토하고 승인/반려하세요
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterGroup}>
          {["전체", "웹툰", "웹소설"].map((f) => (
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
          <>
            {paginatedItems.map((item) => {
              const contentInfo = item.content || {};
              const requestDate = item.createdAt 
                ? new Date(item.createdAt).toLocaleDateString() 
                : "날짜 미상";

              return (
                <div
                  key={item.episodeId}
                  className={styles.itemCard}
                  onClick={() => navigate(`/admin/inspection/detail/${item.episodeId}`)}
                >
                  <div className={styles.itemLeft}>
                    {contentInfo.thumbnailUrl ? (
                      <img
                        src={contentInfo.thumbnailUrl}
                        className={styles.thumbnail}
                        alt="썸네일"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className={styles.thumbnail}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#999",
                        }}
                      >
                        No IMG
                      </div>
                    )}
                    <div>
                      <div className={styles.itemTitle}>
                        {contentInfo.title || item.episodeTitle || "제목 없음"}
                      </div>
                      <div className={styles.itemMeta}>
                        작가:{" "}
                        {contentInfo.author?.nickname || contentInfo.author?.id || "미상"}
                        {" "}·{" "}
                        <span className={contentInfo.type === "웹소설" || contentInfo.type === "NOVEL" ? styles.badgeNovel : styles.badgeWebtoon}>
                            {contentInfo.type === "웹소설" || contentInfo.type === "NOVEL" ? "웹소설" : "웹툰"}
                        </span>
                        {" "}· {item.episodeNumber}화
                        
                        <span className={styles.dateText}>
                          [{requestDate}]
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionGroup}>
                    <span style={{ fontSize: "13px", color: "#2196F3", fontWeight: "600" }}>
                      상세 검토하기 ➔
                    </span>
                  </div>
                </div>
              );
            })}

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
  );
}
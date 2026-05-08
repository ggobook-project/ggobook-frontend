import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/AdminInspectionPage.module.css";

const PAGE_SIZE = 10;

export default function AdminInspectionPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/admin/inspections?page=${currentPage}&size=${PAGE_SIZE}`);
        const data = res.data;
        if (data && Array.isArray(data.content)) {
          setItems(data.content);
          setTotalPages(data.totalPages ?? 1);
        } else if (Array.isArray(data)) {
          setItems(data);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("목록을 불러오는데 실패했습니다.", error);
      }
    };
    load();
  }, [currentPage]);

  const handleFilterChange = (f) => {
    setFilter(f);
    setCurrentPage(0);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "전체") return true;
    const type = item.content?.type;
    if (filter === "웹소설" && (type === "웹소설" || type === "NOVEL")) return true;
    if (filter === "웹툰" && (type === "웹툰" || type === "WEBTOON")) return true;
    return false;
  });

  const getPageNumbers = () => {
    const delta = 2;
    const start = Math.max(0, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const paginatedItems = filteredItems;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
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
              onClick={() => handleFilterChange(f)}
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
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  disabled={currentPage === 0}
                >
                  이전
                </button>

                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={currentPage === totalPages - 1}
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
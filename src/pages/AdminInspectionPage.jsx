import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/AdminInspectionPage.module.css";

const PAGE_SIZE = 10;

export default function AdminInspectionPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 작품·회차 둘 다 한 번에 fetch → 클라이언트 페이징
  useEffect(() => {
    const load = async () => {
      try {
        const [contentRes, episodeRes] = await Promise.all([
          api.get("/api/admin/inspections/contents/pending"),
          api.get("/api/admin/inspections/episodes/pending")
        ]);

        const contents = (contentRes.data || []).map(c => ({
          ...c, inspectionType: "CONTENT", id: c.contentId, author: c.authorNickname
        }));

        const episodes = (episodeRes.data || []).map(e => ({
          ...e, inspectionType: "EPISODE", id: e.episodeId, author: e.authorNickname, type: e.contentType
        }));

        const mergedList = [...contents, ...episodes];
        mergedList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setItems(mergedList);
      } catch (error) {
        console.error("목록을 불러오는데 실패했습니다.", error);
      }
    };
    load();
  }, []);

  const handleFilterChange = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "전체") return true;
    const type = item.type;
    if (filter === "웹소설" && (type === "웹소설" || type === "NOVEL")) return true;
    if (filter === "웹툰" && (type === "웹툰" || type === "WEBTOON")) return true;
    return false;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const getPageNumbers = () => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>검수 관리</div>
        <div className={styles.headerSubtitle}>등록된 작품/회차를 검토하고 승인/반려하세요</div>
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
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>현재 대기 중인 검수 요청이 없습니다.</div>
        ) : (
          <>
            {paginatedItems.map((item) => {
              const isContent = item.inspectionType === "CONTENT";
              const requestDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "날짜 미상";

              return (
                <div
                  key={`${item.inspectionType}-${item.id}`}
                  className={styles.itemCard}
                  onClick={() => navigate(`/admin/inspection/detail/${item.inspectionType}/${item.id}`)}
                >
                  <div className={styles.itemLeft}>
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} className={styles.thumbnail} alt="썸네일" style={{ objectFit: "cover" }} />
                    ) : (
                      <div className={styles.thumbnail} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999" }}>No IMG</div>
                    )}
                    <div>
                      <div className={styles.itemTitle}>
                        <span style={{ color: isContent ? "#E65100" : "#2196F3", fontWeight: "bold", marginRight: "5px" }}>
                          {isContent ? "[신규 작품]" : "[새 회차]"}
                        </span>
                        {item.title || "제목 없음"}
                      </div>
                      <div className={styles.itemMeta}>
                        작가: {item.author || "미상"} ·{" "}
                        <span className={item.type === "웹소설" || item.type === "NOVEL" ? styles.badgeNovel : styles.badgeWebtoon}>
                          {item.type === "웹소설" || item.type === "NOVEL" ? "웹소설" : "웹툰"}
                        </span>
                        {!isContent && ` · ${item.episodeNumber}화`}
                        <span className={styles.dateText}> [{requestDate}]</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionGroup}>
                    <span style={{ fontSize: "13px", color: "#2196F3", fontWeight: "600" }}>상세 검토하기 ➔</span>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </button>

                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

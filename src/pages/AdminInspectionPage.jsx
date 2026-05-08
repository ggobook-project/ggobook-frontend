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
        // 🌟 두 개의 분리된 API를 동시에 호출하여 기존 DTO를 받아옵니다.
        const [contentRes, episodeRes] = await Promise.all([
          api.get("/api/admin/inspections/contents/pending"),
          api.get("/api/admin/inspections/episodes/pending")
        ]);

        // 🌟 받아온 DTO에 프론트엔드 라우팅용 딱지(inspectionType)만 살짝 붙여서 합칩니다.
        const contents = (contentRes.data || []).map(c => ({
          ...c, inspectionType: "CONTENT", id: c.contentId, author: c.authorNickname
        }));
        
        const episodes = (episodeRes.data || []).map(e => ({
          ...e, inspectionType: "EPISODE", id: e.episodeId, author: e.authorNickname, type: e.contentType
        }));

        const mergedList = [...contents, ...episodes];
        
        // 날짜순 정렬
        mergedList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setItems(mergedList);
      } catch (error) {
        console.error("목록을 불러오는데 실패했습니다.", error);
      }
    };
    loadInspectionList();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [filter]);

  const filteredItems = items.filter((item) => {
    if (filter === "전체") return true;
    const type = item.type;
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
        <div className={styles.headerTitle}>검수 관리</div>
        <div className={styles.headerSubtitle}>등록된 작품/회차를 검토하고 승인/반려하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterGroup}>
          {["전체", "웹툰", "웹소설"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}>
              {f}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>현재 대기 중인 검수 요청이 없습니다.</div>
        ) : (
          <>
            {paginatedItems.map((item) => {
              const isContent = item.inspectionType === "CONTENT"; // 🌟 작품인지 회차인지 구분
              const requestDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "날짜 미상";

              return (
                <div
                  key={`${item.inspectionType}-${item.id}`}
                  className={styles.itemCard}
                  onClick={() => navigate(`/admin/inspection/detail/${item.inspectionType}/${item.id}`)} // 🌟 목적지로 스위칭 이동!
                >
                  <div className={styles.itemLeft}>
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} className={styles.thumbnail} alt="썸네일" style={{ objectFit: "cover" }} />
                    ) : (
                      <div className={styles.thumbnail} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999" }}>No IMG</div>
                    )}
                    <div>
                      <div className={styles.itemTitle}>
                        {/* 🌟 뱃지 달아주기 */}
                        <span style={{ color: isContent ? "#E65100" : "#2196F3", fontWeight: "bold", marginRight: "5px" }}>
                          {isContent ? "[신규 작품]" : "[새 회차]"}
                        </span>
                        {item.title || "제목 없음"}
                      </div>
                      <div className={styles.itemMeta}>
                        작가: {item.author || "미상"} · 
                        <span className={item.type === "웹소설" || item.type === "NOVEL" ? styles.badgeNovel : styles.badgeWebtoon}>
                          {item.type === "웹소설" || item.type === "NOVEL" ? "웹소설" : "웹툰"}
                        </span>
                        {/* 회차일 때만 몇 화인지 표시 */}
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
                <button className={styles.pageBtn} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>이전</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button key={pageNum} className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ""}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                ))}
                <button className={styles.pageBtn} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
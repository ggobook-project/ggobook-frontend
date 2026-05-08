import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/ContentManagePage.module.css";

// 🌟 핵심 수술 1: 백엔드 상태(Enum) 7가지 완벽 대응 사전
const STATUS_LABEL = {
  DRAFT: "임시 저장",
  PENDING: "검수 대기",
  APPROVED: "검수 완료",
  PUBLISHED: "공개 완료",
  REJECTED: "반려",
  BLINDED: "블라인드",
  PRIVATE: "비공개",
};

// 🌟 핵심 수술 2: 상태별 색상 테마 분류
const statusStyle = (status) => {
  if (status === "APPROVED" || status === "PUBLISHED") return styles.statusActive;
  if (status === "REJECTED" || status === "BLINDED") return styles.statusReject;
  return styles.statusReview; // 대기/임시저장/비공개 등은 회색(Review) 처리
};

export default function ContentManagePage() {
  const navigate = useNavigate();
  const [myContents, setMyContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyContents = async () => {
      try {
        const response = await api.get("/api/contents/my");
        const data = response.data;
        console.log("내 작품 목록:", data);
        setMyContents(Array.isArray(data) ? data : (data.content ?? []));
      } catch (error) {
        console.error("내 작품 불러오기 실패 : ", error);
      } finally {
        setLoading(false);
      }
    };
    loadMyContents();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 관리</div>
        <div className={styles.headerSubtitle}>내 작품을 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>
            내 작품{" "}
            <span className={styles.listCount}>{myContents.length}</span>
          </span>
          <button
            className={styles.registerBtn}
            onClick={() => navigate("/author/contents/register")}
          >
            작품 등록
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>
            불러오는 중...
          </div>
        ) : myContents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#90A4C8", fontSize: 14 }}>
            등록한 작품이 없습니다.<br />
            작품을 등록하면 관리자 검수 후 게시됩니다.
          </div>
        ) : (
          myContents.map((item, index) => (
            <div
              key={`content-${item.contentId}-${index}`}
              className={styles.itemCard}
              onClick={() => navigate(`/author/contents/${item.contentId}`)}
            >
              <div className={styles.itemLeft}>
                <div className={styles.thumbnail}>
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt="썸네일"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMeta}>
                    {item.type} · {item.genre}
                  </div>
                  {/* 🌟 번역 사전과 스타일 함수 적용 */}
                  <span className={`${styles.statusBadge} ${statusStyle(item.status)}`}>
                    {STATUS_LABEL[item.status] || item.status}
                  </span>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={styles.editBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/author/contents/${item.contentId}/edit`);
                  }}
                >
                  수정
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
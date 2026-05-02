import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/ContentManagePage.module.css";

const STATUS_LABEL = {
  PENDING: "검수중",
  APPROVED: "연재중",
  REJECTED: "반려됨",
  DRAFT: "임시저장",
  BLINDED: "블라인드",
};

const STATUS_STYLE = {
  PENDING: "statusReview",
  APPROVED: "statusActive",
  REJECTED: "statusReject",
  DRAFT: "statusReview",
  BLINDED: "statusReject",
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

  const statusLabel = (status) => {
    switch (status) {
      case "DRAFT":
        return "임시저장";
      case "PENDING":
        return "검수중";
      case "APPROVED":
        return "승인됨";
      case "PUBLISHED":
        return "게시중";
      case "REJECTED":
        return "반려됨";
      case "BLINDED":
        return "블라인드";
      default:
        return status;
    }
  };

  const statusStyle = (status) => {
    if (status === "PENDING") return styles.statusReview;
    if (status === "REJECTED" || status === "BLINDED")
      return styles.statusReject;
    return styles.statusActive;
  };

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
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "#90A4C8",
              fontSize: 14,
            }}
          >
            불러오는 중...
          </div>
        ) : myContents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "#90A4C8",
              fontSize: 14,
            }}
          >
            등록한 작품이 없습니다.
            <br />
            작품을 등록하면 관리자 검수 후 게시됩니다.
          </div>
        ) : (
          myContents.map((item, index) => (
            <div
              key={`content-${item.contentId}-${index}`}
              className={styles.itemCard}
              // ✅ 클릭 시 회차 목록 페이지로 이동
              onClick={() => navigate(`/author/contents/${item.contentId}`)}
            >
              <div className={styles.itemLeft}>
                <div className={styles.thumbnail}>
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt="썸네일"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMeta}>
                    {item.type} · {item.genre}
                  </div>
                  <span
                    className={`${styles.statusBadge} ${statusStyle(item.status)}`}
                  >
                    {statusLabel(item.status)}
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

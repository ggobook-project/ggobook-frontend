import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import styles from "../styles/AdminInspectionDetailPage.module.css";

export default function AdminInspectionDetailPage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌟 [추가] 승인/반려 처리 중인지 확인하는 상태 (중복 클릭 방지용)
  const [isProcessing, setIsProcessing] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");

  const loadInspectionDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/admin/inspections/episodes/${episodeId}`,
      );
      setData(response.data);
    } catch (error) {
      console.error("상세 내용을 불러오는데 실패했습니다.", error);
      alert("데이터를 불러올 수 없습니다.");
      navigate("/admin/inspections");
    } finally {
      setLoading(false);
    }
  }, [episodeId, navigate]);

  useEffect(() => {
    loadInspectionDetail();
  }, [loadInspectionDetail]);

  const handleApprove = async () => {
    if (
      !window.confirm(
        "이 작품과 회차를 최종 승인하시겠습니까? (AI 요약이 함께 진행됩니다.)",
      )
    )
      return;

    // 🌟 [추가] 처리 시작: 버튼 잠금
    setIsProcessing(true);
    try {
      const now = new Date();
      const formattedDate = now
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      await api.post(`/api/admin/inspections/episodes/${episodeId}/approve`, {
        scheduledAt: formattedDate,
      });

      alert("최종 승인 및 발행 처리가 완료되었습니다.");
      navigate("/admin/inspections");
    } catch (error) {
      console.error("승인 실패", error);
      alert("승인 처리 중 오류가 발생했습니다.");
      setIsProcessing(false); // 🌟 에러가 나면 다시 버튼 잠금 해제
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("반려 사유를 선택해주세요.");
      return;
    }
    if (rejectReason === "기타 (직접 작성)" && !customRejectReason.trim()) {
      alert("상세 반려 사유를 작성해주세요.");
      return;
    }

    // 🌟 [추가] 처리 시작: 버튼 잠금
    setIsProcessing(true);
    try {
      const finalReason =
        rejectReason === "기타 (직접 작성)" ? customRejectReason : rejectReason;

      await api.post(`/api/admin/inspections/episodes/${episodeId}/reject`, {
        rejectReason: finalReason,
      });

      alert("반려 처리가 완료되었습니다.");
      navigate("/admin/inspections");
    } catch (error) {
      console.error("반려 실패", error);
      alert("반려 처리 중 오류가 발생했습니다.");
      setIsProcessing(false); // 🌟 에러가 나면 다시 버튼 잠금 해제
    }
  };

  const handleBack = () => navigate("/admin/inspections");

  if (loading)
    return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;
  if (!data) return null;

  const { content } = data;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topNav}>
        <button onClick={handleBack} className={styles.btnBack}>
          ← 목록으로
        </button>
        <div className={styles.navTitle}>검수 상세 내역</div>
      </div>
      <div className={styles.mainContent}>
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>1. 작품 기본 정보 (Content)</h2>
          <div className={styles.contentInfo}>
            <div className={styles.thumbnailArea}>
              {content.thumbnailUrl ? (
                <img src={content.thumbnailUrl} alt="작품 썸네일" />
              ) : (
                <div className={styles.noThumbnail}>썸네일 없음</div>
              )}
            </div>
            <div className={styles.textInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>작품 제목:</span>
                <span className={styles.value}>{content.title}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>작가 정보:</span>
                <span className={styles.value}>
                  {content.author?.nickname
                    ? `${content.author.nickname} (ID: ${content.author.id})`
                    : content.author?.id || "미상"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>장르 / 타입:</span>
                <span className={styles.value}>
                  {content.genre} / {content.type}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>작품 요약:</span>
                <p className={styles.description}>{content.summary}</p>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            2. 회차 상세 원고 (Episode {data.episodeNumber}화)
          </h2>
          <div className={styles.episodeHeader}>
            <div className={styles.episodeTitle}>제목: {data.episodeTitle}</div>
            <div className={styles.isFreeBadge}>
              {data.isFree ? "무료회차" : "유료회차"}
            </div>
          </div>
          <div className={styles.manuscriptArea}>
            {content.type === "웹소설" || content.type === "NOVEL" ? (
              <div className={styles.novelText}>
                {data.contentText ||
                  data.novel?.contentText ||
                  "등록된 웹소설 원고가 없습니다."}
              </div>
            ) : (
              <div className={styles.webtoonImages}>
                {(() => {
                  const imageList =
                    data.comicToons || data.images || data.webtoonImages || [];
                  if (imageList.length === 0)
                    return (
                      <div style={{ padding: "20px", color: "#666" }}>
                        등록된 웹툰 이미지가 없습니다.
                      </div>
                    );
                  return imageList.map((img, idx) => (
                    <img
                      key={img.image_id || idx}
                      src={img.imageUrl}
                      alt={`웹툰 컷 ${idx + 1}`}
                      style={{
                        width: "100%",
                        marginBottom: "10px",
                        display: "block",
                        borderRadius: "8px",
                      }}
                    />
                  ));
                })()}
              </div>
            )}
          </div>
        </section>
        <div className={styles.actionBar}>
          <div className={styles.actionInfo}>
            검토 결과에 따라 승인 또는 반려를 선택해주세요.
          </div>
          <div className={styles.btnGroup}>
            {/* 🌟 [수정] 처리 중일 때는 버튼 클릭을 막고 텍스트를 바꿉니다 */}
            <button
              onClick={() => setIsRejectModalOpen(true)}
              className={styles.btnReject}
              disabled={isProcessing}
            >
              반려하기
            </button>
            <button
              onClick={handleApprove}
              className={styles.btnApprove}
              disabled={isProcessing}
            >
              {isProcessing ? "AI 요약 생성 및 승인 중..." : "승인"}
            </button>
          </div>
        </div>
      </div>
      {isRejectModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>반려 사유 작성</h3>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className={styles.modalSelect}
              disabled={isProcessing}
            >
              <option value="">사유 선택</option>
              <option value="썸네일/줄거리 규격 미달">
                썸네일/줄거리 규격 미달
              </option>
              <option value="원고 내 부적절한 표현 포함">
                원고 내 부적절한 표현 포함
              </option>
              <option value="저작권 및 표절 의심">저작권 및 표절 의심</option>
              <option value="기타 (직접 작성)">기타 (직접 작성)</option>
            </select>
            {rejectReason === "기타 (직접 작성)" && (
              <textarea
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                placeholder="상세 사유를 입력해주세요..."
                className={styles.modalTextarea}
                disabled={isProcessing}
              />
            )}
            <div className={styles.modalBtnGroup}>
              {/* 🌟 [수정] 모달 안의 버튼들도 처리 중일 땐 잠금 */}
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className={styles.btnCancel}
                disabled={isProcessing}
              >
                취소
              </button>
              <button
                onClick={handleReject}
                className={styles.btnConfirmReject}
                disabled={isProcessing}
              >
                {isProcessing ? "처리 중..." : "반려 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

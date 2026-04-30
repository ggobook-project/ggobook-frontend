import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import styles from "../styles/AdminInspectionDetailPage.module.css";

export default function AdminInspectionDetailPage() {
  const { episodeId: contentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");

  const loadInspectionDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/inspections/contents/${contentId}`);
      setData(response.data);
    } catch (error) {
      console.error("상세 내용을 불러오는데 실패했습니다.", error);
      alert("데이터를 불러올 수 없습니다.");
      navigate("/admin/inspections");
    } finally {
      setLoading(false);
    }
  }, [contentId, navigate]);

  useEffect(() => {
    loadInspectionDetail();
  }, [loadInspectionDetail]);

  const handleApprove = async () => {
    if (!window.confirm("이 작품을 승인하시겠습니까?")) return;
    setIsProcessing(true);
    try {
      await api.post(`/api/admin/inspections/contents/${contentId}/approve`);
      alert("작품이 승인되었습니다. 작가가 회차를 등록하면 연재가 시작됩니다.");
      navigate("/admin/inspections");
    } catch (error) {
      console.error("승인 실패", error);
      alert("승인 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) { alert("반려 사유를 선택해주세요."); return; }
    if (rejectReason === "기타 (직접 작성)" && !customRejectReason.trim()) {
      alert("상세 반려 사유를 작성해주세요."); return;
    }
    setIsProcessing(true);
    try {
      const finalReason = rejectReason === "기타 (직접 작성)" ? customRejectReason : rejectReason;
      await api.post(`/api/admin/inspections/contents/${contentId}/reject`, { rejectReason: finalReason });
      alert("반려 처리가 완료되었습니다.");
      navigate("/admin/inspections");
    } catch (error) {
      console.error("반려 실패", error);
      alert("반려 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  const handleBack = () => navigate("/admin/inspections");

  if (loading)
    return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;
  if (!data) return null;

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
          <h2 className={styles.sectionTitle}>작품 기본 정보</h2>
          <div className={styles.contentInfo}>
            <div className={styles.thumbnailArea}>
              {data.thumbnailUrl ? (
                <img src={data.thumbnailUrl} alt="작품 썸네일" />
              ) : (
                <div className={styles.noThumbnail}>썸네일 없음</div>
              )}
            </div>
            <div className={styles.textInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>작품 제목:</span>
                <span className={styles.value}>{data.title}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>작가:</span>
                <span className={styles.value}>
                  {data.author?.nickname
                    ? `${data.author.nickname} (ID: ${data.author.id})`
                    : data.author?.id || "미상"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>장르 / 타입:</span>
                <span className={styles.value}>{data.genre} / {data.type}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>줄거리:</span>
                <p className={styles.description}>{data.summary || data.description || "없음"}</p>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>등록일:</span>
                <span className={styles.value}>{data.createdAt?.substring(0, 10) || "-"}</span>
              </div>
            </div>
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
              {isProcessing ? "처리 중..." : "검토 완료 (승인)"}
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

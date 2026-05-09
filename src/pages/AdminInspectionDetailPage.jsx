import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/AdminInspectionDetailPage.module.css";
import { useAlert } from "../context/AlertContext";

export default function AdminInspectionDetailPage() {
  const { type, id } = useParams(); 
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");

  const isContent = type === "CONTENT";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const fetchUrl = isContent 
          ? `/api/admin/inspections/contents/${id}`
          : `/api/admin/inspections/episodes/${id}`;
        const response = await api.get(fetchUrl);
        setData(response.data);
      } catch {
        await showAlert("데이터를 불러올 수 없습니다.", "error");
        navigate("/admin/inspections");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id, navigate, showAlert, isContent]);

  const handleApprove = async () => {
    const ok = await showConfirm(isContent ? "이 작품을 승인하시겠습니까?" : "이 회차를 승인하시겠습니까?");
    if (!ok) return;
    setIsProcessing(true);
    try {
      if (isContent) {
        await api.post(`/api/admin/inspections/contents/${id}/approve`);
      } else {
        // 🌟 핵심 수정: new Date()로 덮어쓰지 않고, 작가가 설정한 data.scheduledAt을 그대로 서버에 돌려줍니다.
        // 만약 예약 시간이 비어있다면(즉시 공개 요청 등) 그때만 현재 시간을 보냅니다.
        const finalDate = data.scheduledAt || new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        await api.post(`/api/admin/inspections/episodes/${id}/approve`, { scheduledAt: finalDate });
      }
      await showAlert("승인되었습니다.", "success", "승인 완료");
      navigate("/admin/inspections");
    } catch {
      await showAlert("승인 처리 중 오류가 발생했습니다.", "error");
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) { await showAlert("반려 사유를 선택해주세요.", "warning"); return; }
    if (rejectReason === "기타 (직접 작성)" && !customRejectReason.trim()) {
      await showAlert("상세 반려 사유를 작성해주세요.", "warning"); return;
    }
    setIsProcessing(true);
    try {
      const finalReason = rejectReason === "기타 (직접 작성)" ? customRejectReason : rejectReason;
      const url = isContent 
        ? `/api/admin/inspections/contents/${id}/reject`
        : `/api/admin/inspections/episodes/${id}/reject`;

      await api.post(url, { rejectReason: finalReason });
      await showAlert("반려 처리가 완료되었습니다.", "success", "반려 완료");
      navigate("/admin/inspections");
    } catch {
      await showAlert("반려 처리 중 오류가 발생했습니다.", "error");
      setIsProcessing(false);
    }
  };

  if (loading) return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;
  if (!data) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{isContent ? "신규 작품 검수" : "새 회차 검수"}</div>
        <div className={styles.headerSubtitle}>내용을 검토하고 승인 또는 반려 처리하세요.</div>
      </div>

      <div className={styles.content}>
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>작품 기본 정보</h2>
          <div className={styles.contentInfo}>
            <div className={styles.thumbnailArea}>
              {data.thumbnailUrl ? <img src={data.thumbnailUrl} alt="작품 썸네일" /> : <div className={styles.noThumbnail}>썸네일 없음</div>}
            </div>
            <div className={styles.textInfo}>
              <div className={styles.infoRow}><span className={styles.label}>{isContent ? "작품 제목" : "회차 제목"}</span><span className={styles.value}>{data.title || data.episodeTitle}</span></div>
              <div className={styles.infoRow}><span className={styles.label}>작가</span><span className={styles.value}>{data.authorNickname || data.author?.nickname || "미상"}</span></div>
              <div className={styles.infoRow}><span className={styles.label}>예약 업로드일</span><span className={styles.value} style={{color: '#2196F3', fontWeight: 'bold'}}>{data.scheduledAt ? new Date(data.scheduledAt).toLocaleString() : "즉시 공개"}</span></div>
              <div className={styles.infoRow}><span className={styles.label}>줄거리</span><span className={styles.value}>{data.summary || data.description || "없음"}</span></div>
              <div className={styles.infoActions}>
                <button onClick={() => setIsRejectModalOpen(true)} className={styles.btnReject} disabled={isProcessing}>반려하기</button>
                <button onClick={handleApprove} className={styles.btnApprove} disabled={isProcessing}>{isProcessing ? "처리 중..." : "검토 완료 (승인)"}</button>
              </div>
            </div>
          </div>
        </section>

        {!isContent && (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>회차 원고 <span className={styles.episodeBadge}>{data.episodeNumber}화</span></h2>
            {data.type === "웹소설" || data.type === "NOVEL" ? (
              <div className={styles.manuscriptArea}>
                <div className={styles.novelText}>{data.episodeText || data.novelContent || "등록된 텍스트 원고가 없습니다."}</div>
              </div>
            ) : (
              <div className={styles.webtoonViewer}>
                {data.imageUrls?.length > 0 ? data.imageUrls.map((url, idx) => (<img key={idx} src={url} alt={`${idx + 1}컷`} className={styles.webtoonImg} />)) : <div className={styles.noThumbnail} style={{ width: "100%", height: "120px" }}>등록된 웹툰 이미지가 없습니다.</div>}
              </div>
            )}
          </section>
        )}
      </div>

      {isRejectModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>반려 사유 작성</h3>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className={styles.modalSelect} disabled={isProcessing}>
              <option value="">사유 선택</option>
              <option value="썸네일/줄거리 규격 미달">썸네일/줄거리 규격 미달</option>
              <option value="원고 내 부적절한 표현 포함">원고 내 부적절한 표현 포함</option>
              <option value="저작권 및 표절 의심">저작권 및 표절 의심</option>
              <option value="기타 (직접 작성)">기타 (직접 작성)</option>
            </select>
            {rejectReason === "기타 (직접 작성)" && (<textarea value={customRejectReason} onChange={(e) => setCustomRejectReason(e.target.value)} placeholder="상세 사유를 입력해주세요..." className={styles.modalTextarea} disabled={isProcessing} />)}
            <div className={styles.modalBtnGroup}>
              <button onClick={() => setIsRejectModalOpen(false)} className={styles.btnCancel} disabled={isProcessing}>취소</button>
              <button onClick={handleReject} className={styles.btnConfirmReject} disabled={isProcessing}>{isProcessing ? "처리 중..." : "반려 확정"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
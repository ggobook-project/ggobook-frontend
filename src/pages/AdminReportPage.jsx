import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// 🌟 1. 공통 api 인스턴스 임포트
import api from "../api/axios";
import styles from "../styles/AdminReportPage.module.css";

const REASON_MAP = {
  SPAM: "스팸 및 도배",
  ABUSIVE_LANGUAGE: "욕설 및 비하 발언",
  INAPPROPRIATE_CONTENT: "음란물 및 선정적 콘텐츠",
  COPYRIGHT_INFRINGEMENT: "저작권 침해 및 무단 도용",
  ILLEGAL_PROMOTION: "불법 홍보 및 광고",
  POLITICAL_DISPUTE: "정치적 분쟁 유도",
  FAKE_INFORMATION: "허위 사실 유포",
  OTHER: "기타 사유",
};

export default function AdminReportPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [modalType, setModalType] = useState("");
  const [processData, setProcessData] = useState({
    duration: "DAYS_3",
    processReason: "",
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      // 🌟 2. axios 대신 api 사용
      const res = await api.get("/api/admin/reports/pending");
      setReports(res.data);
    } catch (err) {
      console.error("신고 목록 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter((r) =>
    filter === "전체" ? true : r.targetType === filter,
  );

  const handleConfirm = async () => {
    if (!processData.processReason.trim()) {
      alert("관리자 처리 사유를 입력해 주세요.");
      return;
    }

    try {
      // 🌟 3. 모든 요청을 api로 변경
      if (modalType === "APPROVE") {
        await api.post(
          `/api/admin/reports/${selectedReport.reportId}/approve`,
          {
            duration: processData.duration,
            processReason: processData.processReason,
          },
        );
        alert("유저 정지 및 신고 처리가 완료되었습니다.");
      } else if (modalType === "RESOLVE") {
        await api.post(
          `/api/admin/reports/${selectedReport.reportId}/resolve`,
          {
            processReason: processData.processReason,
          },
        );
        alert("단순 완료 처리되었습니다. (유저 상태 유지)");
      } else {
        await api.post(`/api/admin/reports/${selectedReport.reportId}/reject`, {
          processReason: processData.processReason,
        });
        alert("허위 신고로 기각 처리되었습니다.");
      }

      setSelectedReport(null);
      loadReports();
    } catch (err) {
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>신고 관리</div>
        <div className={styles.headerSubtitle}>
          사용자들이 접수한 신고 내역을 검토하고 조치하세요
        </div>
      </div>

      <div className={styles.content}>
        {/* 상단 탭 필터 */}
        <div className={styles.filterGroup}>
          {["전체", "CONTENT", "COMMENT", "RELAY"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            >
              {f === "전체" ? "전체 보기" : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>로딩 중...</div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            대기 중인 신고가 없습니다. 🎉
          </div>
        ) : (
          filteredReports.map((r) => (
            <div key={r.reportId} className={styles.reportCard}>
              <div className={styles.reportTop}>
                <div className={styles.reportLeft}>
                  <span className={styles.typeBadge}>{r.targetType}</span>
                  {/* 🌟 한글 변환 적용: REASON_MAP에서 찾고, 없으면 원래 영어를 출력 */}
                  <span className={styles.reportReasonBadge}>
                    {REASON_MAP[r.reportReason] || r.reportReason}
                  </span>
                </div>
                <span className={styles.reportDate}>
                  {r.createdAt?.split("T")[0]}
                </span>
              </div>
              <div className={styles.reportInfo}>
                <div>
                  <strong>대상 유저:</strong> {r.reportedUser?.nickname} (
                  {r.reportedUser?.userId})
                </div>
                <div>
                  <strong>신고자:</strong> {r.reporter?.nickname}
                </div>
                <div className={styles.targetLink}>
                  타겟 ID: {r.targetId} (클릭 시 해당 콘텐츠로 이동하도록 구현
                  가능)
                </div>
              </div>

              {/* 🌟 3가지 버튼 세팅 */}
              <div
                className={styles.reportActions}
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                  marginTop: "12px",
                }}
              >
                <button
                  className={styles.rejectBtn}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedReport(r);
                    setModalType("REJECT");
                    setProcessData({ processReason: "" });
                  }}
                >
                  허위 기각
                </button>
                <button
                  className={styles.resolveBtn}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #10B981",
                    color: "#10B981",
                    background: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedReport(r);
                    setModalType("RESOLVE");
                    setProcessData({
                      processReason: "이미 처리된 이슈입니다.",
                    });
                  }}
                >
                  완료 처리
                </button>
                <button
                  className={styles.approveBtn}
                  style={{
                    padding: "6px 12px",
                    background: "#EF4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedReport(r);
                    setModalType("APPROVE");
                    setProcessData({ duration: "DAYS_3", processReason: "" });
                  }}
                >
                  정지 처리
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달창 */}
      {selectedReport && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              {modalType === "APPROVE" &&
                `🚨 ${selectedReport.reportedUser?.nickname}님 정지 처리`}
              {modalType === "RESOLVE" && `✅ 단순 완료 처리`}
              {modalType === "REJECT" && `🛡️ 허위 신고 기각`}
            </div>

            {/* 정지 처리에만 '정지 기간' 드롭다운 노출 */}
            {modalType === "APPROVE" && (
              <>
                <label className={styles.modalLabel}>정지 기간</label>
                <select
                  className={styles.selectField}
                  value={processData.duration}
                  onChange={(e) =>
                    setProcessData({ ...processData, duration: e.target.value })
                  }
                >
                  <option value="DAYS_3">3일 정지</option>
                  <option value="DAYS_7">7일 정지</option>
                  <option value="DAYS_14">14일 정지</option>
                  <option value="DAYS_30">30일 정지</option>
                  <option value="PERMANENT">영구 정지</option>
                </select>
              </>
            )}

            <label className={styles.modalLabel}>처리 사유 기록</label>
            <textarea
              className={styles.textareaField}
              style={{
                width: "100%",
                padding: "8px",
                boxSizing: "border-box",
                marginTop: "4px",
                minHeight: "80px",
              }}
              placeholder="관리자 메모용 사유를 입력하세요..."
              value={processData.processReason}
              onChange={(e) =>
                setProcessData({
                  ...processData,
                  processReason: e.target.value,
                })
              }
            />

            <div className={styles.btnGroup}>
              <button
                className={styles.cancelBtn}
                onClick={() => setSelectedReport(null)}
              >
                취소
              </button>
              <button
                className={
                  modalType === "APPROVE"
                    ? styles.confirmBtn
                    : styles.rejectConfirmBtn
                }
                onClick={handleConfirm}
              >
                처분 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

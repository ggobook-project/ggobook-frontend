import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/AdminReportPage.module.css";

const REASON_MAP = {
  SPAM: "스팸 및 도배",
  ABUSIVE_LANGUAGE: "욕설 및 비하 발언",
  INAPPROPRIATE_CONTENT: "음란물 및 선정적 콘텐츠",
  COPYRIGHT_INFRINGEMENT: "저작권 침해",
  ILLEGAL_PROMOTION: "불법 홍보",
  POLITICAL_DISPUTE: "정치적 분쟁",
  FAKE_INFORMATION: "허위 사실",
  OTHER: "기타 사유",
};

// 🌟 관리자 보기 편하도록 영어 타입을 한글로 예쁘게 렌더링하기 위한 매퍼
const TYPE_MAP = {
  RELAY_NOVEL: "릴레이 소설",
  RELAY_ENTRY: "이어쓰기",
  WEBTOON_COMMENT: "웹툰 댓글",
  NOVEL_COMMENT: "소설 댓글",
  WEBTOON_REPLY: "웹툰 답글",
  NOVEL_REPLY: "소설 답글",
};

export default function AdminReportPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 모달 제어 상태
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalType, setModalType] = useState(""); // APPROVE, RESOLVE, REJECT
  const [processData, setProcessData] = useState({
    duration: "DAYS_3",
    processReason: "",
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/reports/pending");
      setReports(res.data);
    } catch (err) {
      console.error("신고 목록 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  // 🌟 [동적 내비게이션] 도메인별 이동 경로 완벽 분기
  const handleMoveToTarget = (report) => {
    const { targetType, targetId, targetParentId } = report;

    // 1. 소설 주제(RELAY_NOVEL) 자체를 신고한 경우
    if (targetType === "RELAY_NOVEL") {
      navigate(`/relay?novelId=${targetId}`);
      return;
    }

    // 2. 소설 속 회차(RELAY_ENTRY)를 신고한 경우
    if (targetType === "RELAY_ENTRY") {
      if (!targetParentId) return alert("부모 소설 정보가 없습니다.");
      navigate(`/relay/${targetParentId}?targetId=${targetId}&type=${targetType}`);
      return;
    }

    // 3. 웹툰 댓글/답글 신고인 경우
    if (targetType === "WEBTOON_COMMENT" || targetType === "WEBTOON_REPLY") {
      if (!targetParentId) return alert("웹툰 회차 정보가 없습니다.");
      // targetType을 쿼리로 같이 보내서 뷰어 쪽에서 댓글/답글 중 무엇을 찾을지 알게 합니다.
      navigate(`/webtoon/viewer/${targetParentId}?focusComment=${targetId}&targetType=${targetType}`);
      return;
    }

    // 4. 웹소설 댓글/답글 신고인 경우
    if (targetType === "NOVEL_COMMENT" || targetType === "NOVEL_REPLY") {
      if (!targetParentId) return alert("웹소설 회차 정보가 없습니다.");
      navigate(`/novel/viewer/${targetParentId}?focusComment=${targetId}&targetType=${targetType}`);
      return;
    }

    alert("이동 경로가 설정되지 않은 타입입니다.");
  };

  const handleConfirm = async () => {
    if (!processData.processReason.trim()) return alert("처리 사유를 입력하세요.");
    try {
      const endpoint = modalType.toLowerCase(); 
      await api.post(`/api/admin/reports/${selectedReport.reportId}/${endpoint}`, {
        duration: modalType === "APPROVE" ? processData.duration : null,
        processReason: processData.processReason,
      });
      alert("처리가 완료되었습니다.");
      setSelectedReport(null);
      loadReports();
    } catch (err) {
      alert("처리 중 오류 발생");
    }
  };

  // 🌟 [필터링 로직 수정] 댓글과 답글이 여러 타입으로 나뉘었으므로 Includes 로직 사용
  const filteredReports = reports.filter(r => {
    if (filter === "전체") return true;
    if (filter === "릴레이 소설") return r.targetType === "RELAY_NOVEL";
    if (filter === "이어쓰기") return r.targetType === "RELAY_ENTRY";
    if (filter === "댓글") return r.targetType === "WEBTOON_COMMENT" || r.targetType === "NOVEL_COMMENT";
    if (filter === "답글") return r.targetType === "WEBTOON_REPLY" || r.targetType === "NOVEL_REPLY";
    return true;
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>신고 관리 센터</div>
        <div className={styles.headerSubtitle}>중복 건은 '완료' 처리를 통해 목록을 관리하세요.</div>
      </div>

      <div className={styles.content}>
        {/* 🌟 팀장님 요청 탭 필터 적용 */}
        <div className={styles.filterGroup}>
          {[
            { label: "전체", value: "전체" },
            { label: "릴레이 소설", value: "릴레이 소설" },
            { label: "이어쓰기", value: "이어쓰기" },
            { label: "댓글", value: "댓글" },
            { label: "답글", value: "답글" },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`${styles.filterBtn} ${filter === tab.value ? styles.filterBtnActive : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#90A4C8" }}>로딩 중...</div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#90A4C8" }}>대기 중인 신고가 없습니다. 🎉</div>
        ) : (
          filteredReports.map(r => (
            <div 
              key={r.reportId} 
              className={styles.reportCard} 
              onClick={() => handleMoveToTarget(r)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.reportTop}>
                <div className={styles.reportLeft}>
                  {/* 영어 타입명 대신 한글로 예쁘게 렌더링 */}
                  <span className={styles.typeBadge}>{TYPE_MAP[r.targetType] || r.targetType}</span>
                  <span className={styles.reportReason}>
                    {REASON_MAP[r.reportReason] || r.reportReason}
                  </span>
                </div>
                <span className={styles.reportDate}>{r.createdAt?.split("T")[0]}</span>
              </div>
              
              <div className={styles.reportReporter}>
                <strong>피신고자:</strong> {r.reportedUser?.nickname} (ID: {r.reportedUser?.userId}) <br/>
                <strong>신고자:</strong> {r.reporter?.nickname}
              </div>

              <div className={styles.reportActions}>
                <button 
                  className={styles.doneBtn} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedReport(r); 
                    setModalType("REJECT"); 
                    setProcessData({ processReason: "" });
                  }}
                >
                  허위 기각
                </button>
                <button 
                  className={styles.doneBtn} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedReport(r); 
                    setModalType("RESOLVE"); 
                    setProcessData({ processReason: "이미 조치된 건입니다." });
                  }}
                >
                  완료 처리
                </button>
                <button 
                  className={styles.deleteBtn} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedReport(r); 
                    setModalType("APPROVE"); 
                    setProcessData({ duration: "DAYS_3", processReason: "" });
                  }}
                >
                  정지 처분
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달 Overlay 및 팝업 */}
      {selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              {modalType === "APPROVE" ? "🚨 정지 처분" : modalType === "RESOLVE" ? "✅ 완료 처리" : "🛡️ 신고 기각"}
            </div>
            
            {modalType === "APPROVE" && (
              <>
                <label className={styles.modalLabel}>정지 기간</label>
                <select 
                  className={styles.selectField} 
                  value={processData.duration} 
                  onChange={e => setProcessData({...processData, duration: e.target.value})}
                >
                  <option value="DAYS_3">3일 정지</option>
                  <option value="DAYS_7">7일 정지</option>
                  <option value="DAYS_30">30일 정지</option>
                  <option value="PERMANENT">영구 정지</option>
                </select>
              </>
            )}

            <label className={styles.modalLabel}>처리 사유 기록</label>
            <textarea 
              className={styles.textareaField} 
              rows={4}
              value={processData.processReason} 
              onChange={e => setProcessData({...processData, processReason: e.target.value})} 
              placeholder="사유를 입력하세요..." 
            />

            <div className={styles.btnGroup}>
              <button className={styles.cancelBtn} onClick={() => setSelectedReport(null)}>취소</button>
              <button 
                className={modalType === "APPROVE" ? styles.confirmBtn : styles.rejectConfirmBtn} 
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
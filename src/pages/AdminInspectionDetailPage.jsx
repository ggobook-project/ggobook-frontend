import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import theme from "../styles/theme";
import styles from "../styles/AdminInspectionDetailPage.module.css";

const { colors: c } = theme;

export default function AdminInspectionDetailPage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // Episode + Content 통합 데이터
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  // 🌟 [추가] 직접 작성하는 사유를 담을 State
  const [customRejectReason, setCustomRejectReason] = useState("");

  // ==========================================
  // [연동 1] 검수 상세 데이터 로드 (Content + Episode)
  // 명세서 메서드명: loadInspectionDetail()
  // ==========================================
  // 1. useCallback으로 함수를 감싸서 메모리에 캐싱(기억)합니다.
  const loadInspectionDetail = useCallback(async () => {
    try {
      setLoading(true); // 🌟 로딩 시작 (복구됨)
      const response = await axios.get(`http://localhost:8080/api/admin/inspections/episodes/${episodeId}`);
      setData(response.data); // 🌟 주석 해제됨 (데이터 저장)
    } catch (error) {
      console.error("상세 내용을 불러오는데 실패했습니다.", error);
      alert("데이터를 불러올 수 없습니다.");
      navigate("/admin/inspections");
    } finally {
      setLoading(false); // 🌟 로딩 종료 (복구됨)
    }
  }, [episodeId, navigate]); // 🌟 사용하는 외부 변수/함수 모두 명시

  useEffect(() => {
    loadInspectionDetail();
  }, [loadInspectionDetail]);

  // ==========================================
  // [연동 2] 최종 승인 처리 (원클릭 스마트 승인)
  // 명세서 메서드명: handleApprove()
  // ==========================================
  const handleApprove = async () => {
    if (!window.confirm("이 작품과 회차를 최종 승인하시겠습니까?")) return;

    try {
      // 서버 규격에 맞춘 날짜 포맷 (yyyy-MM-dd HH:mm:ss)
      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
      
      const requestData = { scheduledAt: formattedDate };

      await axios.post(`http://localhost:8080/api/admin/inspections/episodes/${episodeId}/approve`, requestData);
      
      alert("최종 승인 및 발행 처리가 완료되었습니다.");
      navigate("/admin/inspections");
    } catch (error) {
      console.error("승인 실패", error);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  // ==========================================
  // [연동 3] 반려 처리
  // 명세서 메서드명: handleReject()
  // ==========================================
  const handleReject = async () => {
    if (!rejectReason) {
      alert("반려 사유를 선택해주세요.");
      return;
    }

    // 🌟 1. '기타'를 골라놓고 아무것도 안 적었을 때 튕겨내기
    if (rejectReason === "기타 (직접 작성)" && !customRejectReason.trim()) {
      alert("상세 반려 사유를 작성해주세요.");
      return;
    }

    try {
      // 🌟 2. '기타'를 골랐으면 사용자가 적은 글을, 아니면 원래 선택한 글을 서버로 보냄
      const finalReason = rejectReason === "기타 (직접 작성)" ? customRejectReason : rejectReason;

      await axios.post(`http://localhost:8080/api/admin/inspections/episodes/${episodeId}/reject`, {
        rejectReason: finalReason
      });
      alert("반려 처리가 완료되었습니다.");
      navigate("/admin/inspections");
    } catch (error) {
      console.error("반려 실패", error);
      alert("반려 처리 중 오류가 발생했습니다.");
    }
  };

  // 명세서 메서드명: handleBack()
  const handleBack = () => navigate("/admin/inspections");

  if (loading) return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;
  if (!data) return null;

  const { content } = data; // Episode 내부에 포함된 Content 정보

  return (
    <div className={styles.pageWrapper}>
      {/* 상단 헤더 및 뒤로가기 */}
      <div className={styles.topNav}>
        <button onClick={handleBack} className={styles.btnBack}>← 목록으로</button>
        <div className={styles.navTitle}>검수 상세 내역</div>
      </div>

      <div className={styles.mainContent}>
        
        {/* SECTION 1: 작품(Content) 정보 - 썸네일, 줄거리 검토 */}
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
                <span className={styles.label}>작가 ID:</span>
                <span className={styles.value}>{content.authorId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>장르 / 타입:</span>
                <span className={styles.value}>{content.genre} / {content.type}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>작품 요약:</span>
                <p className={styles.description}>{content.summary}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 회차(Episode) 정보 - 원고 내용 검토 */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>2. 회차 상세 원고 (Episode {data.episodeNumber}화)</h2>
          <div className={styles.episodeHeader}>
            <div className={styles.episodeTitle}>제목: {data.episodeTitle}</div>
            <div className={styles.isFreeBadge}>{data.isFree ? "무료회차" : "유료회차"}</div>
          </div>
          
          <div className={styles.manuscriptArea}>
            {/* 소설인 경우 텍스트 출력, 웹툰인 경우 이미지 리스트 출력 로직 */}
            {content.type === "NOVEL" ? (
              <div className={styles.novelText}>{data.novel?.contentText}</div>
            ) : (
              <div className={styles.webtoonImages}>
                {data.comicToons?.map((img, idx) => (
                  <img key={idx} src={img.imageUrl} alt={`${idx}번 컷`} />
                ))}
                {(!data.comicToons || data.comicToons.length === 0) && "등록된 웹툰 이미지가 없습니다."}
              </div>
            )}
          </div>
        </section>

        {/* 하단 플로팅 액션 바 */}
        <div className={styles.actionBar}>
          <div className={styles.actionInfo}>
            검토 결과에 따라 승인 또는 반려를 선택해주세요.
          </div>
          <div className={styles.btnGroup}>
            <button onClick={() => setIsRejectModalOpen(true)} className={styles.btnReject}>반려하기</button>
            <button onClick={handleApprove} className={styles.btnApprove}>승인</button>
          </div>
        </div>
      </div>

      {/* 반려 사유 입력 모달 */}
      {isRejectModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>반려 사유 작성</h3>
            <p>작가에게 전달될 구체적인 반려 사유를 선택하거나 작성해주세요.</p>
            <select 
              value={rejectReason} 
              onChange={(e) => setRejectReason(e.target.value)}
              className={styles.modalSelect}
            >
              <option value="">사유 선택</option>
              <option value="썸네일/줄거리 규격 미달">썸네일/줄거리 규격 미달</option>
              <option value="원고 내 부적절한 표현 포함">원고 내 부적절한 표현 포함</option>
              <option value="저작권 및 표절 의심">저작권 및 표절 의심</option>
              <option value="기타 (직접 작성)">기타 (직접 작성)</option>
            </select>

            {/* 🌟 [추가] '기타' 선택 시에만 나타나는 입력창 */}
            {rejectReason === "기타 (직접 작성)" && (
              <textarea
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                placeholder="작가에게 전달될 상세 반려 사유를 입력해주세요 (최대 500자)"
                className={styles.modalTextarea}
              />
            )}
            <div className={styles.modalBtnGroup}>
              <button onClick={() => setIsRejectModalOpen(false)} className={styles.btnCancel}>취소</button>
              <button onClick={handleReject} className={styles.btnConfirmReject}>반려 확정</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
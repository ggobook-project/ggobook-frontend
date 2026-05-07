import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/AdminContentDetailPage.module.css";
import { useAlert } from "../context/AlertContext";

const STATUS_MAP = {
  "DRAFT": "임시 저장",
  "PENDING": "검수 대기",
  "APPROVED": "검수 완료",
  "PUBLISHED": "공개 완료",
  "REJECTED": "반려",
  "BLINDED": "블라인드",
  "PRIVATE": "비공개"
};

export default function AdminContentDetailPage() {
  const navigate = useNavigate();
  const { contentId } = useParams();
  const { showAlert, showConfirm } = useAlert(); 
  const [episodes, setEpisodes] = useState([]);
  const [contentInfo, setContentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 회차 목록 로드
  const loadEpisodes = useCallback(async () => {
    try {
      const response = await api.get(`/api/admin/content/${contentId}/episodes`);
      setEpisodes(response.data || []);
    } catch (error) {
      console.error("회차 로드 실패:", error);
    }
  }, [contentId]);

  // 2. 작품 기본 정보 로드
  const loadContentInfo = useCallback(async () => {
    try {
      const response = await api.get(`/api/admin/content/${contentId}`);
      setContentInfo(response.data);
    } catch (error) {
      console.error("작품 정보 로드 실패:", error);
    }
  }, [contentId]);

  // 3. 페이지 진입 시 데이터 통합 로드
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadEpisodes(), loadContentInfo()]);
      setLoading(false);
    };
    init();
  }, [loadEpisodes, loadContentInfo]);

  // 블라인드 처리 로직
  const handleToggle = async (episodeId) => {
    const ok = await showConfirm("이 회차의 공개 상태를 변경하시겠습니까?");
    if (!ok) return;

    try {
      await api.put(`/api/admin/content/episodes/${episodeId}/blind`);
      setEpisodes(prev => prev.map(ep =>
        ep.episodeId === episodeId
          ? { ...ep, status: (ep.status === "APPROVED" || ep.status === "PUBLISHED") ? "BLINDED" : "APPROVED" }
          : ep
      ));
    } catch (error) {
      await showAlert("상태 변경에 실패했습니다.", "error");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 상세 관리</div>
        <div className={styles.headerSubtitle}>
          {contentInfo ? `"${contentInfo.title}" 작품의 회차 목록입니다.` : ""}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div />
        ) : episodes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#90A4C8" }}>등록된 회차가 없습니다.</div>
        ) : (
          episodes.map((ep) => {
            // 🌟 2. 버튼 상태와 클릭 가능 여부를 여기서 미리 계산합니다.
            const isPublic = ep.status === "APPROVED" || ep.status === "PUBLISHED";
            const isBlinded = ep.status === "BLINDED";
            const canToggle = isPublic || isBlinded; // 토글 권한 확인

            return (
              <div 
                key={ep.episodeId} 
                className={styles.card}
                onClick={() => navigate(`/admin/content/${contentId}/episode/${ep.episodeId}`)}
                style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}
              >
                <div className={styles.info}>
                  <div className={styles.cardTitle}>
                    {ep.episodeNumber}화 - {ep.title}
                  </div>
                  <div className={styles.cardMeta}>
                    {ep.createdAt ? new Date(ep.createdAt).toLocaleDateString() : "날짜 없음"}
                  </div>
                </div>
                
                {/* 🌟 3. 완벽하게 수정된 버튼 구역 */}
                <button
                  className={`${styles.statusBtn} ${
                    isPublic ? styles.statusPublic 
                    : isBlinded ? styles.statusPrivate 
                    : "" // 그 외(대기, 반려 등)는 기본 CSS 적용
                  }`}
                  style={{
                    opacity: canToggle ? 1 : 0.6, // 변경 불가면 살짝 투명하게
                    cursor: canToggle ? "pointer" : "not-allowed" // 마우스 커서도 금지 표시
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭(이동) 방지
                    
                    // 권한이 있을 때만 서버로 요청 보냄
                    if (canToggle) {
                      handleToggle(ep.episodeId);
                    } else {
                      showAlert(`현재 [${STATUS_MAP[ep.status]}] 상태입니다.\n승인, 공개, 블라인드 상태일 때만 변경할 수 있습니다.`);
                    }
                  }}
                >
                  {/* 사전에 등록된 한글 상태명 출력 */}
                  {STATUS_MAP[ep.status] || ep.status}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
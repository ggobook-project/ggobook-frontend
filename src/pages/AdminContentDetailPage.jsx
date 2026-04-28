import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/AdminContentDetailPage.module.css";

export default function AdminContentDetailPage() {
  const navigate = useNavigate();
  const { contentId } = useParams(); 
  const [episodes, setEpisodes] = useState([]);
  const [contentInfo, setContentInfo] = useState(null); // 🌟 작품 정보 저장용 상태
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

  // 2. 작품 기본 정보(제목 등) 로드
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
      await Promise.all([loadEpisodes(), loadContentInfo()]); // 🌟 두 API를 동시에 호출
      setLoading(false);
    };
    init();
  }, [loadEpisodes, loadContentInfo]);

  // 블라인드 처리 로직
  const handleToggle = async (episodeId) => {
    if (!window.confirm("이 회차의 공개 상태를 변경하시겠습니까?")) return;

    try {
      await api.put(`/api/admin/content/episodes/${episodeId}/blind`);
      setEpisodes(prev => prev.map(ep => 
        ep.episodeId === episodeId 
          ? { ...ep, status: ep.status === "PUBLISHED" ? "BLINDED" : "PUBLISHED" } 
          : ep
      ));
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/admin/content")}>
          ➔ 목록으로
        </button>
        <div className={styles.headerTitle}>작품 상세 관리</div>
        {/* 🌟 수정된 헤더 자막 */}
        <div className={styles.headerSubtitle}>
          {contentInfo ? `"${contentInfo.title}" 작품의 회차 목록입니다.` : "로딩 중..."}
        </div>
      </div>

      <div className={styles.content}>
  {loading ? (
    <div style={{ textAlign: "center", padding: "40px" }}>데이터 로딩 중...</div>
  ) : episodes.length === 0 ? (
    <div style={{ textAlign: "center", padding: "40px" }}>등록된 회차가 없습니다.</div>
  ) : (
    episodes.map((ep) => (
  <div 
    key={ep.episodeId} 
    className={styles.card}
    // 🌟 수정 포인트: 카드 전체 영역을 클릭 가능하게 변경
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
    
    {/* 🌟 버튼은 그대로 유지 (e.stopPropagation()이 핵심!) */}
    <button
      className={`${styles.statusBtn} ${ep.status === "PUBLISHED" ? styles.statusPublic : styles.statusPrivate}`}
      onClick={(e) => {
        e.stopPropagation(); // 🌟 중요: 버튼 클릭 시 부모(카드) 클릭 이벤트 발동을 막음
        handleToggle(ep.episodeId);
      }}
    >
      {ep.status === "PUBLISHED" ? "공개 중" : "비공개 (블라인드)"}
    </button>
  </div>
))
  )}
</div>
    </div>
  );
}
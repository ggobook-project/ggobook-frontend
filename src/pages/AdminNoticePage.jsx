import { useState, useEffect } from "react";
// 🌟 1. 공통 api 인스턴스 임포트
import api from "../api/axios"; 
import styles from "../styles/AdminNoticePage.module.css";

export default function AdminNoticePage() {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ noticeId: null, title: "", content: "", isPinned: false });
  const [expandedId, setExpandedId] = useState(null); 

  // 1. 공지사항 불러오기 (axios -> api 변경)
  const loadNotices = async (page = 0) => {
    try {
      const res = await api.get(`/api/admin/notices?page=${page}&size=10`);
      setNotices(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("공지사항 로딩 실패", err);
    }
  };

  useEffect(() => { loadNotices(0); }, []);

  const resetForm = () => {
    setFormData({ noticeId: null, title: "", content: "", isPinned: false });
    setEditMode(false);
    setShowForm(false);
  };

  const handleCreateClick = () => {
    resetForm();
    setExpandedId(null);
    setShowForm(true);
  };

  const handleEditClick = (notice) => {
    setFormData({
      noticeId: notice.noticeId,
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned === true || notice.pinned === true
    });
    setEditMode(true);
    setShowForm(true);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 2. 작성 및 수정 완료 (axios -> api 변경)
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned
      };

      if (editMode) {
        await api.put(`/api/admin/notices/${formData.noticeId}`, payload);
        alert("공지사항이 수정되었습니다.");
      } else {
        await api.post("/api/admin/notices", payload);
        alert("공지사항이 등록되었습니다.");
      }
      resetForm();
      loadNotices(currentPage);
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 3. 삭제 처리 (axios -> api 변경)
  const handleDelete = async (noticeId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/admin/notices/${noticeId}`);
      alert("삭제되었습니다.");
      loadNotices(currentPage);
    } catch (err) {
      alert("삭제 실패");
    }
  };

  const toggleExpand = (noticeId) => {
    setExpandedId(expandedId === noticeId ? null : noticeId);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>공지사항 관리</div>
        <div className={styles.headerSubtitle}>공지사항을 등록하고 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          {!showForm && (
            <button className={styles.registerBtn} onClick={handleCreateClick}>
              + 공지 등록
            </button>
          )}
        </div>

        {/* 🌟 폼 (Inline Form) */}
        {showForm && (
          <div className={styles.form}>
            <div className={styles.formHeader}>
              <h3>{editMode ? "📝 공지사항 수정" : "✨ 새 공지사항 작성"}</h3>
            </div>
            
            <div className={styles.formGroup}>
              <div className={styles.formLabel}>제목</div>
              <input 
                placeholder="공지 제목 입력" 
                className={styles.formInput} 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className={styles.formGroup}>
              <div className={styles.formLabel}>내용</div>
              <textarea 
                rows={6} 
                placeholder="공지 내용 입력" 
                className={styles.formTextarea} 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>

            <div className={styles.formGroupCheckbox}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                />
                📌 중요 공지로 상단에 고정하기
              </label>
            </div>

            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={resetForm}>취소</button>
              <button className={styles.submitBtn} onClick={handleSubmit}>
                {editMode ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        )}

        {/* 🌟 공지사항 리스트 */}
        <div className={styles.noticeList}>
          {notices.length === 0 && !showForm && (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>등록된 공지가 없습니다.</div>
          )}
          
          {notices.map(n => {
            // 🌟 백엔드 데이터 방어 로직: isPinned 또는 pinned 둘 중 하나라도 true면 고정으로 판단
            const isNoticePinned = n.isPinned === true || n.pinned === true;

            return (
              <div
                key={n.noticeId}
                className={`${styles.noticeCard} ${isNoticePinned ? styles.pinnedCard : ""}`}
                onClick={() => toggleExpand(n.noticeId)} 
              >
                <div className={styles.noticeCardTop}>
                  <div className={styles.noticeInfo}>
                    {/* 🌟 방어 로직 변수로 체크 */}
                    {isNoticePinned && <span className={styles.pinBadge}>📢 필독 공지</span>}
                    
                    <div className={isNoticePinned ? styles.pinnedTitle : styles.noticeTitle}>
                      {n.title}
                    </div>
                    
                    <div className={styles.noticeDate}>{n.createdAt?.split('T')[0]} | 조회수: {n.viewCount || 0}</div>
                  </div>
                  
                  <div className={styles.noticeActions} onClick={e => e.stopPropagation()}>
                    <button className={styles.editBtn} onClick={() => handleEditClick(n)}>수정</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(n.noticeId)}>삭제</button>
                  </div>
                </div>

                {expandedId === n.noticeId && (
                  <div className={styles.expandedContent}>
                    {n.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => loadNotices(currentPage - 1)} disabled={currentPage === 0}>◀ 이전</button>
            <span className={styles.pageInfo}>{currentPage + 1} / {totalPages}</span>
            <button className={styles.pageBtn} onClick={() => loadNotices(currentPage + 1)} disabled={currentPage === totalPages - 1}>다음 ▶</button>
          </div>
        )}
      </div>
    </div>
  );
}
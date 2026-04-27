import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/axios" 
import styles from "../styles/MyCommentPage.module.css"

export default function MyCommentPage() { 
  const navigate = useNavigate()
  
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 🌟 탭 상태
  const [activeTab, setActiveTab] = useState("ALL")

  // 🌟 수정 상태
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")

  // ==========================================
  // 1. 데이터 불러오기
  // ==========================================
  const fetchMyComments = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/my/comments") 
      setComments(response.data.content || response.data || [])
    } catch (error) {
      console.error("댓글 목록 불러오기 실패:", error);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyComments()
  }, [])

  // ==========================================
  // 2. 🌟 완벽한 탭 필터링 방어 로직 (RecentContentPage와 100% 동일)
  // ==========================================
  const filteredComments = comments.filter((cm) => {
    if (activeTab === "ALL") return true;
    
    // 백엔드에서 온 타입 글자를 무조건 대문자로 바꾸고 공백 제거
    const type = cm.contentType ? cm.contentType.toUpperCase().trim() : "";

    if (activeTab === "WEBTOON") {
      return type === "WEBTOON" || type === "웹툰";
    }
    
    if (activeTab === "WEB_NOVEL") {
      return type === "WEB_NOVEL" || type === "WEBNOVEL" || type === "NOVEL" || type === "웹소설";
    }
    
    return false;
  });

  // ==========================================
  // 3. 댓글 삭제 & 수정 로직
  // ==========================================
  const handleDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까? (답글은 유지됩니다)")) return;

    try {
      await api.delete(`/api/comments/${commentId}`)
      setComments(prev => prev.filter(cm => cm.id !== commentId))
      alert("댓글이 삭제되었습니다.")
    } catch (error) {
      console.error("댓글 삭제 실패:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleEditStart = (cm) => {
    setEditingId(cm.id)
    setEditText(cm.content)
  }

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    
    try {
      await api.put(`/api/comments/${commentId}`, { commentText: editText })
      setComments(comments.map(cm => 
        cm.id === commentId ? { ...cm, content: editText } : cm
      ))
      setEditingId(null)
      alert("댓글이 수정되었습니다.")
    } catch (error) {
      console.error("댓글 수정 실패:", error)
      alert("수정 중 오류가 발생했습니다.")
    }
  }

  // ==========================================
  // 4. 뷰어 이동 및 포커싱 (Routing)
  // ==========================================
  const goViewerAndFocus = (cm) => {
    const type = cm.contentType ? cm.contentType.toUpperCase().trim() : ""
    const isNovel = type === "WEB_NOVEL" || type === "WEBNOVEL" || type === "NOVEL" || type === "웹소설"
    const viewerType = isNovel ? "novel" : "webtoon"

    navigate(`/${viewerType}/viewer/${cm.episodeId}?contentId=${cm.contentId}&focusComment=${cm.id}`)
  }

  // ==========================================
  // UI 렌더링
  // ==========================================
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ padding: "50px", textAlign: "center", color: "#90A4C8" }}>
          댓글 목록을 불러오는 중입니다...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내가 쓴 댓글</div>
      </div>

      {/* 🌟 수정완료: 완벽한 중앙 정렬 + 밑줄 탭 메뉴 (RecentContentPage 100% 동기화) */}
      <div className={styles.tabMenu}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "ALL" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("ALL")}
        >
          전체
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "WEBTOON" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("WEBTOON")}
        >
          웹툰
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "WEB_NOVEL" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("WEB_NOVEL")}
        >
          웹소설
        </button>
      </div>
      
      <div className={styles.content}>
        {filteredComments.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#90A4C8", fontSize: "14px" }}>
            해당하는 댓글이 없습니다.
          </div>
        ) : (
          filteredComments.map(cm => (
            <div key={cm.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLink} onClick={() => goViewerAndFocus(cm)}>
                  {cm.contentTitle} · {cm.episode}
                </span>
                <span className={styles.cardDate}>{cm.date}</span>
              </div>
              
              {/* 수정 모드 UI */}
              {editingId === cm.id ? (
                <div className={styles.editContainer}>
                  <textarea 
                    value={editText} 
                    onChange={e => setEditText(e.target.value)}
                    className={styles.editInput}
                  />
                  <div className={styles.editActionRow}>
                    <button onClick={() => setEditingId(null)} className={styles.editCancelBtn}>취소</button>
                    <button onClick={() => handleEditSubmit(cm.id)} className={styles.editSaveBtn}>저장</button>
                  </div>
                </div>
              ) : (
                /* 기본 댓글 UI */
                <>
                  <div className={styles.cardText}>{cm.content}</div>
                  <div className={styles.cardActions}>
                    {/* 🌟 수정완료: 삭제 버튼과 디자인이 통일된 수정 버튼 */}
                    <button onClick={() => handleEditStart(cm)} className={styles.editBtn}>
                      수정
                    </button>
                    <button onClick={() => handleDelete(cm.id)} className={styles.deleteBtn}>
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
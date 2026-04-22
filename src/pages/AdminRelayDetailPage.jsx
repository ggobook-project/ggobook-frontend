import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "../styles/AdminRelayPage.module.css";

export default function AdminRelayDetailPage() {
  const { novelId } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [entries, setEntries] = useState([]);
  const [novelInfo, setNovelInfo] = useState({});

  // ==========================================
  // [API 연동] 특정 소설의 상세 정보와 이어쓰기 목록 가져오기
  // ==========================================
  const loadEntries = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/relay-novels/${novelId}`);
      setNovelInfo(response.data);
      // 백엔드 구조에 따라 entry 리스트 추출 (방어 코드 포함)
      setEntries(response.data.entries || []); 
    } catch (error) {
      console.error("이어쓰기 목록을 불러오지 못했습니다.", error);
    }
  }, [novelId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // ==========================================
  // [기능 구현] 특정 회차(Entry) 블라인드 처리
  // ==========================================
  const handleBlindEntry = async (entryId) => {
    // 실무 UX: 삭제가 아닌 '가림' 처리이므로, 독자에게 보여줄 안내 문구를 필수로 받습니다.
    const safeSummary = window.prompt("이 회차를 블라인드합니다. 독자들에게 보여질 건전한 요약본을 입력하세요.\n(예: 부적절한 내용으로 관리자에 의해 가려졌습니다.)");
    
    if (!safeSummary) return; // 관리자가 입력을 취소하면 실행 중단

    try {
      await axios.put(`http://localhost:8080/api/admin/relay-entries/${entryId}/blind`, {
        adminMessage: safeSummary
      });
      alert("해당 회차가 성공적으로 블라인드 처리되었습니다.");
      loadEntries(); // 데이터 새로고침 (블라인드된 UI로 변경됨)
    } catch (error) {
      console.error("블라인드 실패", error);
      alert("블라인드 처리 중 서버 오류가 발생했습니다.");
    }
  };

  // ==========================================
  // [UI 렌더링] 화면 출력부
  // ==========================================
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        {/* 새로운 CSS 클래스가 적용된 예쁜 뒤로가기 버튼 */}
        <button onClick={() => navigate(-1)} className={styles.backBtn}>➔ 목록으로 돌아가기</button>
        <div className={styles.headerTitle}>소설 상세 및 이어쓰기 검열</div>
        <div className={styles.headerSubtitle}>
          [{novelInfo.title || "로딩 중..."}] 소설의 각 회차를 꼼꼼히 확인하세요.
        </div>
      </div>

      <div className={styles.content}>
        {entries.length === 0 ? <p style={{color: "#666", textAlign: "center"}}>아직 이어쓰기 원고가 등록되지 않았습니다.</p> : 
          entries.map(entry => (
            // 새로운 CSS 클래스(detailCard) 적용
            <div key={entry.entryId} className={styles.detailCard}>
              
              <div className={styles.entryMeta}>
                {entry.entryOrder}번째 이어쓰기 (작성자 ID: {entry.userId})
              </div>
              
              {/* 🌟 조건부 렌더링: 상태가 BLINDED 이면 빨간 요약 박스를, 아니면 원본 텍스트를 보여줍니다. */}
              {entry.status === "BLINDED" ? (
                <div className={styles.blindedBox}>
                  🚨 <strong>[관리자에 의해 블라인드 처리됨]</strong> <br/><br/>
                  관리자 코멘트: {entry.adminMessage}
                </div>
              ) : (
                <div className={styles.entryText}>{entry.entryText}</div>
              )}

              {/* 블라인드 되지 않은 정상 원고에만 블라인드 버튼을 노출합니다. */}
              {entry.status !== "BLINDED" && (
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => handleBlindEntry(entry.entryId)}
                    className={styles.blindBtn}
                  >
                    이 회차 블라인드 처리
                  </button>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}
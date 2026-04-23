import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "../styles/AdminRelayPage.module.css";

export default function AdminRelayDetailPage() {
  const { novelId } = useParams();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState([]);
  const [novelInfo, setNovelInfo] = useState({});
  const [errorStatus, setErrorStatus] = useState(null); 
  
  // 🌟 AI 통신은 시간이 걸리므로 버튼을 비활성화하기 위한 로딩 상태 추가!
  const [blindingId, setBlindingId] = useState(null); 

  const loadEntries = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/relay-novels/${novelId}`);
      
      let responseData = response.data;
      if (typeof responseData === 'string') {
        try { responseData = JSON.parse(responseData); } catch (e) {}
      }

      const data = responseData.data || responseData.content || responseData;
      setNovelInfo(data);
      setEntries(data.entries || data.relayEntries || data.entryList || []); 
      setErrorStatus(null);
    } catch (error) {
      console.error("상세 정보 에러:", error);
      setErrorStatus("데이터를 불러오지 못했습니다. 서버 상태를 확인해주세요.");
    }
  }, [novelId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // ==========================================
  // 🌟 원클릭 AI 자동 블라인드 로직
  // ==========================================
  const handleBlindEntry = async (entryId) => {
    // 1. 직접 입력 대신 의사만 묻습니다.
    if (!window.confirm("이 회차를 블라인드 처리하시겠습니까?\n(AI가 부적절한 내용을 필터링하여 안전한 요약본으로 대체합니다.)")) return;

    setBlindingId(entryId); // 로딩 시작 (해당 회차의 버튼을 'AI 요약 중...'으로 변경)

    try {
      // 2. 백엔드로 '빈 문자열'을 보냅니다. 
      // (백엔드의 AdminRelayService가 빈 값을 감지하고 파이썬 AI서버로 요약을 요청할 것입니다!)
      await axios.put(`http://localhost:8080/api/admin/relay-entries/${entryId}/blind`, { 
        adminMessage: "" 
      });
      
      alert("AI 요약 및 블라인드 처리가 성공적으로 완료되었습니다.");
      loadEntries(); // 데이터 최신화 (AI 요약본이 화면에 뜹니다)
    } catch (error) {
      console.error("블라인드 실패", error);
      alert("블라인드 처리 중 서버 오류가 발생했습니다. 파이썬 AI 서버가 켜져 있는지 확인해주세요.");
    } finally {
      setBlindingId(null); // 로딩 종료
    }
  };

  const displayTitle = novelInfo.title || (novelInfo.relayTopic && novelInfo.relayTopic.adminTopic ? novelInfo.relayTopic.adminTopic.title : "") || novelInfo.description || "로딩 중...";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>➔ 목록으로 돌아가기</button>
        <div className={styles.headerTitle}>소설 상세 및 이어쓰기 검열</div>
        <div className={styles.headerSubtitle}>
          [{displayTitle}] 소설의 각 회차를 꼼꼼히 확인하세요.
        </div>
      </div>

      <div className={styles.content}>
        {errorStatus ? (
          <div style={{ color: "red", textAlign: "center", padding: "40px", fontWeight: "bold", background: "#fee", borderRadius: "8px" }}>
            🚨 {errorStatus}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            <p style={{ color: "#64748b", fontSize: "16px" }}>아직 이어쓰기 원고가 등록되지 않았습니다.</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.entryId || index} className={styles.detailCard}>
              <div className={styles.entryMeta}>
                {entry.entryOrder || index + 1}번째 이어쓰기 (작성자 ID: {entry.userId || entry.authorId || entry.user_id || "미상"})
              </div>
              
              {entry.status === "BLINDED" ? (
                <div className={styles.blindedBox}>
                  🚨 <strong>[가이드라인 위반으로 블라인드 처리된 회차입니다.]</strong> <br/><br/>
                  <span style={{ color: "#555", fontSize: "14px" }}>
                    <strong>🤖 AI 자동 요약본: </strong> {entry.adminMessage || entry.blindMessage}
                  </span>
                </div>
              ) : (
                <div className={styles.entryText}>{entry.entryText || entry.entry_text || entry.content}</div>
              )}

              {entry.status !== "BLINDED" && (
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => handleBlindEntry(entry.entryId || entry.entry_id)} 
                    className={styles.blindBtn}
                    disabled={blindingId === (entry.entryId || entry.entry_id)} // 🌟 로딩 중 버튼 클릭 방지
                    style={{ 
                      backgroundColor: blindingId === (entry.entryId || entry.entry_id) ? "#94a3b8" : "#ef4444",
                      cursor: blindingId === (entry.entryId || entry.entry_id) ? "wait" : "pointer"
                    }}
                  >
                    {/* 🌟 로딩 중일 때는 텍스트를 바꿔줍니다. */}
                    {blindingId === (entry.entryId || entry.entry_id) ? "🤖 AI 요약 중..." : "이 회차 블라인드 (AI 자동 요약)"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
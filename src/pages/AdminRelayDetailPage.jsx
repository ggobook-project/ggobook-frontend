import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios"; // 🌟 공통 인스턴스
import styles from "../styles/AdminRelayPage.module.css";
import { useAlert } from "../context/AlertContext";

export default function AdminRelayDetailPage() {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const [entries, setEntries] = useState([]);
  const [novelInfo, setNovelInfo] = useState({});
  const [errorStatus, setErrorStatus] = useState(null); 
  const [blindingId, setBlindingId] = useState(null); 

  const loadEntries = useCallback(async () => {
    try {
      const response = await api.get(`/api/admin/relay-novels/${novelId}`);
      const data = response.data.data || response.data.content || response.data;
      setNovelInfo(data);
      setEntries(data.entries || data.relayEntries || data.entryList || []); 
      setErrorStatus(null);
    } catch (error) {
      setErrorStatus("데이터를 불러오지 못했습니다.");
    }
  }, [novelId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleBlindEntry = async (entryId) => {
    const ok = await showConfirm("이 회차를 AI 요약 및 블라인드 처리하시겠습니까?");
    if (!ok) return;
    setBlindingId(entryId);

    try {
      await api.put(`/api/admin/relay-entries/${entryId}/blind`, { adminMessage: "" });
      await showAlert("블라인드 처리가 완료되었습니다.", "success");
      loadEntries();
    } catch (error) {
      await showAlert("서버 오류가 발생했습니다.", "error");
    } finally {
      setBlindingId(null);
    }
  };

  const displayTitle = novelInfo.title || (novelInfo.relayTopic && novelInfo.relayTopic.adminTopic ? novelInfo.relayTopic.adminTopic.title : "") || novelInfo.description || "로딩 중...";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
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
                {entry.entryOrder || index + 1}번째 이어쓰기 (작성자: {entry.nickname || "미상"})
              </div>
              
              {entry.status === "BLINDED" ? (
                <div className={styles.blindedBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "10px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 18h14"/><path d="M17 18v-5a5 5 0 0 0-10 0v5"/><path d="M2 13h2"/><path d="M20 13h2"/><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 6.34 1.41-1.41"/>
                    </svg>
                    [가이드라인 위반으로 블라인드 처리된 회차입니다.]
                  </div>
                  <span style={{ color: "#555", fontSize: "14px" }}>
                    <strong>AI 자동 요약본: </strong> {entry.adminMessage || entry.blindMessage}
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
                    {blindingId === (entry.entryId || entry.entry_id) ? "AI 요약 중..." : "이 회차 블라인드 (AI 자동 요약)"}
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
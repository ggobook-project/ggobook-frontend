import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/AdminRelayPage.module.css";

export default function AdminRelayPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("릴레이 목록");

  const [relays, setRelays] = useState([]);
  const [topics, setTopics] = useState([]);

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");

  const [guideline, setGuideline] = useState("");
  const [isEditingGuide, setIsEditingGuide] = useState(false);
  const [editGuideText, setEditGuideText] = useState("");

  const extractDataList = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.content)) return responseData.content;
    if (responseData && Array.isArray(responseData.data)) return responseData.data;
    return [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    return dateString.split('T')[0];
  };

  const loadRelayNovels = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/relay-novels");
      setRelays(extractDataList(response.data));
    } catch (error) {
      console.error("릴레이 목록 불러오기 실패:", error);
    }
  };

  const loadAdminTopics = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/relay-topics");
      setTopics(extractDataList(response.data));
    } catch (error) {
      console.error("주제 목록 불러오기 실패:", error);
    }
  };

  const loadGuideline = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/relay-guideline");
      setGuideline(response.data || "등록된 가이드라인이 없습니다.");
    } catch (error) {
      console.error("가이드라인 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (tab === "릴레이 목록") loadRelayNovels();
    else if (tab === "주제 관리") loadAdminTopics();
    else if (tab === "단일 가이드라인") loadGuideline();
  }, [tab]);

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) { alert("주제 제목을 입력해주세요."); return; }
    try {
      await axios.post("http://localhost:8080/api/admin/relay-topics", {
        title: newTopicTitle.trim(),
        description: newTopicDesc.trim() || "관리자가 등록한 공식 주제입니다.",
      });
      alert("새 주제가 등록되었습니다.");
      setNewTopicTitle("");
      setNewTopicDesc("");
      loadAdminTopics();
    } catch (error) {
      alert("주제 등록 실패");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("정말 이 주제를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/relay-topics/${topicId}`);
      loadAdminTopics();
    } catch (error) {
      alert("삭제 실패");
    }
  };

  const handleSaveGuide = async () => {
    try {
      await axios.put("http://localhost:8080/api/admin/relay-guideline", { content: editGuideText.trim() });
      setGuideline(editGuideText);
      setIsEditingGuide(false);
      alert("저장되었습니다.");
    } catch (error) {
      alert("저장 실패");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설 관리</div>
        <div className={styles.headerSubtitle}>릴레이 소설과 주제, 가이드라인을 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {["릴레이 목록", "주제 관리", "단일 가이드라인"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "릴레이 목록" && relays.map(r => (
          <div key={r.relayNovelId || r.novelId || r.id} className={styles.relayCard}>
            <div className={styles.relayCardInfo}>
              <div className={styles.relayCardTitle}>{r.title || "제목 없음"}</div>
              <div className={styles.relayCardDesc}>{r.description || "등록된 설명이 없습니다."}</div>
              <div className={styles.relayCardMeta}>작성자 ID: {r.userId || "미상"} · {formatDate(r.createdAt)}</div>
            </div>
            <button className={styles.relayCardBtn} onClick={() => navigate(`/admin/relay/detail/${r.relayNovelId || r.novelId || r.id}`)}>상세 보기 ➔</button>
          </div>
        ))}

        {tab === "주제 관리" && (
          <>
            <div className={styles.topicForm}>
              <div className={styles.topicInputRow}>
                <input placeholder="새 주제 입력" className={styles.topicInput} value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} />
                <button className={styles.registerBtn} onClick={handleAddTopic}>등록</button>
              </div>
              <input placeholder="주제 설명 (선택사항)" className={styles.topicInput} style={{ marginTop: "10px", width: "100%" }} value={newTopicDesc} onChange={e => setNewTopicDesc(e.target.value)} />
            </div>
            {topics.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>등록된 관리자 주제가 없습니다.</div>
            ) : (
              topics.map(t => (
                <div key={t.adminTopicId || t.topicId || t.id} className={styles.card}>
                  <div>
                    <div className={styles.cardTitle}>{t.title || t.topicName || "주제 제목 없음"}</div>
                    <div className={styles.cardMeta}>{t.description} · {formatDate(t.createdAt)}</div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteTopic(t.adminTopicId || t.topicId || t.id)}>삭제</button>
                </div>
              ))
            )}
          </>
        )}

        {tab === "단일 가이드라인" && (
          <div className={styles.guideContainer}>
            <h3>공식 가이드라인</h3>
            {isEditingGuide ? (
              <>
                <textarea className={styles.guideTextarea} value={editGuideText} onChange={e => setEditGuideText(e.target.value)} />
                <div className={styles.guideActions}>
                  <button className={styles.cancelBtn} onClick={() => setIsEditingGuide(false)}>취소</button>
                  <button className={styles.registerBtn} onClick={handleSaveGuide}>저장</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.guideViewContent}>{guideline}</div>
                <div className={styles.guideActions}>
                  <button className={styles.editBtn} onClick={() => { setIsEditingGuide(true); setEditGuideText(guideline); }}>수정</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
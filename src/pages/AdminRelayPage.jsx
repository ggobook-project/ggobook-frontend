import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/AdminRelayPage.module.css";

const initialGuidelines = [
  { id: 1, title: "분량 가이드", content: "각 이어쓰기는 50자 이상 500자 이내로 작성해주세요." },
  { id: 2, title: "내용 가이드", content: "이전 내용의 흐름을 자연스럽게 이어가야 합니다." },
  { id: 3, title: "금지 사항", content: "폭력적이거나 선정적인 내용은 작성할 수 없습니다." },
];

export default function AdminRelayPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("릴레이 목록");

  const [relays, setRelays] = useState([]);
  const [topics, setTopics] = useState([]);

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");

  const [guidelines, setGuidelines] = useState(initialGuidelines);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const loadRelayNovels = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/relay-novels");
      const data = response.data
      const dataList = Array.isArray(data) ? data : (data.content ? data.content : [])
      setRelays(dataList);
    } catch (error) {
      console.error("릴레이 소설 목록을 불러오지 못했습니다.", error);
      setRelays([]);
    }
  };

  const loadAdminTopics = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/relay-topics");
      const data = response.data
      const dataList = Array.isArray(data) ? data : (data.content ? data.content : [])
      setTopics(dataList);
    } catch (error) {
      console.error("관리자 주제 목록을 불러오지 못했습니다.", error);
      setTopics([]);
    }
  };

  useEffect(() => {
    if (tab === "릴레이 목록") loadRelayNovels();
    if (tab === "주제 관리") loadAdminTopics();
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
      console.error("주제 등록 실패", error);
      alert("주제 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("정말 이 주제를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/relay-topics/${topicId}`);
      alert("삭제되었습니다.");
      loadAdminTopics();
    } catch (error) {
      console.error("주제 삭제 실패", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setGuidelines(prev => [...prev, { id: Date.now(), title: newTitle.trim(), content: newContent.trim() }]);
    setNewTitle("");
    setNewContent("");
  };

  const handleEditStart = (g) => { setEditingId(g.id); setEditTitle(g.title); setEditContent(g.content); };

  const handleEditSave = (id) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setGuidelines(prev => prev.map(g => g.id === id ? { ...g, title: editTitle.trim(), content: editContent.trim() } : g));
    setEditingId(null);
  };

  const handleEditCancel = () => setEditingId(null);
  const handleDelete = (id) => setGuidelines(prev => prev.filter(g => g.id !== id));

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설 관리</div>
        <div className={styles.headerSubtitle}>릴레이 소설과 주제를 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {["릴레이 목록", "주제 관리", "가이드라인"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}
            >{t}</button>
          ))}
        </div>

        {/* 릴레이 목록 */}
        {tab === "릴레이 목록" && (
          relays.length === 0
            ? <div style={{ padding: "20px", textAlign: "center", color: "#90A4C8", fontSize: 14 }}>등록된 릴레이 소설이 없습니다.</div>
            : relays.map(r => (
              <div key={r.relayNovelId || r.id} className={styles.card}>
                <div>
                  <div className={styles.cardTitle}>{r.title}</div>
                  <div className={styles.cardMeta}>
                    작성자 ID: {r.userId} · 생성일: {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
                <button
                  className={styles.detailBtn}
                  onClick={() => navigate(`/admin/relay/detail/${r.relayNovelId || r.id}`)}
                >상세 보기 →</button>
              </div>
            ))
        )}

        {/* 주제 관리 */}
        {tab === "주제 관리" && (
          <>
            <div className={styles.topicForm}>
              <div className={styles.topicInputRow}>
                <input
                  placeholder="새 주제 입력 (예: 좀비 아포칼립스)"
                  className={styles.topicInput}
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddTopic()}
                />
                <button className={styles.registerBtn} onClick={handleAddTopic}>등록</button>
              </div>
              <input
                placeholder="주제 설명 (선택사항)"
                className={styles.topicInput}
                style={{ marginTop: "10px", width: "100%", boxSizing: "border-box" }}
                value={newTopicDesc}
                onChange={e => setNewTopicDesc(e.target.value)}
              />
            </div>
            {topics.length === 0
              ? <div style={{ padding: "20px", textAlign: "center", color: "#90A4C8", fontSize: 14 }}>등록된 관리자 주제가 없습니다.</div>
              : topics.map(t => (
                <div key={t.topicId || t.id} className={styles.card}>
                  <div>
                    <div className={styles.cardTitle}>{t.title}</div>
                    <div className={styles.cardMeta}>
                      {t.description} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}
                    </div>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteTopic(t.topicId || t.id)}>삭제</button>
                </div>
              ))
            }
          </>
        )}

        {/* 가이드라인 */}
        {tab === "가이드라인" && (
          <>
            <div className={styles.topicForm}>
              <div className={styles.guideFormTitle}>새 가이드라인 추가</div>
              <div className={styles.topicInputRow}>
                <input
                  placeholder="제목"
                  className={styles.topicInput}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <textarea
                placeholder="가이드라인 내용을 입력하세요"
                className={styles.guideTextarea}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
              <div className={styles.guideFormActions}>
                <button className={styles.registerBtn} onClick={handleAdd}>추가</button>
              </div>
            </div>

            {guidelines.map(g => (
              <div key={g.id} className={styles.guideCard}>
                {editingId === g.id ? (
                  <>
                    <input
                      className={styles.topicInput}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{ marginBottom: 8, width: "100%", boxSizing: "border-box" }}
                    />
                    <textarea
                      className={styles.guideTextarea}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    />
                    <div className={styles.guideCardActions}>
                      <button className={styles.registerBtn} onClick={() => handleEditSave(g.id)}>저장</button>
                      <button className={styles.cancelBtn} onClick={handleEditCancel}>취소</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.guideCardHeader}>
                      <div className={styles.cardTitle}>{g.title}</div>
                      <div className={styles.guideCardActions}>
                        <button className={styles.editBtn} onClick={() => handleEditStart(g)}>수정</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(g.id)}>삭제</button>
                      </div>
                    </div>
                    <div className={styles.guideContent}>{g.content}</div>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
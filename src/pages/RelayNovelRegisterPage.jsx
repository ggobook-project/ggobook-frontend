import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/axios" // 🌟 인터셉터가 적용된 우리만의 전용 요원
import styles from "../styles/RelayNovelRegisterPage.module.css"

const MAX_CHARS = 500
const MIN_CHARS = 50

export default function RelayNovelRegisterPage() {
  const navigate = useNavigate()
  
  // 상태 관리
  const [useAdminTopic, setUseAdminTopic] = useState(false)
  const [adminTopics, setAdminTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startText, setStartText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. 데이터 로딩 (api 인스턴스 사용)
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await api.get("/api/admin/relay-topics")
        setAdminTopics(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    }
    loadTopics()
  }, [])

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic)
    setTitle(topic.title)
    setDescription(topic.description)
  }

  // 2. 폼 제출 로직 (락 및 검증 포함)
  const handleSubmit = async () => {
    if (useAdminTopic && !selectedTopic) { alert("주제를 선택해주세요."); return }
    // 글자 수 검증
    if (startText.length < MIN_CHARS || startText.length > MAX_CHARS) {
      alert(`시작 내용은 ${MIN_CHARS}자 이상 ${MAX_CHARS}자 이하로 작성해주세요.`);
      return;
    }
    if (!title.trim() || !startText.trim()) { alert("모든 항목을 입력해주세요."); return }

    try {
      setIsSubmitting(true)
      
      const body = {
        adminTopicId: useAdminTopic ? selectedTopic.adminTopicId : null,
        novelTitle: title,
        customTitle: !useAdminTopic ? title : null,
        customDescription: description,
        firstEntryText: startText
      }

      // 🌟 헤더를 직접 넣지 않아도 인터셉터가 토큰을 자동 처리합니다.
      await api.post("/api/relay-novels", body)
      
      alert("릴레이 소설이 등록되었습니다!")
      navigate("/relay")
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 글자 수 색상 함수
  const charColor = () => {
    if (startText.length < MIN_CHARS || startText.length > MAX_CHARS) return "#E53935"
    return "#2196F3"
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설 등록</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          {/* 주제 관리 섹션 */}
          <div className={styles.formGroup}>
            <div className={styles.topicToggleRow}>
              <div className={styles.label}>관리자 주제 사용</div>
              <button
                onClick={() => { 
                    setUseAdminTopic(!useAdminTopic); 
                    setSelectedTopic(null); 
                    setTitle(""); setDescription(""); 
                }}
                className={`${styles.toggleBtn} ${useAdminTopic ? styles.toggleBtnActive : ""}`}
              >{useAdminTopic ? "ON" : "OFF"}</button>
            </div>

            {useAdminTopic && (
              <div className={styles.adminTopicContainer}>
                <div className={styles.topicList}>
                  {adminTopics.map(topic => (
                    <div 
                      key={topic.adminTopicId} 
                      onClick={() => handleSelectTopic(topic)}
                      className={`${styles.topicItem} ${selectedTopic?.adminTopicId === topic.adminTopicId ? styles.topicItemActive : ""}`}
                    >
                      <strong>{topic.title}</strong>
                      <p className={styles.topicDesc}>{topic.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 입력 폼 섹션 */}
          <div className={styles.formGroup}>
            <div className={styles.label}>제목</div>
            <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} readOnly={useAdminTopic} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.label}>주제 설명</div>
            <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} readOnly={useAdminTopic} />
          </div>

          {/* 1회차 시작 내용 (글자 수 표시 기능 포함) */}
          <div className={styles.formGroup}>
            <div className={styles.label}>1회차 시작 내용</div>
            <textarea 
              className={styles.textarea} 
              rows={6} 
              value={startText} 
              onChange={e => setStartText(e.target.value)} 
              maxLength={MAX_CHARS + 50}
            />
            <div className={styles.charCountWrap} style={{ marginTop: "8px", textAlign: "right" }}>
              <span style={{ color: charColor(), fontWeight: 600 }}>{startText.length}</span>
              <span className={styles.charCountSep}> / {MAX_CHARS}자</span>
              {startText.length < MIN_CHARS && startText.length > 0 && (
                <span style={{ color: "#E53935", marginLeft: "10px" }}>({MIN_CHARS - startText.length}자 더 필요)</span>
              )}
            </div>
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  )
}
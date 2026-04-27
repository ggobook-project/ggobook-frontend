import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import styles from "../styles/RelayNovelRegisterPage.module.css"

export default function RelayNovelRegisterPage() {
  const navigate = useNavigate()
  const [useAdminTopic, setUseAdminTopic] = useState(false)
  const [adminTopics, setAdminTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startText, setStartText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. 데이터 로딩 (필수 확인: API 경로와 서버 설정)
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/relay-topics", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        })
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

  const handleSubmit = async () => {
    if (useAdminTopic && !selectedTopic) { alert("주제를 선택해주세요."); return }
    if (!title.trim() || !startText.trim()) { alert("모든 항목을 입력해주세요."); return }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("accessToken")
      
      const body = {
        adminTopicId: useAdminTopic ? selectedTopic.adminTopicId : null,
        novelTitle: title,
        customTitle: !useAdminTopic ? title : null,
        customDescription: description,
        firstEntryText: startText
      }

      await axios.post("http://localhost:8080/api/relay-novels", body, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert("릴레이 소설이 등록되었습니다!")
      navigate("/relay")
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
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

          <div className={styles.formGroup}>
            <div className={styles.label}>1회차 시작 내용</div>
            <textarea className={styles.textarea} rows={6} value={startText} onChange={e => setStartText(e.target.value)} />
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  )
}
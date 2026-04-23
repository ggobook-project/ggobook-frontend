import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import styles from "../styles/RelayNovelRegisterPage.module.css"

export default function RelayNovelRegisterPage() {
  const navigate = useNavigate()
  const [useAdminTopic, setUseAdminTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [adminTopics, setAdminTopics] = useState([])
  const [title, setTitle] = useState("")
  const [startText, setStartText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/relay-topics")
        const data = response.data
        const list = Array.isArray(data) ? data : (data.content ? data.content : [])
        setAdminTopics(list)
      } catch {
        setAdminTopics([
          { topicId: 1, title: "사랑에 빠진 두 사람" },
          { topicId: 2, title: "마법사의 비밀" },
          { topicId: 3, title: "미래 도시의 탐정" },
        ])
      }
    }
    loadTopics()
  }, [])

  const handleSubmit = async () => {
    if (useAdminTopic && !selectedTopic) { alert("주제를 선택해주세요."); return }
    if (!useAdminTopic && !title.trim()) { alert("제목을 입력해주세요."); return }
    if (!useAdminTopic && !startText.trim()) { alert("시작 내용을 입력해주세요."); return }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("accessToken")
      const body = useAdminTopic
        ? { topicId: selectedTopic.topicId }
        : { title: title.trim(), startText: startText.trim() }

      await axios.post("http://localhost:8080/api/relay-novels", body, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert("릴레이 소설이 등록되었습니다!")
      navigate("/relay")
    } catch {
      alert("등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>릴레이 소설 등록</div>
        <div className={styles.headerSubtitle}>새로운 릴레이 소설을 시작하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>

          {/* 관리자 주제 토글 */}
          <div className={styles.formGroup}>
            <div className={styles.topicToggleRow}>
              <div className={styles.label}>관리자 주제 사용</div>
              <button
                onClick={() => { setUseAdminTopic(!useAdminTopic); setSelectedTopic(null) }}
                className={`${styles.toggleBtn} ${useAdminTopic ? styles.toggleBtnActive : ""}`}
              >{useAdminTopic ? "ON" : "OFF"}</button>
            </div>

            {useAdminTopic && (
              <div className={styles.topicList}>
                {adminTopics.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#90A4C8", padding: "12px 0" }}>
                    등록된 관리자 주제가 없습니다.
                  </div>
                ) : (
                  adminTopics.map(topic => (
                    <div
                      key={topic.topicId || topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`${styles.topicItem} ${selectedTopic?.topicId === (topic.topicId || topic.id) ? styles.topicItemActive : ""}`}
                    >
                      <span>{topic.title}</span>
                      {selectedTopic?.topicId === (topic.topicId || topic.id) && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 직접 입력 */}
          {!useAdminTopic && (
            <>
              <div className={styles.formGroup}>
                <div className={styles.label}>제목</div>
                <input
                  placeholder="릴레이 소설 제목 입력"
                  className={styles.input}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.label}>시작 내용</div>
                <textarea
                  placeholder="이야기의 시작을 써주세요..."
                  rows={6}
                  className={styles.textarea}
                  value={startText}
                  onChange={e => setStartText(e.target.value)}
                />
              </div>
            </>
          )}

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate("/relay")}>취소</button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >{isSubmitting ? "등록 중..." : "등록하기"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
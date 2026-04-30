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
  const [formatLoading, setFormatLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const handleFormatDialogue = async () => {
    if (!startText.trim()) { alert("내용을 먼저 입력해주세요."); return }
    try {
      setFormatLoading(true)
      const res = await fetch("http://localhost:8000/api/novel/format-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: startText }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStartText(data.formatted_text)
    } catch {
      alert("AI 변환에 실패했습니다. LLM 서버가 실행 중인지 확인해주세요.")
    } finally {
      setFormatLoading(false)
    }
  }

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
            <div className={styles.textareaHeader}>
              <div className={styles.label} style={{ marginBottom: 0 }}>1회차 시작 내용</div>
              <div className={styles.textareaActions}>
                <button type="button" className={styles.guideToggleBtn} onClick={() => setShowGuide(v => !v)}>
                  {showGuide ? "가이드 닫기" : "멀티 보이스 TTS 가이드"}
                </button>
                <button type="button" className={styles.aiFormatBtn} onClick={handleFormatDialogue} disabled={formatLoading}>
                  {formatLoading ? "변환 중..." : "AI 대사 자동 변환"}
                </button>
              </div>
            </div>
            {showGuide && (
              <div className={styles.guideBox}>
                <div className={styles.guideTitle}>멀티 보이스 TTS 포맷 가이드</div>
                <div className={styles.guideDesc}>대사를 큰따옴표("")로 감싸면 등장인물별 목소리가 자동 적용됩니다.</div>
                <div className={styles.guideItems}>
                  <div className={styles.guideItem}>
                    <span className={styles.guideTag} style={{ background: "#E3F2FD", color: "#1565C0" }}>나레이터</span>
                    <span className={styles.guideText}>따옴표 없는 서술 텍스트</span>
                  </div>
                  <div className={styles.guideItem}>
                    <span className={styles.guideTag} style={{ background: "#E8F5E9", color: "#2E7D32" }}>참여자1</span>
                    <span className={styles.guideText}>홀수 번째 <code className={styles.guideCode}>"대사"</code></span>
                  </div>
                  <div className={styles.guideItem}>
                    <span className={styles.guideTag} style={{ background: "#FFF3E0", color: "#E65100" }}>참여자2</span>
                    <span className={styles.guideText}>짝수 번째 <code className={styles.guideCode}>"대사"</code></span>
                  </div>
                </div>
                <div className={styles.guideExample}>
                  <div className={styles.guideExampleTitle}>예시</div>
                  <pre className={styles.guideExampleCode}>{`그는 천천히 걸어왔다.\n"오랜만이야." 그가 말했다.\n그녀가 고개를 들었다.\n"정말 오래됐네." 그녀가 속삭였다.`}</pre>
                </div>
              </div>
            )}
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
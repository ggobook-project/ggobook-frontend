import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/AdminRelayPage.module.css"

const initialGuidelines = [
  { id: 1, title: "분량 가이드", content: "각 이어쓰기는 200자 이상 1000자 이내로 작성해주세요." },
  { id: 2, title: "내용 가이드", content: "이전 내용의 흐름을 자연스럽게 이어가야 합니다." },
  { id: 3, title: "금지 사항", content: "폭력적이거나 선정적인 내용은 작성할 수 없습니다." },
]

export default function AdminRelayPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("릴레이 목록")

  const relays = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, title: `릴레이 소설 ${i + 1}`, starter: "홍길동",
    entries: i * 5 + 3, date: "2026.04.10"
  }))

  const topics = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1, title: `관리자 주제 ${i + 1}`, date: "2026.04.01"
  }))

  // 가이드라인 상태
  const [guidelines, setGuidelines] = useState(initialGuidelines)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setGuidelines(prev => [...prev, { id: Date.now(), title: newTitle.trim(), content: newContent.trim() }])
    setNewTitle("")
    setNewContent("")
  }

  const handleEditStart = (g) => {
    setEditingId(g.id)
    setEditTitle(g.title)
    setEditContent(g.content)
  }

  const handleEditSave = (id) => {
    if (!editTitle.trim() || !editContent.trim()) return
    setGuidelines(prev => prev.map(g => g.id === id ? { ...g, title: editTitle.trim(), content: editContent.trim() } : g))
    setEditingId(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  const handleDelete = (id) => {
    setGuidelines(prev => prev.filter(g => g.id !== id))
  }

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
            >
              {t}
            </button>
          ))}
        </div>

        {/* 릴레이 목록 */}
        {tab === "릴레이 목록" && relays.map(r => (
          <div key={r.id} className={styles.card}>
            <div>
              <div className={styles.cardTitle}>{r.title}</div>
              <div className={styles.cardMeta}>시작: {r.starter} · 이어쓰기 {r.entries}개 · {r.date}</div>
            </div>
            <button className={styles.deleteBtn}>삭제</button>
          </div>
        ))}

        {/* 주제 관리 */}
        {tab === "주제 관리" && (
          <>
            <div className={styles.topicForm}>
              <div className={styles.topicInputRow}>
                <input placeholder="새 주제 입력" className={styles.topicInput} />
                <button className={styles.registerBtn}>등록</button>
              </div>
            </div>
            {topics.map(t => (
              <div key={t.id} className={styles.card}>
                <div>
                  <div className={styles.cardTitle}>{t.title}</div>
                  <div className={styles.cardMeta}>{t.date}</div>
                </div>
                <button className={styles.deleteBtn}>삭제</button>
              </div>
            ))}
          </>
        )}

        {/* 가이드라인 */}
        {tab === "가이드라인" && (
          <>
            {/* 새 가이드라인 추가 폼 */}
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

            {/* 가이드라인 목록 */}
            {guidelines.map(g => (
              <div key={g.id} className={styles.guideCard}>
                {editingId === g.id ? (
                  /* 수정 모드 */
                  <>
                    <input
                      className={styles.topicInput}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
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
                  /* 보기 모드 */
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
  )
}
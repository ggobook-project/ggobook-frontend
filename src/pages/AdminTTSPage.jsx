import { useState, useEffect, useRef } from "react"
import api from "../api/axios"
import styles from "../styles/AdminTTSPage.module.css"

const EMPTY_FORM = { voiceName: "", voiceType: "FEMALE", voiceStyle: "", fileUrl: "", sampleUrl: "" }

export default function AdminTTSPage() {
  const [voices, setVoices] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [previewing, setPreviewing] = useState(null) // voiceId currently loading preview
  const audioRef = useRef(null)

  const loadVoices = async () => {
    try {
      const res = await api.get("/api/tts/voices")
      const sorted = (res.data || []).sort((a, b) => a.voiceStyle.localeCompare(b.voiceStyle, "ko"))
      setVoices(sorted)
    } catch { setVoices([]) }
  }

  useEffect(() => { loadVoices() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setShowAddModal(true)
  }

  const openEdit = (v) => {
    setForm({
      voiceName: v.voiceName,
      voiceType: v.voiceType,
      voiceStyle: v.voiceStyle,
    })
    setEditTarget(v)
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!form.voiceName || !form.voiceStyle) { alert("목소리 ID와 표시 이름을 입력해주세요."); return }
    try {
      if (editTarget) {
        await api.put(`/api/admin/tts/voices/${editTarget.voiceId}`, form)
      } else {
        await api.post("/api/admin/tts/voices", form)
      }
      setShowAddModal(false)
      loadVoices()
    } catch { alert("저장에 실패했습니다.") }
  }

  const handleDelete = async (voiceId) => {
    if (!window.confirm("삭제하시겠습니까?")) return
    try {
      await api.delete(`/api/admin/tts/voices/${voiceId}`)
      loadVoices()
    } catch { alert("삭제에 실패했습니다.") }
  }

  const handlePreview = async (v) => {
    if (previewing === v.voiceId) return
    try {
      setPreviewing(v.voiceId)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
      const res = await api.post(`/api/tts/preview?voiceId=${v.voiceId}`)
      const audio = new Audio(res.data.url)
      audioRef.current = audio
      audio.onended = () => setPreviewing(null)
      audio.onerror = () => setPreviewing(null)
      await audio.play()
    } catch {
      setPreviewing(null)
      alert("미리듣기 생성에 실패했습니다.")
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>TTS 관리</div>
        <div className={styles.headerSubtitle}>TTS 목소리를 관리하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <button className={styles.addBtn} onClick={openAdd}>목소리 추가</button>
        </div>

        {voices.length === 0 && (
          <div style={{ textAlign: "center", color: "#90A4C8", fontSize: 14, padding: "40px 0" }}>
            등록된 목소리가 없습니다.
          </div>
        )}

        {voices.map(v => (
          <div
            key={v.voiceId}
            className={`${styles.voiceCard} ${previewing === v.voiceId ? styles.voiceCardPlaying : ""}`}
            onClick={() => handlePreview(v)}
            style={{ cursor: previewing !== null && previewing !== v.voiceId ? "not-allowed" : "pointer" }}
            title="클릭하면 미리듣기"
          >
            <div className={styles.voiceLeft}>
              <div className={styles.voiceIcon}>
                {previewing === v.voiceId ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="9" y1="22" x2="15" y2="22"/>
                  </svg>
                )}
              </div>
              <div>
                <div className={styles.voiceNameRow}>
                  <span className={styles.voiceName}>{v.voiceStyle}</span>
                  {previewing === v.voiceId && (
                    <span className={styles.playingBadge}>재생 중</span>
                  )}
                </div>
                <div className={styles.voiceMeta}>
                  {v.voiceType === "MALE" ? "남성" : "여성"} · {v.voiceName}
                </div>
              </div>
            </div>
            <div className={styles.voiceActions} onClick={e => e.stopPropagation()}>
              <button className={styles.editBtn} onClick={() => openEdit(v)}>수정</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(v.voiceId)}>삭제</button>
            </div>
          </div>
        ))}
      </div>

      {/* 추가/수정 모달 */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowAddModal(false)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 340, display: "flex", flexDirection: "column", gap: 14 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{editTarget ? "목소리 수정" : "목소리 추가"}</div>

            <div>
              <label style={{ fontSize: 13, color: "#64748B" }}>성별</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {["FEMALE", "MALE"].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, voiceType: t }))}
                    style={{ flex: 1, padding: "8px", border: `2px solid ${form.voiceType === t ? "#2196F3" : "#E2E8F0"}`, borderRadius: 8, background: form.voiceType === t ? "#EBF5FF" : "#fff", color: form.voiceType === t ? "#2196F3" : "#64748B", fontWeight: 600, cursor: "pointer" }}>
                    {t === "FEMALE" ? "여성" : "남성"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#64748B" }}>Typecast Voice ID</label>
              <input
                value={form.voiceName}
                onChange={e => setForm(f => ({ ...f, voiceName: e.target.value }))}
                placeholder="예: voice_abc123"
                style={{ width: "100%", marginTop: 6, padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#64748B" }}>표시 이름</label>
              <input
                value={form.voiceStyle}
                onChange={e => setForm(f => ({ ...f, voiceStyle: e.target.value }))}
                placeholder="예: 차분한, 활발한, 진중한"
                style={{ width: "100%", marginTop: 6, padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: "10px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>
                취소
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, padding: "10px", background: "#2196F3", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

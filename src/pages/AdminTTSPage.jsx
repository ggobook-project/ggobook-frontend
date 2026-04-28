import { useState, useEffect } from "react"
import api from "../api/axios"
import styles from "../styles/AdminTTSPage.module.css"

const MALE_VOICES = [
  { label: "남성 - 표준A (ko-KR-Standard-C)", value: "ko-KR-Standard-C" },
  { label: "남성 - 표준B (ko-KR-Standard-D)", value: "ko-KR-Standard-D" },
  { label: "남성 - 고품질A (ko-KR-Wavenet-C)", value: "ko-KR-Wavenet-C" },
  { label: "남성 - 고품질B (ko-KR-Wavenet-D)", value: "ko-KR-Wavenet-D" },
]

const FEMALE_VOICES = [
  { label: "여성 - 표준A (ko-KR-Standard-A)", value: "ko-KR-Standard-A" },
  { label: "여성 - 표준B (ko-KR-Standard-B)", value: "ko-KR-Standard-B" },
  { label: "여성 - 고품질A (ko-KR-Wavenet-A)", value: "ko-KR-Wavenet-A" },
  { label: "여성 - 고품질B (ko-KR-Wavenet-B)", value: "ko-KR-Wavenet-B" },
]

const EMPTY_FORM = { voiceName: "", voiceType: "FEMALE", voiceStyle: "", sampleUrl: "", fileUrl: "", isDefault: false }

export default function AdminTTSPage() {
  const [voices, setVoices] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [contentId, setContentId] = useState("")
  const [batchVoiceId, setBatchVoiceId] = useState("")
  const [isBatching, setIsBatching] = useState(false)
  const [batchResult, setBatchResult] = useState("")

  const loadVoices = async () => {
    try {
      const res = await api.get("/api/tts/voices")
      setVoices(res.data || [])
    } catch { setVoices([]) }
  }

  useEffect(() => { loadVoices() }, [])

  const voiceOptions = form.voiceType === "MALE" ? MALE_VOICES : FEMALE_VOICES

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
      sampleUrl: v.sampleUrl || "",
      fileUrl: v.fileUrl || "",
      isDefault: v.isDefault,
    })
    setEditTarget(v)
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!form.voiceName || !form.voiceStyle) { alert("목소리 이름과 스타일을 입력해주세요."); return }
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

  const handleBatch = async () => {
    if (!contentId || !batchVoiceId) { alert("작품 ID와 목소리를 선택해주세요."); return }
    try {
      setIsBatching(true)
      setBatchResult("")
      await api.post(`/api/admin/tts/contents/${contentId}?voiceId=${batchVoiceId}`)
      setBatchResult("✅ 일괄 생성 완료!")
    } catch { setBatchResult("❌ 생성 실패") } finally { setIsBatching(false) }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>TTS 관리</div>
        <div className={styles.headerSubtitle}>TTS 목소리를 관리하세요</div>
      </div>

      <div className={styles.content}>
        {/* 목소리 목록 */}
        <div className={styles.contentHeader}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>목소리 목록</span>
          <button className={styles.addBtn} onClick={openAdd}>목소리 추가</button>
        </div>

        {voices.map(v => (
          <div key={v.voiceId} className={`${styles.voiceCard} ${v.isDefault ? styles.voiceCardDefault : ""}`}>
            <div className={styles.voiceLeft}>
              <div className={styles.voiceIcon}>🎙</div>
              <div>
                <div className={styles.voiceNameRow}>
                  <span className={styles.voiceName}>{v.voiceStyle}</span>
                  {v.isDefault && <span className={styles.defaultBadge}>기본</span>}
                </div>
                <div className={styles.voiceMeta}>
                  {v.voiceType === "MALE" ? "남성" : "여성"} · {v.voiceName}
                </div>
              </div>
            </div>
            <div className={styles.voiceActions}>
              <button className={styles.previewBtn} onClick={() => openEdit(v)}>수정</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(v.voiceId)}>삭제</button>
            </div>
          </div>
        ))}

        {/* 일괄 TTS 생성 */}
        <div style={{ marginTop: 32, padding: "20px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>전체 화 TTS 일괄 생성</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: "#64748B", width: 70 }}>작품 ID</label>
              <input
                type="number"
                value={contentId}
                onChange={e => setContentId(e.target.value)}
                placeholder="예: 1"
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: "#64748B", width: 70 }}>목소리</label>
              <select
                value={batchVoiceId}
                onChange={e => setBatchVoiceId(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 14 }}
              >
                <option value="">선택하세요</option>
                {voices.map(v => (
                  <option key={v.voiceId} value={v.voiceId}>
                    {v.voiceStyle} ({v.voiceType === "MALE" ? "남성" : "여성"})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBatch}
              disabled={isBatching}
              style={{ padding: "10px", background: isBatching ? "#94A3B8" : "#2196F3", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: isBatching ? "not-allowed" : "pointer", fontSize: 14 }}
            >
              {isBatching ? "생성 중... (시간이 걸립니다)" : "일괄 생성 시작"}
            </button>
            {batchResult && <div style={{ textAlign: "center", fontSize: 14, fontWeight: 600 }}>{batchResult}</div>}
          </div>
        </div>
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
                  <button key={t} onClick={() => setForm(f => ({ ...f, voiceType: t, voiceName: "" }))}
                    style={{ flex: 1, padding: "8px", border: `2px solid ${form.voiceType === t ? "#2196F3" : "#E2E8F0"}`, borderRadius: 8, background: form.voiceType === t ? "#EBF5FF" : "#fff", color: form.voiceType === t ? "#2196F3" : "#64748B", fontWeight: 600, cursor: "pointer" }}>
                    {t === "FEMALE" ? "여성" : "남성"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#64748B" }}>Google TTS 목소리</label>
              <select value={form.voiceName} onChange={e => setForm(f => ({ ...f, voiceName: e.target.value }))}
                style={{ width: "100%", marginTop: 6, padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 14 }}>
                <option value="">선택하세요</option>
                {voiceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#64748B" }}>스타일명 (표시 이름)</label>
              <input value={form.voiceStyle} onChange={e => setForm(f => ({ ...f, voiceStyle: e.target.value }))}
                placeholder="예: 차분한, 활발한, 진중한"
                style={{ width: "100%", marginTop: 6, padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="isDefault" checked={form.isDefault}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
              <label htmlFor="isDefault" style={{ fontSize: 14 }}>기본 목소리로 설정</label>
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

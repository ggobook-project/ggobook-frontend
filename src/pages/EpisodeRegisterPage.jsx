import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function EpisodeRegisterPage() {
  const navigate = useNavigate()
  const [isFree, setIsFree] = useState(true)
  const [scheduled, setScheduled] = useState(false)

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>회차 등록</div>
        <div style={{ fontSize: 14, color: c.textSub }}>새 회차를 등록하세요</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>회차 제목</div>
            <input placeholder="회차 제목 입력"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>원고 업로드</div>
            <div style={{ width: "100%", height: 120, background: c.bgSurface, border: `2px dashed ${c.border}`, borderRadius: theme.radius.md, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: c.textMuted }}>+ 파일 업로드 (이미지/텍스트)</span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>공개 설정</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ label: "무료", val: true }, { label: "유료", val: false }].map(opt => (
                <button key={opt.label} onClick={() => setIsFree(opt.val)} style={{
                  flex: 1, padding: 10, borderRadius: theme.radius.md, fontSize: 13, cursor: "pointer",
                  background: isFree === opt.val ? c.primary : c.bgSurface,
                  color: isFree === opt.val ? "#fff" : c.textSub,
                  border: `1px solid ${isFree === opt.val ? c.primary : c.border}`
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: c.textSub, fontWeight: 500 }}>예약 업로드</div>
              <button onClick={() => setScheduled(!scheduled)} style={{
                padding: "4px 12px", borderRadius: theme.radius.full, fontSize: 12, cursor: "pointer",
                background: scheduled ? c.primary : c.bgSurface,
                color: scheduled ? "#fff" : c.textSub,
                border: `1px solid ${scheduled ? c.primary : c.border}`
              }}>{scheduled ? "ON" : "OFF"}</button>
            </div>
            {scheduled && (
              <input type="datetime-local"
                style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>TTS 목소리 설정</div>
            <div style={{ padding: 14, background: c.bgSurface, borderRadius: theme.radius.md, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 10 }}>등장인물별 목소리를 설정하세요</div>
              {["나레이터", "주인공", "상대방"].map(ch => (
                <div key={ch} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: c.text }}>{ch}</span>
                  <select style={{ padding: "6px 12px", background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.sm, color: c.text, fontSize: 12, outline: "none" }}>
                    <option>목소리 선택</option>
                    <option>차분한 여성</option>
                    <option>활발한 남성</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/author/contents")} style={{ flex: 1, padding: 12, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 14, cursor: "pointer" }}>취소</button>
            <button style={{ flex: 2, padding: 12, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>등록하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
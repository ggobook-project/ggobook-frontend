import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function RelayNovelRegisterPage() {
  const navigate = useNavigate()
  const [useAdminTopic, setUseAdminTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")
  const adminTopics = ["사랑에 빠진 두 사람", "마법사의 비밀", "미래 도시의 탐정"]

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>릴레이 소설 등록</div>
        <div style={{ fontSize: 14, color: c.textSub }}>새로운 릴레이 소설을 시작하세요</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: c.textSub, fontWeight: 500 }}>관리자 주제 사용</div>
              <button onClick={() => setUseAdminTopic(!useAdminTopic)} style={{
                padding: "4px 12px", borderRadius: theme.radius.full, fontSize: 12, cursor: "pointer",
                background: useAdminTopic ? c.primary : c.bgSurface,
                color: useAdminTopic ? "#fff" : c.textSub,
                border: `1px solid ${useAdminTopic ? c.primary : c.border}`
              }}>{useAdminTopic ? "ON" : "OFF"}</button>
            </div>
            {useAdminTopic && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {adminTopics.map(topic => (
                  <div key={topic} onClick={() => setSelectedTopic(topic)} style={{
                    padding: "12px 14px", borderRadius: theme.radius.md, cursor: "pointer",
                    background: selectedTopic === topic ? "#E3F2FD" : c.bgSurface,
                    border: `1px solid ${selectedTopic === topic ? c.primary : c.border}`,
                    fontSize: 13, color: selectedTopic === topic ? c.primary : c.text
                  }}>{topic}</div>
                ))}
              </div>
            )}
          </div>

          {!useAdminTopic && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>제목</div>
                <input placeholder="릴레이 소설 제목 입력"
                  style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>시작 내용</div>
                <textarea placeholder="이야기의 시작을 써주세요..." rows={5}
                  style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/relay")} style={{ flex: 1, padding: 12, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 14, cursor: "pointer" }}>취소</button>
            <button style={{ flex: 2, padding: 12, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>등록하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
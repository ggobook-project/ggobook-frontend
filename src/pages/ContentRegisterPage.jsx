import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

export default function ContentRegisterPage() {
  const navigate = useNavigate()
  const [type, setType] = useState("웹툰")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const genres = ["로맨스", "판타지", "무협", "현대", "스릴러", "BL", "액션"]

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 4 }}>작품 등록</div>
        <div style={{ fontSize: 14, color: c.textSub }}>새 작품을 등록하세요</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ background: c.bgWhite, borderRadius: theme.radius.lg, border: `1px solid ${c.border}`, padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>작품 유형</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["웹툰", "웹소설"].map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  flex: 1, padding: 12, borderRadius: theme.radius.md, fontSize: 14, cursor: "pointer",
                  background: type === t ? c.primary : c.bgSurface,
                  color: type === t ? "#fff" : c.textSub,
                  border: `1px solid ${type === t ? c.primary : c.border}`,
                  fontWeight: type === t ? 500 : 400
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>작품명</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="작품명 입력"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>장르</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {genres.map(g => (
                <button key={g} onClick={() => setGenre(g)} style={{
                  padding: "6px 14px", borderRadius: theme.radius.full, fontSize: 12, cursor: "pointer",
                  background: genre === g ? c.primary : c.bgSurface,
                  color: genre === g ? "#fff" : c.textSub,
                  border: `1px solid ${genre === g ? c.primary : c.border}`
                }}>{g}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>한줄 요약</div>
            <input placeholder="작품을 한 줄로 소개해주세요"
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>줄거리</div>
            <textarea placeholder="작품 줄거리를 입력해주세요" rows={4}
              style={{ width: "100%", background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "11px 14px", color: c.text, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: c.textSub, marginBottom: 8, fontWeight: 500 }}>대표 이미지</div>
            <div style={{ width: "100%", height: 120, background: c.bgSurface, border: `2px dashed ${c.border}`, borderRadius: theme.radius.md, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: c.textMuted }}>+ 이미지 업로드</span>
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
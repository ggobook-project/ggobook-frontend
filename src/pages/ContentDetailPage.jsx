import { useNavigate } from "react-router-dom"
import { useState } from "react"
import theme from "../styles/theme"
const { colors: c } = theme

const episodes = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1, num: `${i + 1}화`, title: `에피소드 제목 ${i + 1}`,
  free: i < 3, date: "2026.04.13"
}))

export default function ContentDetailPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("회차목록")
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState("")
  const comments = [
    { user: "독자1", text: "정말 재밌어요! 다음화가 기대됩니다", date: "04.13" },
    { user: "독자2", text: "빨리 다음화 올려주세요", date: "04.12" },
  ]

  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{
          height: 200,
          background: `linear-gradient(135deg, ${c.primaryLight} 0%, ${c.primarySoft} 100%)`,
          borderBottom: `1px solid ${c.border}`,
          display: "flex", alignItems: "flex-end", padding: 24, gap: 16
        }}>
          <div style={{ width: 80, height: 104, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
          <div>
            <div style={{ fontSize: 11, color: c.textSub, marginBottom: 6 }}>웹툰 · 로맨스 · 월, 수 연재</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>작품 제목</div>
            <div style={{ fontSize: 13, color: c.textSub }}>작가명 · ★ 4.8 · 조회수 12.4만</div>
          </div>
        </div>

        <div style={{ background: c.bgWhite, padding: "20px 24px", borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setLiked(!liked)} style={{
              flex: 1, padding: 10,
              background: liked ? c.bgSurface : c.bgWhite,
              border: `1px solid ${liked ? c.primary : c.border}`,
              borderRadius: theme.radius.md,
              color: liked ? c.primary : c.textSub,
              fontSize: 13, cursor: "pointer"
            }}>{liked ? "♥ 찜됨" : "♡ 찜하기"}</button>
            <button style={{ flex: 1, padding: 10, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 13, cursor: "pointer" }}>★ 별점</button>
            <button style={{ flex: 1, padding: 10, background: c.bgWhite, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, color: c.textSub, fontSize: 13, cursor: "pointer" }}>공유</button>
            <button onClick={() => navigate("/webtoon/viewer/1")} style={{ flex: 2, padding: 10, background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>첫화 보기</button>
          </div>
          <div style={{ fontSize: 13, color: c.textSub, lineHeight: 1.8, background: c.bgSurface, padding: "12px 16px", borderRadius: theme.radius.md, border: `1px solid ${c.border}` }}>
            작품 소개 줄거리가 여기에 표시됩니다. AI 요약본 포함. 스포일러 없이 핵심 내용만 간략하게 설명합니다...
          </div>
        </div>

        <div style={{ display: "flex", background: c.bgWhite, borderBottom: `1px solid ${c.border}` }}>
          {["회차목록", "댓글"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: 14, background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${c.primary}` : "2px solid transparent",
              color: tab === t ? c.primary : c.textSub,
              fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400
            }}>{t}</button>
          ))}
        </div>

        {tab === "회차목록" && episodes.map(ep => (
          <div key={ep.id} onClick={() => navigate("/webtoon/viewer/1")} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px", background: c.bgWhite,
            borderBottom: `1px solid ${c.bgSurface}`, cursor: "pointer"
          }}
            onMouseEnter={e => e.currentTarget.style.background = c.bgSurface}
            onMouseLeave={e => e.currentTarget.style.background = c.bgWhite}
          >
            <div>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 3 }}>{ep.num}</div>
              <div style={{ fontSize: 14, color: c.text }}>{ep.title}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {ep.free
                ? <span style={{ fontSize: 11, padding: "3px 8px", background: c.bgSurface, color: c.free, borderRadius: theme.radius.sm, fontWeight: 500 }}>무료</span>
                : <span style={{ fontSize: 11, padding: "3px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, color: c.textSub, borderRadius: theme.radius.sm }}>유료</span>}
              <span style={{ fontSize: 12, color: c.textMuted }}>{ep.date}</span>
            </div>
          </div>
        ))}

        {tab === "댓글" && (
          <div style={{ background: c.bgWhite, padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={comment} onChange={e => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                style={{ flex: 1, background: c.bgSurface, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "10px 14px", color: c.text, fontSize: 13, outline: "none" }} />
              <button style={{ padding: "10px 20px", background: c.primary, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>등록</button>
            </div>
            {comments.map((cm, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${c.bgSurface}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.bgSurface, border: `1px solid ${c.border}` }}></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{cm.user}</span>
                  <span style={{ fontSize: 12, color: c.textMuted }}>{cm.date}</span>
                </div>
                <div style={{ fontSize: 14, color: c.text, paddingLeft: 42 }}>{cm.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
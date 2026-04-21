import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
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
  const { contentId } = useParams();
  const [content, setContent] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);

  
  const comments = [
    { user: "독자1", text: "정말 재밌어요! 다음화가 기대됩니다", date: "04.13" },
    { user: "독자2", text: "빨리 다음화 올려주세요", date: "04.12" },
  ]

  const loadContentDetail = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch("http://localhost:8080/api/contents/" + contentId, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        alert("백엔드 통신 실패(작품 상세)");
        return;
      }const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error("작품 상세 불러오기 실패 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEpisodeList = async () => {
    try{
      setEpisodesLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch("http://localhost:8080/api/contents/" + contentId + "/episodes", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        alert("백엔드 통신 실패(에피소드 목록)");
        return;
      }
      const data = await response.json();
      setEpisodes(Array.isArray(data) ? data : (data.content ? data.content :[]))
    } catch (error) {
      console.error("에피소드 목록 불러오기 실패 : ", error);
    } finally {
      setEpisodesLoading(false);
    }
  };


  useEffect(() => {
    loadContentDetail();
    loadEpisodeList();
  }, [contentId]);

  const formatDate = (dateStr) => {
    if(!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
  }

  const typeLabel = (type) => {
    switch(type) {
      case "WEBTOON": return "웹툰";
      case "NOVEL": return "웹소설";
      default: return "기타";
    }
  }

  const handleEpisodeClick = (episodeId) => {
    if(content.type === "WEBTOON"){
        navigate(`/webtoon/viewer/${episodeId}`);
    }else if(content.type === "NOVEL"){
        navigate(`/novel/viewer/${episodeId}`);
    }
  }
    
    if(isLoading) {
      return(
        <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: c.textSub, fontSize: 14 }}>불러오는 중...</div>
      </div>
      )

  }
  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{
          height: 200,
          background: `linear-gradient(135deg, ${c.primaryLight} 0%, ${c.primarySoft} 100%)`,
          borderBottom: `1px solid ${c.border}`,
          display: "flex", alignItems: "flex-end", padding: 24, gap: 16
        }}>
          <div style={{
            width: 80, height: 104, borderRadius: theme.radius.md,
            border: `1px solid ${c.border}`, flexShrink: 0, overflow: "hidden",
            background: c.bgWhite
          }}>
            {content.thumbnailUrl
              ? <img src={content.thumbnailUrl} alt="thumbnail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : null}
          </div>
          {/* 작품 정보 */}
          <div>
            <div style={{ fontSize: 11, color: c.textSub, marginBottom: 6 }}>
              {typeLabel(content.type)}
              {content.genre ? ` · ${content.genre}` : ""}
              {content.serialDay ? ` · ${content.serialDay} 연재` : ""}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>
              {content.title}
            </div>
            <div style={{ fontSize: 13, color: c.textSub }}>
              {content.rating != null ? `★ ${content.rating.toFixed(1)}` : ""}
              {content.viewCount != null
                ? ` · 조회수 ${content.viewCount >= 10000
                    ? `${(content.viewCount / 10000).toFixed(1)}만`
                    : content.viewCount.toLocaleString()}`
                : ""}
            </div>
          </div>
        </div>

        {/* 액션 버튼 + 소개 */}
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
            <button
              onClick={() => episodes.length > 0 && navigate(`/webtoon/viewer/${episodes[0].episodeId}`)}
              disabled={episodes.length === 0}
              style={{
                flex: 2, padding: 10,
                background: episodes.length > 0 ? c.primary : c.border,
                border: "none", borderRadius: theme.radius.md,
                color: "#fff", fontSize: 13, cursor: episodes.length > 0 ? "pointer" : "default",
                fontWeight: 500
              }}>첫화 보기</button>
          </div>

          {/* 작품 소개 */}
          <div style={{
            fontSize: 13, color: c.textSub, lineHeight: 1.8,
            background: c.bgSurface, padding: "12px 16px",
            borderRadius: theme.radius.md, border: `1px solid ${c.border}`
          }}>
            {content.summary || content.description || "작품 소개가 없습니다."}
          </div>
        </div>

        {/* 탭 */}
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

        {/* 회차 목록 */}
        {tab === "회차목록" && (
          episodesLoading
            ? <div style={{ padding: 32, textAlign: "center", color: c.textSub, fontSize: 14, background: c.bgWhite }}>회차 불러오는 중...</div>
            : episodes.length === 0
              ? <div style={{ padding: 32, textAlign: "center", color: c.textMuted, fontSize: 14, background: c.bgWhite }}>등록된 회차가 없습니다.</div>
              : episodes.map(ep => (
                  <div key={ep.episodeId}
                    onClick={() => handleEpisodeClick(ep.episodeId)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "14px 24px", background: c.bgWhite,
                      borderBottom: `1px solid ${c.bgSurface}`, cursor: "pointer"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = c.bgSurface}
                    onMouseLeave={e => e.currentTarget.style.background = c.bgWhite}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 3 }}>
                        {ep.episodeNumber}화
                      </div>
                      <div style={{ fontSize: 14, color: c.text }}>{ep.episodeTitle}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {ep.isFree
                        ? <span style={{ fontSize: 11, padding: "3px 8px", background: c.bgSurface, color: c.free, borderRadius: theme.radius.sm, fontWeight: 500 }}>무료</span>
                        : <span style={{ fontSize: 11, padding: "3px 8px", background: c.bgSurface, border: `1px solid ${c.border}`, color: c.textSub, borderRadius: theme.radius.sm }}>유료</span>}
                      <span style={{ fontSize: 12, color: c.textMuted }}>
                        {formatDate(ep.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
        )}

        {/* 댓글 */}
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
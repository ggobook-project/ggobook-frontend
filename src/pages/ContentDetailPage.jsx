import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

// 🌟 변경 1: 일반 axios 해고! 우리 회사 전용 스마트 요원(api) 고용
// (파일 경로가 ../api/axios 가 맞는지 한 번 더 확인해 주세요!)
import api from "../api/axios"; 

import styles from "../styles/ContentDetailPage.module.css";

export default function ContentDetailPage() {
  const navigate = useNavigate();
  const { contentId } = useParams();

  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [showFullSummary, setShowFullSummary] = useState(false);

  // 🌟 변경 2: 작품 상세 조회 다이어트
  const loadContentDetail = async () => {
    try {
      setIsLoading(true);
      
      // 요원이 알아서 지갑 열고 토큰 꺼내가므로 토큰 세팅 코드 전부 삭제!
      // 요원이 앞부분 주소(baseURL)를 알고 있으므로 뒷주소만 작성!
      const response = await api.get(`/api/contents/${contentId}`);

      const data = response.data;
      setContent(data);
      setLiked(data.liked || data.isLiked || false); 
    } catch (error) {
      console.error("작품 상세 불러오기 실패 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 변경 3: 에피소드 목록 조회 다이어트
  const loadEpisodeList = async () => {
    try {
      setEpisodesLoading(true);
      
      // 마찬가지로 토큰 세팅 로직, 긴 주소창 싹 다 삭제!
      const response = await api.get(`/api/contents/${contentId}/episodes`);

      const data = response.data;
      setEpisodes(Array.isArray(data) ? data : data.content ? data.content : []);
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

  // 🌟 변경 4: 찜 토글 로직 다이어트
  const handleLike = async () => {
    // 팁: 찜하기는 무조건 로그인이 필요하므로, 프론트 단에서 빠르게 한 번 컷 해주는 센스는 남겨둡니다!
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 요원이 알아서 토큰을 붙여서 보내주므로 headers 셋팅 삭제!
      const response = await api.post(`/api/likes/${contentId}`);

      if (response.status === 200 || response.status === 201) {
        setLiked(!liked);
      }
    } catch (error) {
      console.error("찜 실패 : ", error);
      alert("찜 처리에 실패했습니다.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const typeLabel = (type) => {
    switch (type) {
      case "WEBTOON": return "웹툰";
      case "NOVEL": return "웹소설";
      default: return "기타";
    }
  };

  const handleEpisodeClick = (episodeId) => {
    if (content.type === "웹툰") {
      navigate(`/webtoon/viewer/${episodeId}?contentId=${contentId}`);
    } else if (content.type === "웹소설") {
      navigate(`/novel/viewer/${episodeId}?contentId=${contentId}`);
    } else {
      alert(`[오류] 알 수 없는 작품 타입입니다.\n현재 DB 저장값: "${content.type}"`);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("URL 복사에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>불러오는 중...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>작품 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const summary = content.summary || content.description || "작품 소개가 없습니다.";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.infoSection}>
          <div className={styles.thumbnail}>
            {content.thumbnailUrl ? (
              <img src={content.thumbnailUrl} alt="thumbnail" className={styles.thumbnailImg} />
            ) : (
              <div className={styles.thumbnailPlaceholder} />
            )}
          </div>

          <div className={styles.infoRight}>
            <div className={styles.contentMeta}>
              {typeLabel(content.type)}
              {content.genre ? ` · ${content.genre}` : ""}
              {content.serialDay ? ` · ${content.serialDay} 연재` : ""}
            </div>
            <div className={styles.contentTitle}>{content.title}</div>
            {content.author && <div className={styles.contentAuthor}>{content.author}</div>}
            <div className={styles.contentStats}>
              {content.rating != null && <span className={styles.rating}>★ {content.rating.toFixed(1)}</span>}
              {content.viewCount != null && (
                <span className={styles.views}>
                  조회 {content.viewCount >= 10000 ? `${(content.viewCount / 10000).toFixed(1)}만` : content.viewCount.toLocaleString()}
                </span>
              )}
              <span className={styles.epCount}>총 {episodes.length}화</span>
            </div>

            <div className={styles.summaryBox}>
              <p className={`${styles.summaryText} ${showFullSummary ? styles.summaryExpanded : ""}`}>
                {summary}
              </p>
              {summary.length > 80 && (
                <button className={styles.summaryToggle} onClick={() => setShowFullSummary(!showFullSummary)}>
                  {showFullSummary ? "접기 ▲" : "더보기 ▼"}
                </button>
              )}
            </div>

            <div className={styles.actionRow}>
              <button
                onClick={handleLike}
                className={`${styles.iconBtn} ${liked ? styles.iconBtnLiked : ""}`}
                title="찜하기"
              >
                <svg
                  width="20" height="20" viewBox="0 0 24 24"
                  fill={liked ? "#E53935" : "none"}
                  stroke={liked ? "#E53935" : "#90A4C8"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              <button
                onClick={handleShare}
                className={`${styles.iconBtn} ${copied ? styles.iconBtnCopied : ""}`}
                title={copied ? "복사됨!" : "공유"}
              >
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={copied ? "#2196F3" : "#90A4C8"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>

              <button
              onClick={() => episodes.length > 0 && handleEpisodeClick(episodes[0].episodeId)}
              disabled={episodes.length === 0}
              className={styles.firstEpBtn}
              >
                첫화 보기 · 1화
              </button>
            </div>
          </div>
        </div>

        <div className={styles.episodeSection}>
          <div className={styles.episodeHeader}>
            <span className={styles.episodeCount}>총 {episodes.length}화</span>
          </div>
          {episodesLoading ? (
            <div className={styles.emptyMsg}>회차 불러오는 중...</div>
          ) : episodes.length === 0 ? (
            <div className={styles.emptyMsg}>등록된 회차가 없습니다.</div>
          ) : (
            episodes.map((ep) => (
              <div key={ep.episodeId} className={styles.episodeRow} onClick={() => handleEpisodeClick(ep.episodeId)}>
                <div className={styles.epThumb} />
                <div className={styles.epInfo}>
                  <div className={styles.epTitle}>{ep.episodeTitle}</div>
                  <div className={styles.epMeta}>
                    {ep.isFree ? (
                      <span className={styles.badgeFree}>무료</span>
                    ) : (
                      <span className={styles.badgePaid}>유료</span>
                    )}
                    <span className={styles.epDate}>{formatDate(ep.createdAt)}</span>
                  </div>
                </div>
                <div className={styles.epNum}>{ep.episodeNumber}화</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
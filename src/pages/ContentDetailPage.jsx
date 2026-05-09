import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import styles from "../styles/ContentDetailPage.module.css";
import { useAlert } from "../context/AlertContext";

export default function ContentDetailPage() {
  const navigate = useNavigate();
  const { contentId } = useParams();
  const { showAlert } = useAlert();

  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [tags, setTags] = useState([]);

  const [purchasedEps, setPurchasedEps] = useState([]);
  const [readEps, setReadEps] = useState([]);
  const [payTarget, setPayTarget] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showInsufficientAlert, setShowInsufficientAlert] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const loadWalletBalance = async () => {
    try {
      const res = await api.get("/api/wallets/balance");
      setWalletBalance(res.data);
    } catch (error) { console.error("잔액 불러오기 실패 : ", error); }
  };

  const loadReadEpisodes = async () => {
    try {
      const response = await api.get(`/api/readings/${contentId}`);
      setReadEps(response.data || []);
    } catch (error) { console.error("읽음 내역 불러오기 실패 : ", error); }
  };

  const loadOwnedEpisodes = async () => {
    try {
      const response = await api.get(`/api/owns/${contentId}`);
      const ownedEpisodeNumbers = response.data.map((ep) => ep.episodeNumber);
      setPurchasedEps(ownedEpisodeNumbers);
    } catch (error) { console.error("소장 회차 불러오기 실패 : ", error); }
  };

  useEffect(() => {
    const loadContentDetail = async () => {
      try {
        setIsLoading(true);
        // 🌟 핵심 수술 1: 여기서 가져오는 데이터가 "백엔드에서 날짜/유료 계산을 끝마친 DTO" 입니다.
        const response = await api.get(`/api/contents/${contentId}`);
        const data = response.data;
        
        setContent(data);
        setLiked(data.liked || data.isLiked || false);
        
        // 🌟 핵심 수술 2: 날것의 API를 다시 호출하지 않고, DTO 안에 있는 episodes를 그대로 화면에 넘겨줍니다!
        setEpisodes(data.episodes?.content || data.episodes || []);
        
      } catch (error) { console.error("작품 상세 불러오기 실패 : ", error); } 
      finally { setIsLoading(false); }

      try {
        const response = await api.get(`/api/contents/${contentId}/tags`);
        setTags(response.data || []);
      } catch (error) { console.error("태그 불러오기 실패 : ", error); }
    };

    loadContentDetail();
    // loadEpisodeList() 함수는 중복 호출이므로 싹 삭제했습니다!
    
    loadWalletBalance();
    loadOwnedEpisodes();
    loadReadEpisodes();
    setReadEps(JSON.parse(localStorage.getItem("readEpisodes") || "[]"));
  }, [contentId]);

  const handleLike = async () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) { await showAlert("로그인이 필요합니다."); return; }
    try {
      const response = await api.post(`/api/likes/${contentId}`);
      if (response.status === 200 || response.status === 201) setLiked(!liked);
    } catch (error) { await showAlert("찜 처리에 실패했습니다.", "error"); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const typeLabel = (type) => {
    if (type === "WEBTOON") return "웹툰";
    if (type === "NOVEL") return "웹소설";
    return "기타";
  };

  const navigateToViewer = async (episodeId) => {
    if (content.type === "웹툰") navigate(`/webtoon/viewer/${episodeId}?contentId=${contentId}`);
    else if (content.type === "웹소설") navigate(`/novel/viewer/${episodeId}?contentId=${contentId}`);
    else await showAlert(`[오류] 알 수 없는 작품 타입입니다.\n현재 DB 저장값: "${content.type}"`, "error");
  };

  const handleEpisodeClick = (ep) => {
    if (ep.status === "BLINDED") return;
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const isPurchased = purchasedEps.includes(ep.episodeNumber) || ep.isOwned;
    
    // 🌟 결제 필요 조건: 백엔드가 '미리보기(PREVIEW)'라고 했거나, 영구 유료(!ep.isFree)인 경우
    const isPaymentRequired = (ep.status === "PREVIEW" || !ep.isFree) && !isPurchased;

    if (isPaymentRequired) {
      if (!token) { alert("로그인이 필요한 서비스입니다."); navigate("/login"); return; }
      setPayTarget(ep);
      return;
    }
    navigateToViewer(ep.episodeId);
  };

  const handlePay = async () => {
    if (walletBalance < 200) { setShowInsufficientAlert(true); return; }
    try {
      await api.post(`/api/episodes/${payTarget.episodeId}/purchase`);
      await loadWalletBalance();
      await loadOwnedEpisodes();
      const target = payTarget;
      setPayTarget(null);
      setShowToast(true);
      setTimeout(() => { setShowToast(false); navigateToViewer(target.episodeId); }, 1500);
    } catch (error) {
      if (error.response?.data?.includes("포인트가 부족")) await showAlert("포인트가 부족합니다.", "error");
      else if (error.response?.data?.includes("이미 구매")) await showAlert("이미 구매한 회차입니다.");
      else await showAlert("구매에 실패했습니다.", "error");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { await showAlert("URL 복사에 실패했습니다.", "error"); }
  };

  if (isLoading) return <div className={styles.loading}><div className={styles.loadingText}>불러오는 중...</div></div>;
  if (!content) return <div className={styles.loading}><div className={styles.loadingText}>작품 정보를 찾을 수 없습니다.</div></div>;

  const summary = content.summary || content.description || "작품 소개가 없습니다.";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.infoSection}>
          <div className={styles.thumbnail}>
            {content.thumbnailUrl ? <img src={content.thumbnailUrl} alt="thumbnail" className={styles.thumbnailImg} /> : <div className={styles.thumbnailPlaceholder} />}
          </div>
          <div className={styles.infoRight}>
            <div className={styles.contentMeta}>{typeLabel(content.type)} {content.genre ? ` · ${content.genre}` : ""} {content.serialDay ? ` · ${content.serialDay} 연재` : ""}</div>
            <div className={styles.contentTitle}>{content.title}</div>
            <div className={styles.contentAuthor}>
            작가 : {content.authorNickname || content.author?.nickname || content.author || "미상"}
            </div>
            <div className={styles.contentStats}>
              {content.rating != null && <span className={styles.rating}>★ {content.rating.toFixed(1)}</span>}
              {content.viewCount != null && <span className={styles.views}>조회 {content.viewCount >= 10000 ? `${(content.viewCount / 10000).toFixed(1)}만` : content.viewCount.toLocaleString()}</span>}
              <span className={styles.epCount}>총 {episodes.length}화</span>
            </div>
            <div className={styles.summaryBox}>
              <p className={`${styles.summaryText} ${showFullSummary ? styles.summaryExpanded : ""}`}>{summary}</p>
              {summary.length > 80 && <button className={styles.summaryToggle} onClick={() => setShowFullSummary(!showFullSummary)}>{showFullSummary ? "접기 ▲" : "더보기 ▼"}</button>}
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 8 }}>
                {tags.map((tag) => <span key={tag.tagId} style={{ background: "#E3F2FD", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#1565C0" }}>#{tag.tagName}</span>)}
              </div>
            )}
            <div className={styles.actionRow}>
              <button onClick={handleLike} className={`${styles.iconBtn} ${liked ? styles.iconBtnLiked : ""}`} title="찜하기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "#E53935" : "none"} stroke={liked ? "#E53935" : "#90A4C8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              </button>
              <button onClick={handleShare} className={`${styles.iconBtn} ${copied ? styles.iconBtnCopied : ""}`} title={copied ? "복사됨!" : "공유"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={copied ? "#2196F3" : "#90A4C8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              </button>
              <button onClick={() => episodes.length > 0 && handleEpisodeClick(episodes[0])} disabled={episodes.length === 0} className={styles.firstEpBtn}>첫화 보기 · 1화</button>
            </div>
          </div>
        </div>

        <div className={styles.episodeSection}>
          <div className={styles.episodeHeader}><span className={styles.episodeCount}>총 {episodes.length}화</span></div>
          {episodes.length === 0 ? (
            <div className={styles.emptyMsg}>등록된 회차가 없습니다.</div>
          ) : (
            episodes.map((ep) => {
              const isBlinded = ep.status === "BLINDED";
              // 🌟 핵심 수술 3: 백엔드가 정해준 이름표를 기반으로 명확하게 렌더링 분기 처리
              const isPreview = ep.status === "PREVIEW";
              const isPaidEp = !ep.isFree;
              const isPurchased = purchasedEps.includes(ep.episodeNumber) || ep.isOwned;
              const isRead = readEps.includes(ep.episodeId) || ep.isRead;

              return (
                <div key={ep.episodeId} className={`${styles.episodeRow} ${isRead ? styles.episodeRowRead : ""}`} onClick={() => handleEpisodeClick(ep)} style={{ cursor: isBlinded ? "default" : "pointer" }}>
                  <div className={styles.epThumb}>
                    {ep.thumbnailUrl ? <img src={ep.thumbnailUrl} alt="썸네일" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "#E3F2FD" }} />}
                  </div>
                  <div className={styles.epInfo}>
                    {isBlinded ? (
                      <div style={{ fontSize: 12, color: "#90A4C8", lineHeight: 1.5 }}>운영 정책에 따른 콘텐츠 검토 및 수정 작업으로 인해 잠시 이용이 제한된 회차입니다.<br />최대한 빠르게 조치를 완료하여 다시 제공해 드릴 수 있도록 하겠습니다.</div>
                    ) : (
                      <>
                        <div className={styles.epTitle}>{ep.episodeTitle}</div>
                        <div className={styles.epMeta}>
                          {isPreview ? (
                            isPurchased ? <span className={styles.badgePurchased}>구매완료</span> : <span className={styles.badgePaid}>🔒 미리보기</span>
                          ) : isPaidEp ? (
                            isPurchased ? <span className={styles.badgePurchased}>구매완료</span> : <span className={styles.badgePaid}>🔒 유료 200P</span>
                          ) : (
                            <span className={styles.badgeFree}>무료</span>
                          )}
                          {isRead && <span className={styles.badgeRead}>읽음</span>}
                          <span className={styles.epDate}>{formatDate(ep.createdAt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.epNum}>{ep.episodeNumber}화</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 유료 결제 모달 유지 */}
      {payTarget && (
        <div className={styles.modalOverlay} onClick={() => { setPayTarget(null); setShowInsufficientAlert(false); }}>
          <div className={styles.payModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.payModalTitle}>유료 회차</div>
            <div className={styles.payModalEp}>{payTarget.episodeTitle || `${payTarget.episodeNumber}화`}</div>
            <div className={styles.payModalCost}>200 P</div>
            <div className={styles.payModalBalance} style={showInsufficientAlert ? { color: "#E53935", fontWeight: 600 } : {}}>보유 포인트: {walletBalance.toLocaleString()} P</div>
            {showInsufficientAlert && (
              <div className={styles.payModalInsufficientMsg}>포인트가 부족합니다.<br /><span>200 P가 필요하지만 현재 {walletBalance.toLocaleString()} P를 보유 중입니다.</span></div>
            )}
            <div className={styles.payModalActions}>
              <button className={styles.payModalCancel} onClick={() => { setPayTarget(null); setShowInsufficientAlert(false); }}>취소</button>
              {showInsufficientAlert ? (
                <button className={styles.payModalChargeBtn} onClick={() => { setPayTarget(null); setShowInsufficientAlert(false); navigate("/mypage/points"); }}>충전하러 가기</button>
              ) : (
                <button className={styles.payModalConfirm} onClick={handlePay}>결제하기</button>
              )}
            </div>
          </div>
        </div>
      )}
      {showToast && <div className={styles.toast}>포인트가 사용되었습니다.</div>}
    </div>
  );
}
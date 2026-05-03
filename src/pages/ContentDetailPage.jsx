import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [tags, setTags] = useState([]);

  // 유료 결제 / 읽음 상태
  const [purchasedEps, setPurchasedEps] = useState([]);
  const [readEps, setReadEps] = useState([]);
  const [payTarget, setPayTarget] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);

  const loadWalletBalance = async () => {
    try {
      const res = await api.get("/api/wallets/balance");
      setWalletBalance(res.data);
    } catch (error) {
      console.error("잔액 불러오기 실패 : ", error);
    }
  };

  const loadReadEpisodes = async () => {
    try {
      const response = await api.get(`/api/readings/${contentId}`);
      setReadEps(response.data || []);
    } catch (error) {
      console.error("읽음 내역 불러오기 실패 : ", error);
    }
  };

  const loadOwnedEpisodes = async () => {
    try {
      const response = await api.get(`/api/owns/${contentId}`);
      const ownedEpisodeNumbers = response.data.map((ep) => ep.episodeNumber);
      setPurchasedEps(ownedEpisodeNumbers);
    } catch (error) {
      console.error("소장 회차 불러오기 실패 : ", error);
    }
  };

  useEffect(() => {
    const loadContentDetail = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(`/api/contents/${contentId}`);

        const data = response.data;
        setContent(data);
        setLiked(data.liked || data.isLiked || false);
      } catch (error) {
        console.error("작품 상세 불러오기 실패 : ", error);
      } finally {
        setIsLoading(false);
      }

      const loadTags = async () => {
        try {
          const response = await api.get(`/api/contents/${contentId}/tags`);
          setTags(response.data || []);
        } catch (error) {
          console.error("태그 불러오기 실패 : ", error);
        }
      };
      loadTags();
    };

    const loadEpisodeList = async () => {
      try {
        setEpisodesLoading(true);

        const response = await api.get(`/api/contents/${contentId}/episodes`);

        const data = response.data;
        setEpisodes(
          Array.isArray(data) ? data : data.content ? data.content : [],
        );
        console.log("회차 목록 : ", response.data);
      } catch (error) {
        console.error("에피소드 목록 불러오기 실패 : ", error);
      } finally {
        setEpisodesLoading(false);
      }
    };
    loadContentDetail();
    loadEpisodeList();
    loadWalletBalance();
    loadOwnedEpisodes();
    loadReadEpisodes();
    setReadEps(JSON.parse(localStorage.getItem("readEpisodes") || "[]"));
  }, [contentId]);

  // 🌟 변경 4: 찜 토글 로직 다이어트
  const handleLike = async () => {
    // 🌟 수정: 왼쪽 주머니(localStorage)에 없으면 오른쪽 주머니(sessionStorage)도 마저 뒤져봅니다!
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
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
    if (type === "WEBTOON") return "웹툰";
    if (type === "NOVEL") return "웹소설";
    return "기타";
  };

  const navigateToViewer = (episodeId) => {
    if (content.type === "웹툰") {
      navigate(`/webtoon/viewer/${episodeId}?contentId=${contentId}`);
    } else if (content.type === "웹소설") {
      navigate(`/novel/viewer/${episodeId}?contentId=${contentId}`);
    } else {
      alert(
        `[오류] 알 수 없는 작품 타입입니다.\n현재 DB 저장값: "${content.type}"`,
      );
    }
  };

  const handleEpisodeClick = (ep) => {
    if (ep.status === "BLINDED") return;

    if (ep.status === "APPROVED" && !purchasedEps.includes(ep.episodeNumber)) {
      setPayTarget(ep);
      return;
    }

    // 유료 회차 결제 확인
    if (!ep.isFree && !purchasedEps.includes(ep.episodeNumber)) {
      setPayTarget(ep);
      return;
    }

    navigateToViewer(ep.episodeId);
  };

  const handlePay = async () => {
    try {
      await api.post(`/api/episodes/${payTarget.episodeId}/purchase`);

      await loadWalletBalance();

      await loadOwnedEpisodes();

      const target = payTarget;
      setPayTarget(null);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigateToViewer(target.episodeId);
      }, 1500);
    } catch (error) {
      if (error.response?.data?.includes("포인트가 부족")) {
        alert("포인트가 부족합니다. 충전 후 이용해주세요.");
      } else if (error.response?.data?.includes("이미 구매")) {
        alert("이미 구매한 회차입니다.");
      } else {
        alert("구매에 실패했습니다.");
      }
      console.error("구매 실패 : ", error);
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

  const summary =
    content.summary || content.description || "작품 소개가 없습니다.";
  const userPoints = Number(localStorage.getItem("userPoints") || 1200);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.inner}>
        <div className={styles.infoSection}>
          <div className={styles.thumbnail}>
            {content.thumbnailUrl ? (
              <img
                src={content.thumbnailUrl}
                alt="thumbnail"
                className={styles.thumbnailImg}
              />
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
            {content.author && (
              <div className={styles.contentAuthor}>{content.author}</div>
            )}
            <div className={styles.contentStats}>
              {content.rating != null && (
                <span className={styles.rating}>
                  ★ {content.rating.toFixed(1)}
                </span>
              )}
              {content.viewCount != null && (
                <span className={styles.views}>
                  조회{" "}
                  {content.viewCount >= 10000
                    ? `${(content.viewCount / 10000).toFixed(1)}만`
                    : content.viewCount.toLocaleString()}
                </span>
              )}
              <span className={styles.epCount}>총 {episodes.length}화</span>
            </div>

            <div className={styles.summaryBox}>
              <p
                className={`${styles.summaryText} ${showFullSummary ? styles.summaryExpanded : ""}`}
              >
                {summary}
              </p>
              {summary.length > 80 && (
                <button
                  className={styles.summaryToggle}
                  onClick={() => setShowFullSummary(!showFullSummary)}
                >
                  {showFullSummary ? "접기 ▲" : "더보기 ▼"}
                </button>
              )}
            </div>

            {tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag.tagId}
                    style={{
                      background: "#E3F2FD",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 12,
                      color: "#1565C0",
                    }}
                  >
                    #{tag.tagName}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.actionRow}>
              <button
                onClick={handleLike}
                className={`${styles.iconBtn} ${liked ? styles.iconBtnLiked : ""}`}
                title="찜하기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={liked ? "#E53935" : "none"}
                  stroke={liked ? "#E53935" : "#90A4C8"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={copied ? "#2196F3" : "#90A4C8"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>

              <button
                onClick={() =>
                  episodes.length > 0 && handleEpisodeClick(episodes[0])
                }
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
            episodes.map((ep) => {
              const isBlinded = ep.status === "BLINDED";
              const isApproved = ep.status === "APPROVED";
              const isPaidEp = !ep.isFree;
              const isPurchased = purchasedEps.includes(ep.episodeNumber);
              const isRead = readEps.includes(ep.episodeId);
              return (
                <div
                  key={ep.episodeId}
                  className={`${styles.episodeRow} ${isRead ? styles.episodeRowRead : ""}`}
                  onClick={() => handleEpisodeClick(ep)}
                  style={{ cursor: isBlinded ? "default" : "pointer" }}
                >
                  <div className={styles.epThumb}>
                    {ep.thumbnailUrl ? (
                      <img
                        src={ep.thumbnailUrl}
                        alt="썸네일"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#E3F2FD",
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.epInfo}>
                    {isBlinded ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#90A4C8",
                          lineHeight: 1.5,
                        }}
                      >
                        운영 정책에 따른 콘텐츠 검토 및 수정 작업으로 인해 잠시
                        이용이 제한된 회차입니다.
                        <br />
                        최대한 빠르게 조치를 완료하여 다시 제공해 드릴 수 있도록
                        하겠습니다.
                      </div>
                    ) : (
                      <>
                        <div className={styles.epTitle}>{ep.episodeTitle}</div>
                        <div className={styles.epMeta}>
                          {isApproved ? (
                            isPurchased ? (
                              <span className={styles.badgePurchased}>
                                구매완료
                              </span>
                            ) : (
                              <span className={styles.badgePaid}>
                                🔒 미리보기
                              </span>
                            )
                          ) : isPaidEp ? (
                            isPurchased ? (
                              <span className={styles.badgePurchased}>
                                구매완료
                              </span>
                            ) : (
                              <span className={styles.badgePaid}>
                                🔒 유료 200P
                              </span>
                            )
                          ) : (
                            <span className={styles.badgeFree}>무료</span>
                          )}
                          {isRead && (
                            <span className={styles.badgeRead}>읽음</span>
                          )}
                          <span className={styles.epDate}>
                            {formatDate(ep.createdAt)}
                          </span>
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

      {/* 유료 결제 모달 */}
      {payTarget && (
        <div className={styles.modalOverlay} onClick={() => setPayTarget(null)}>
          <div className={styles.payModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.payModalTitle}>유료 회차</div>
            <div className={styles.payModalEp}>
              {payTarget.episodeTitle || `${payTarget.episodeNumber}화`}
            </div>
            <div className={styles.payModalCost}>200 P</div>
            <div className={styles.payModalBalance}>
              보유 포인트: {walletBalance.toLocaleString()} P
            </div>
            <div className={styles.payModalActions}>
              <button
                className={styles.payModalCancel}
                onClick={() => setPayTarget(null)}
              >
                취소
              </button>
              <button className={styles.payModalConfirm} onClick={handlePay}>
                결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포인트 사용 토스트 */}
      {showToast && (
        <div className={styles.toast}>포인트가 사용되었습니다.</div>
      )}
    </div>
  );
}

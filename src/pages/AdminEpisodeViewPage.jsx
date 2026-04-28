import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/AdminEpisodeViewPage.module.css";

export default function AdminEpisodeViewPage() {
  const { contentId, episodeId } = useParams();
  const [episode, setEpisode] = useState(null);
  const [error, setError] = useState(null); // 🌟 에러 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/admin/content/episodes/${episodeId}/view`)
       .then(res => setEpisode(res.data))
       .catch(err => {
         console.error(err);
         setError("회차 정보를 불러오는 중 문제가 발생했습니다."); // 🌟 사용자에게 알림
       });
  }, [episodeId]);

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!episode) return <div style={{ textAlign: 'center' }}>로딩 중...</div>;

  return (
    <div className={styles.viewerWrapper}>
      {/* 관리자용 상단 바 */}
      <div className={styles.viewerHeader}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>➔ 뒤로가기</button>
        <h2>{episode.episodeNumber}화: {episode.title}</h2>
      </div>
      
      <main className={styles.contentBody}>
        {episode.contentType === "WEBTOON" ? (
          <div className={styles.toonWrapper}>
            {episode.imageUrls?.map((url, i) => (
              <img key={i} src={url} alt={`${i}화`} className={styles.toonImg} />
            ))}
          </div>
        ) : (
          <div className={styles.novelWrapper}>
            <pre className={styles.novelText}>{episode.novelContent}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
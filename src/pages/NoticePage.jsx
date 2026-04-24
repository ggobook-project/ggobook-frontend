import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/NoticePage.module.css";

export default function NoticePage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    try {
      const res = await api.get("/api/notices"); 
      const data = res.data.content || res.data; 
      setNotices(data);
    } catch (error) {
      console.error("공지사항 목록을 불러오지 못했습니다.", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>공지사항</div>
        <div className={styles.headerSubtitle}>꼬북의 새로운 소식을 확인하세요</div>
      </div>
      <div className={styles.content}>
        {notices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          notices.map(n => {
            const isPinned = n.isPinned === true || n.pinned === true;

            return (
              <div
                key={n.noticeId}
                className={`${styles.noticeItem} ${isPinned ? styles.noticePinned : ""}`}
                onClick={() => navigate(`/notices/${n.noticeId}`)} 
              >
                <div className={styles.noticeLeft}>
                  {isPinned && <span className={styles.pinnedBadge}>공지</span>}
                  <span className={`${styles.noticeTitle} ${isPinned ? styles.noticeTitlePinned : ""}`}>
                    {n.title}
                  </span>
                </div>
                {/* 🌟 수정: 날짜 옆에 조회수 추가 */}
                <span className={styles.noticeDate}>
                  {n.createdAt?.split('T')[0]} &nbsp;|&nbsp; 조회 {n.viewCount || 0}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
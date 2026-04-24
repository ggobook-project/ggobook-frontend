import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/NoticeDetailPage.module.css";

export default function NoticeDetailPage() {
  const navigate = useNavigate();
  const { noticeId } = useParams(); 
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      try {
        const res = await api.get(`/api/notices/${noticeId}`);
        setNotice(res.data);
      } catch (error) {
        console.error("공지사항 상세를 불러오지 못했습니다.", error);
        alert("존재하지 않거나 삭제된 공지사항입니다.");
        navigate("/notices");
      }
    };

    fetchNoticeDetail();
  }, [noticeId]);

  if (!notice) return <div style={{ textAlign: "center", padding: "50px" }}>로딩 중...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/notices")}>← 목록</button>
        <div className={styles.headerTitle}>{notice.title}</div>
        <div className={styles.headerMeta}>
          {/* 🌟 수정: 상세 페이지 헤더에 조회수 추가 */}
          {notice.createdAt?.split('T')[0]} · 관리자 · 조회수 {notice.viewCount || 0}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.body}>
          <div className={styles.text} style={{ whiteSpace: "pre-wrap" }}>
            {notice.content}
          </div>
        </div>
      </div>
    </div>
  );
}
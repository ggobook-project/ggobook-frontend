import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationBell.module.css";
import api from "../api/axios";

const NotifIcon = ({ type }) => {
  if (type === "like") return <svg width="14" height="14" viewBox="0 0 24 24" fill="#2196F3" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
  if (type === "comment") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/api/notifications/me`);
      setNotifications(res.data);
    } catch (e) {
      console.error("알림 로드 실패", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await api.patch(`/api/notifications/${notification.id}/read`);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      }
      if (notification.relatedUrl) {
        navigate(notification.relatedUrl);
        setShowNotifications(false);
      }
    } catch (e) {
      console.error("알림 읽음 처리 실패", e);
    }
  };

  // 개별 삭제 로직
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("이 알림을 지우시겠습니까?")) return;

    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("알림 삭제 실패", error);
    }
  };

  // 전체 삭제 로직
  const handleDeleteAll = async () => {
    if (!window.confirm("모든 알림을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/api/notifications/me`);
      setNotifications([]);
    } catch (error) {
      console.error("전체 삭제 실패", error);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div ref={notificationRef} className={styles.wrapper}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`${styles.iconBtn} ${showNotifications ? styles.iconBtnActive : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className={styles.badge} />}
      </button>

      {showNotifications && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>
              알림 {unreadCount > 0 && <span className={styles.headerCount}>({unreadCount})</span>}
            </span>
            
            {/* 🌟 디자인 개선된 버튼 영역 */}
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className={styles.headerActionBtn}>모두 읽음</button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleDeleteAll} className={styles.headerActionBtn}>모두 삭제</button>
              )}
            </div>
          </div>

          {/* 스크롤이 자동으로 생기는 리스트 영역 */}
          <div className={styles.listArea}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>알림이 없습니다</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)} 
                  className={`${styles.notifItem} ${n.read ? styles.notifItemRead : styles.notifItemUnread}`}
                >
                  <div className={styles.iconCircle}>
                    <NotifIcon type={n.type || "info"} />
                  </div>
                  <div className={styles.textContainer}>
                    <div className={styles.message}>{n.message}</div>
                    <div className={styles.time}>{n.time || new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                  {!n.read && <div className={styles.unreadDot} />}
                  
                  <button 
                    onClick={(e) => handleDelete(e, n.id)} 
                    className={styles.deleteBtn}
                    title="알림 지우기"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
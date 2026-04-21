import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import theme from "../styles/theme"
const { colors: c } = theme

import styles from "../styles/AdminUploadPage.module.css"

export default function AdminUploadPage() {
  const [items, setItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  // const [selectedItem, setSelectedItem] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")

    const navigate = useNavigate()

  // const items = Array.from({ length: 5 }, (_, i) => ({
  //   id: i + 1, contentTitle: `작품 제목 ${i + 1}`, episodeNum: `${i + 1}화`,
  //   type: i % 2 === 0 ? "웹툰" : "웹소설",
  //   status: i % 3 === 0 ? "비공개" : "공개", date: "2026.04.13"
  // }))

  // 명세서 반영: loadUploadList()
  const loadUploadList = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/uploads");
      setItems(response.data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadUploadList(); }, [])

  // 명세서 반영: handleToggleVisibility()
  const handleToggleVisibility = async (episodeId, currentStatus) => {
    try {
      await axios.post(`http://localhost:8080/api/admin/uploads/episodes/${episodeId}/toggle`);
      loadUploadList();
    } catch (e) { alert("상태 변경 실패"); }
  }

  // 명세서 반영: handleScheduleSubmit()
  const handleScheduleSubmit = async () => {
    try {
      await axios.post(`http://localhost:8080/api/admin/uploads/episodes/${selectedItem.episodeId}/schedule`, 
        { scheduledAt: `${selectedDate} 00:00:00` });
      setIsModalOpen(false);
      loadUploadList();
    } catch (e) { alert("예약 실패"); }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>업로드 관리</div>
        <div className={styles.headerSubtitle}>회차 공개/비공개를 관리하세요</div>
      </div>
      <div className={styles.content}>
        {items.map(item => (
          <div
            key={item.id}
            className={styles.itemCard}
            onClick={() => navigate(`/admin/uploads/${item.id}`)}
          >
            <div>
              <div className={styles.itemTitle}>{item.contentTitle} · {item.episodeNum}</div>
              <div className={styles.itemMeta}>{item.type} · {item.date}</div>
            </div>
            <div className={styles.itemRight} onClick={e => e.stopPropagation()}>
              <span className={`${styles.statusBadge} ${item.status === "공개" ? styles.statusPublic : styles.statusPrivate}`}>
                {item.status}
              </span>
              <button className={styles.changeBtn}>변경</button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: 30, borderRadius: 10 }}>
            <input type="date" onChange={(e) => setSelectedDate(e.target.value)} />
            <button onClick={handleScheduleSubmit}>예약 완료</button>
          </div>
        </div>
      )}
    </div>
  )
}
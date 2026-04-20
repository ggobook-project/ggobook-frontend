import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminUploadPage() {
  const [items, setItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")

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
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>업로드 관리</div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        {items.map(item => (
          <div key={item.episodeId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.contentTitle} · {item.episodeNum}화</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>예약일: {item.scheduledAt || "미정"}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleToggleVisibility(item.episodeId, item.status)}>{item.status}</button>
              <button disabled={!!item.scheduledAt} onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}>
                {item.scheduledAt ? "예약 완료" : "예약"}
              </button>
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
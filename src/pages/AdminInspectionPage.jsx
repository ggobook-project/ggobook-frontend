import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios" 
import theme from "../styles/theme"
const { colors: c } = theme

export default function AdminInspectionPage() {
  const navigate = useNavigate()
  
  const [filter, setFilter] = useState("전체")
  const [items, setItems] = useState([]) 
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [rejectReason, setRejectReason] = useState("")

  // ==========================================
  // [연동 1] 백엔드에서 검수 대기 목록 불러오기
  // ==========================================
  const loadInspectionList = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/inspections");
      setItems(response.data); 
    } catch (error) {
      console.error("목록을 불러오는데 실패했습니다.", error);
    }
  }

  useEffect(() => {
    loadInspectionList()
  }, []) 

  // ==========================================
  // [탭 필터 변경]
  // ==========================================
  const handleTypeFilter = (selectedFilter) => {
    setFilter(selectedFilter);
  }

  // ==========================================
  // [작품 상세 보기]
  // ==========================================
  const handleInspectionClick = (episodeId) => {
    navigate(`/admin/inspection/detail/${episodeId}`);
  }

  // ==========================================
  // [연동 2] 작품 승인 처리하기
  // ==========================================
  const handleApprove = async (episodeId) => {
    if(window.confirm("이 작품을 승인하시겠습니까?")) {
      try {
        const now = new Date();
        const formattedDate = now.getFullYear() + '-' + 
                              String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(now.getDate()).padStart(2, '0') + ' ' + 
                              String(now.getHours()).padStart(2, '0') + ':' + 
                              String(now.getMinutes()).padStart(2, '0') + ':' + 
                              String(now.getSeconds()).padStart(2, '0');
        
        const requestData = { scheduledAt: formattedDate };

        await axios.post(`http://localhost:8080/api/admin/inspections/episodes/${episodeId}/approve`, requestData);
        
        alert("승인 처리가 완료되었습니다.");
        loadInspectionList(); 
      } catch (error) {
        console.error("승인 처리 실패", error);
        alert("승인 처리 중 오류가 발생했습니다.");
      }
    }
  }

  // ==========================================
  // [연동 3] 작품 반려 처리하기
  // ==========================================
  const handleReject = async () => {
    if (!rejectReason) {
      alert("반려 사유를 선택해주세요.");
      return;
    }
    
    try {
      const requestData = { rejectReason: rejectReason };

      await axios.post(`http://localhost:8080/api/admin/inspections/episodes/${selectedItem?.episodeId}/reject`, requestData);
      
      alert(`'${selectedItem?.title}' 작품이 반려되었습니다.\n사유: ${rejectReason}`);
      
      closeRejectModal();
      loadInspectionList(); 

    } catch (error) {
      console.error("반려 처리 실패", error);
      alert("반려 처리 중 오류가 발생했습니다.");
    }
  } 

  // ==========================================
  // [UI 제어] 모달창 열기/닫기
  // ==========================================
  const openRejectModal = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeRejectModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setRejectReason("") 
  }

  // ==========================================
  // 화면 렌더링 (View)
  // ==========================================
  return (
    <div style={{ background: c.bg, minHeight: "calc(100vh - 60px)", position: "relative" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primarySoft} 0%, ${c.bgWhite} 100%)`, padding: "28px 40px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 4 }}>검수 관리</div>
        <div style={{ fontSize: 14, color: c.textSub }}>등록된 작품을 검토하고 승인/반려하세요</div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 40px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["전체", "웹툰", "웹소설"].map(f => (
            <button key={f} onClick={() => handleTypeFilter(f)} style={{
              padding: "6px 16px", borderRadius: theme.radius.full, fontSize: 13, cursor: "pointer",
              background: filter === f ? c.primary : c.bgWhite,
              color: filter === f ? "#fff" : c.textSub,
              border: `1px solid ${filter === f ? c.primary : c.border}`
            }}>{f}</button>
          ))}
        </div>

        {items.map(item => (
          <div key={item.episodeId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: c.bgWhite, borderRadius: theme.radius.md, border: `1px solid ${c.border}`, marginBottom: 10 }}>
            <div 
              style={{ display: "flex", gap: 14, alignItems: "center", cursor: "pointer" }}
              onClick={() => handleInspectionClick(item.episodeId)}
            >
              <div style={{ width: 52, height: 68, background: c.bgSurface, borderRadius: theme.radius.sm, border: `1px solid ${c.border}`, flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{item.author} · {item.type} · {item.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleApprove(item.episodeId)} style={{ padding: "7px 16px", background: c.success, border: "none", borderRadius: theme.radius.md, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>승인</button>
              <button onClick={() => openRejectModal(item)} style={{ padding: "7px 16px", background: "none", border: `1px solid ${c.danger}`, borderRadius: theme.radius.md, color: c.danger, fontSize: 12, cursor: "pointer" }}>반려</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: c.bgWhite, padding: 30, borderRadius: theme.radius.md, width: "100%", maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, marginBottom: 10, color: c.text }}>작품 반려</h3>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 20 }}>
              <strong style={{color: c.primary}}>{selectedItem?.title}</strong> 작품을 반려하시겠습니까?
            </p>
            
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 20, borderRadius: theme.radius.sm, border: `1px solid ${c.border}` }}>
              <option value="">반려 사유를 선택해주세요</option>
              <option value="저작권 침해 및 표절 의심">저작권 침해 및 표절 의심</option>
              <option value="운영정책 위반 (욕설, 선정성 등)">운영정책 위반 (욕설, 선정성 등)</option>
              <option value="원고 파일 누락 및 규격 미달">원고 파일 누락 및 규격 미달</option>
              <option value="광고 및 상업적 목적">광고 및 상업적 목적</option>
              <option value="가독성 심각 (문맥 파괴 등)">가독성 심각 (문맥 파괴 등)</option>
              <option value="기타 사유">기타 사유</option>
            </select>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={closeRejectModal} style={{ padding: "8px 16px", background: c.bgSurface, border: "none", borderRadius: theme.radius.md, cursor: "pointer" }}>취소</button>
              <button onClick={handleReject} style={{ padding: "8px 16px", background: c.danger, color: "#fff", border: "none", borderRadius: theme.radius.md, cursor: "pointer" }}>반려 전송</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
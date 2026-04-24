import { useState, useEffect } from "react";
// 🌟 1. 기본 axios 대신 팀원이 만든 커스텀 api 요원을 불러옵니다!
import api from "../api/axios"; 
import styles from "../styles/AdminMemberPage.module.css";

export default function AdminMemberPage() {
  const [members, setMembers] = useState([]);
  
  // 페이징 & 검색 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchType, setSearchType] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 모달 상태
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspendData, setSuspendData] = useState({ duration: "DAYS_3", reason: "SPAM", customReason: "" });

  // 🚨 불필요해진 getAuthHeader() 함수는 완전히 삭제했습니다! 🚨

  // 🌟 데이터 불러오기 (토큰과 도메인이 자동으로 붙습니다)
  const loadMembers = async (page = 0, searchFlag = isSearching, currentKeyword = keyword) => {
    try {
      // 🌟 2. http://localhost:8080 생략 가능!
      let url = `/api/admin/members?page=${page}&size=10`;
      
      if (searchFlag && currentKeyword.trim() !== "") {
        url = `/api/admin/members/search?type=${searchType}&keyword=${currentKeyword}&page=${page}&size=10`;
      }

      // 🌟 3. 토큰 헤더 없이 그냥 api.get()만 호출하면 인터셉터가 알아서 토큰을 붙여서 쏩니다!
      const res = await api.get(url);
      const data = res.data;

      // 데이터 껍데기 까기
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      setMembers(list); 
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("회원 목록 로딩 실패", err);
      setMembers([]); 
    }
  };

  useEffect(() => { 
    loadMembers(0, false, ""); 
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    loadMembers(0, true, keyword);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadMembers(newPage, isSearching, keyword);
    }
  };

  // 🌟 정지 처리 확정
  const handleSuspendConfirm = async () => {
    try {
      // 🌟 api.post()를 사용하고 도메인과 헤더를 싹 날렸습니다!
      await api.post(`/api/admin/members/${selectedUser.id}/suspend`, suspendData);
      
      alert(`${selectedUser.nickname}님이 정지 처리되었습니다.`);
      setSelectedUser(null);
      loadMembers(currentPage, isSearching, keyword); 
    } catch (err) {
      alert("정지 처리 실패: 권한이 없거나 서버 연결 상태를 확인해주세요.");
    }
  };

  // 🌟 정지 해제 함수
  const handleRelease = async (user) => {
    if (!window.confirm(`${user.nickname}님의 정지를 해제하시겠습니까?`)) return;

    try {
      // 🌟 마찬가지로 매우 깔끔해진 post 요청
      await api.post(`/api/admin/members/${user.id}/release`, { reason: "관리자 직권 해제" });
      
      alert("정지가 해제되었습니다.");
      loadMembers(currentPage, isSearching, keyword); 
    } catch (err) {
      alert("정지 해제 실패: 권한이 없거나 서버를 확인해주세요.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 헤더 및 검색바 */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>회원 관리</div>
        <div className={styles.headerSubtitle}>일반 회원 정보를 조회하고 정지/관리할 수 있습니다.</div>
        
        <div className={styles.searchWrap}>
          <div className={styles.searchBox}>
            <select className={styles.searchSelect} value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="ALL">전체</option>
              <option value="NICKNAME">닉네임</option>
              <option value="ID">아이디</option>
            </select>
            <input
              className={styles.searchInput}
              placeholder="검색어를 입력하세요..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>검색</button>
          </div>
        </div>
      </div>

      {/* 회원 리스트 */}
      <div className={styles.content}>
        {members.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>해당하는 회원이 없습니다.</div>
        ) : (
          members.map(m => (
            <div key={m.id} className={styles.memberCard}>
              <div className={styles.memberLeft}>
                <div className={styles.avatar} />
                <div>
                  <div className={styles.memberName}>{m.nickname}</div>
                  <div className={styles.memberMeta}>{m.userId} · {m.email}</div>
                </div>
              </div>
              <div className={styles.memberRight}>
                <span className={`${styles.statusBadge} ${m.status === "ACTIVE" ? styles.statusActive : styles.statusBanned}`}>
                  {m.status === "ACTIVE" ? "활성" : "정지"}
                </span>
                
                {m.status === "ACTIVE" ? (
                  <button className={styles.actionBtn} onClick={() => {
                    setSelectedUser(m);
                    setSuspendData({ duration: "DAYS_3", reason: "SPAM", customReason: "" });
                  }}>정지 처리</button>
                ) : (
                  <button 
                    className={styles.actionBtn} 
                    style={{ borderColor: "#10B981", color: "#10B981" }} 
                    onClick={() => handleRelease(m)}
                  >
                    정지 해제
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* 페이징 컨트롤러 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
              ◀ 이전
            </button>
            <span className={styles.pageInfo}>{currentPage + 1} / {totalPages}</span>
            <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
              다음 ▶
            </button>
          </div>
        )}
      </div>

      {/* 모달창 */}
      {selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              🚨 {selectedUser.nickname}님 정지
            </div>
            
            <div className={styles.modalLabel}>정지 기간 설정</div>
            <select className={styles.selectField} value={suspendData.duration} onChange={(e) => setSuspendData({...suspendData, duration: e.target.value})}>
              <option value="DAYS_3">3일 정지</option>
              <option value="DAYS_7">7일 정지</option>
              <option value="DAYS_14">14일 정지</option>
              <option value="DAYS_30">30일 정지</option>
              <option value="PERMANENT">영구 정지</option>
            </select>
            
            <div className={styles.modalLabel}>정지 사유 선택</div>
            <select className={styles.selectField} value={suspendData.reason} onChange={(e) => setSuspendData({...suspendData, reason: e.target.value})}>
              <option value="SPAM">스팸 홍보/도배글 게시</option>
              <option value="ABUSIVE_LANGUAGE">욕설 및 혐오 발언</option>
              <option value="INAPPROPRIATE_CONTENT">음란물/선정적 콘텐츠 게시</option>
              <option value="COPYRIGHT_INFRINGEMENT">타인 저작권 침해 및 무단 도용</option>
              <option value="ILLEGAL_PROMOTION">불법 사이트 홍보 및 광고</option>
              <option value="POLITICAL_DISPUTE">정치적 분쟁 유도 및 조장</option>
              <option value="FAKE_INFORMATION">허위 사실 유포</option>
              <option value="OTHER">기타 직접 입력</option>
            </select>

            {suspendData.reason === "OTHER" && (
              <input 
                className={styles.inputField} 
                placeholder="상세 사유를 입력해주세요..." 
                value={suspendData.customReason}
                onChange={(e) => setSuspendData({...suspendData, customReason: e.target.value})} 
              />
            )}

            <div className={styles.btnGroup}>
              <button className={styles.cancelBtn} onClick={() => setSelectedUser(null)}>취소</button>
              <button className={styles.confirmBtn} onClick={handleSuspendConfirm}>정지 확정</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
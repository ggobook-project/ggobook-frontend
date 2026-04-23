import { useState, useEffect } from "react";
import axios from "axios";
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

  // 🌟 데이터 불러오기 (페이징 & 검색 통합)
  const loadMembers = async (page = 0, searchFlag = isSearching, currentKeyword = keyword) => {
    try {
      let url = `http://localhost:8080/api/admin/members?page=${page}&size=10`;
      
      if (searchFlag && currentKeyword.trim() !== "") {
        url = `http://localhost:8080/api/admin/members/search?type=${searchType}&keyword=${currentKeyword}&page=${page}&size=10`;
      }

      const res = await axios.get(url);
      const data = res.data;
      
      // 🌟 완벽한 관리자 필터링 (DB의 role 값 'ADMIN'을 필터링)
      const list = data.content || data;
      const filtered = list.filter(m => 
        String(m.role).toUpperCase() !== "ADMIN" && 
        String(m.role).toUpperCase() !== "ROLE_ADMIN" &&
        m.id !== 1 // 슈퍼관리자(id 1) 절대 방어
      );

      setMembers(filtered);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("회원 목록 로딩 실패", err);
    }
  };

  useEffect(() => { loadMembers(0, false, ""); }, []);

  // 검색 실행
  const handleSearch = () => {
    setIsSearching(true);
    loadMembers(0, true, keyword);
  };

  // 페이징 이동
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadMembers(newPage, isSearching, keyword);
    }
  };

  // 정지 처리 확정
  const handleSuspendConfirm = async () => {
    try {
      // selectedUser.id 는 DB의 PK (Primary Key)를 사용합니다.
      await axios.post(`http://localhost:8080/api/admin/members/${selectedUser.id}/suspend`, suspendData);
      alert(`${selectedUser.nickname}님이 정지 처리되었습니다.`);
      setSelectedUser(null);
      loadMembers(currentPage, isSearching, keyword); // 현재 페이지 새로고침
    } catch (err) {
      alert("정지 처리 실패: 서버 연결 상태를 확인해주세요.");
    }
  };

  // 🌟 정지 해제 함수
  const handleRelease = async (user) => {
    if (!window.confirm(`${user.nickname}님의 정지를 해제하시겠습니까?`)) return;

    try {
      await axios.post(`http://localhost:8080/api/admin/members/${user.id}/release`, {
        reason: "관리자 직권 해제" 
      });
      alert("정지가 해제되었습니다.");
      
      // 목록 새로고침 (페이징과 검색 상태 유지)
      loadMembers(currentPage, isSearching, keyword); 
    } catch (err) {
      alert("정지 해제 실패: 서버를 확인해주세요.");
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
                {/* 🌟 불필요한 USER 뱃지 제거 및 정지/해제 버튼 분기 처리 완벽 적용 */}
                <span className={`${styles.statusBadge} ${m.status === "ACTIVE" ? styles.statusActive : styles.statusBanned}`}>
                  {m.status === "ACTIVE" ? "활성" : "정지"}
                </span>
                
                {m.status === "ACTIVE" ? (
                  <button className={styles.actionBtn} onClick={() => {
                    setSelectedUser(m);
                    setSuspendData({ duration: "DAYS_3", reason: "SPAM", customReason: "" }); // 초기화
                  }}>정지 처리</button>
                ) : (
                  <button 
                    className={styles.actionBtn} 
                    style={{ borderColor: "#10B981", color: "#10B981" }} // 초록색(해제 느낌) 스타일 적용
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

      {/* 🌟 예쁘고 직관적인 모달창 */}
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
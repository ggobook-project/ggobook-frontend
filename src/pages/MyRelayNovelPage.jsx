import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // 🌟 방금 전까지 세팅한 만능 요원 투입!
import styles from "../styles/MyRelayNovelPage.module.css";

export default function MyRelayNovelPage() {
  const navigate = useNavigate();

  // 1. 상태 관리 (상태가 바뀌면 리액트가 화면을 알아서 다시 그립니다)
  const [relays, setRelays] = useState([]); // 백엔드에서 가져온 진짜 데이터
  const [activeTab, setActiveTab] = useState("전체"); // 현재 눌린 탭 ("전체", "시작자", "참여자")
  const [isLoading, setIsLoading] = useState(true);

  // 2. 백엔드 데이터 호출 (화면이 처음 켜질 때 딱 한 번 실행)
  useEffect(() => {
    const fetchRelayNovels = async () => {
      try {
        // 🌟 우리가 백엔드에 뚫어놓은 그 주소로 요청! (토큰은 api 요원이 알아서 챙겨갑니다)
        const response = await api.get('/api/mypage/relay-novels');
        setRelays(response.data); 
      } catch (error) {
        console.error("릴레이 소설 목록을 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelayNovels();
  }, []);

  // 3. 탭 필터링 로직 (선택된 탭에 맞춰서 보여줄 데이터만 추려냅니다)
  const filteredRelays = relays.filter(r => {
    if (activeTab === "전체") return true;
    return r.role === activeTab; // r.role이 "시작자" 또는 "참여자" 인것만 통과!
  });

  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>로딩중...</div>;

  return (
    <div className={styles.pageWrapper}>
      {/* --- 상단 헤더 영역 --- */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 릴레이 소설</div>
        <div className={styles.headerSubtitle}>참여한 릴레이 소설 목록</div>

        {/* 🌟 중앙 정렬된 탭(Tab) 메뉴 추가 */}
        <div className={styles.tabContainer}>
          {["전체", "시작자", "참여자"].map(tab => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- 소설 리스트 영역 --- */}
      <div className={styles.content}>
        {/* 만약 필터링 된 데이터가 1개도 없다면? */}
        {filteredRelays.length === 0 ? (
          <div className={styles.emptyState}>해당하는 릴레이 소설이 없습니다.</div>
        ) : (
          filteredRelays.map(r => (
            <div key={r.id} className={styles.card} onClick={() => navigate(`/relay/${r.id}`)}>
              <div className={styles.cardTop}>
                {/* 🌟 요구사항 반영: 제목 옆에 있던 시작자/참여자 뱃지 삭제! */}
                <div className={styles.cardTitle}>{r.title}</div>
              </div>
              <div className={styles.cardMeta}>
                내 이어쓰기 {r.entries}개 · 참여자 {r.participants}명 · 참여일: {r.date}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
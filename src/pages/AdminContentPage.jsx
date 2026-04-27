import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import styles from "../styles/AdminContentPage.module.css"

const contentTypes = ["웹툰", "웹소설"]

export default function AdminContentPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState("웹툰")
  const [query, setQuery] = useState("")
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)

  // 🌟 백엔드 API로부터 타입과 검색어를 기반으로 작품 목록 조회
  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/contents", {
        params: { 
          type: activeType,
          keyword: query 
        }
      });
      setContents(response.data || []);
    } catch (error) {
      console.error("작품 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [activeType, query]);

  // 탭이 바뀌거나 검색어가 입력될 때 자동 실행
  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      loadContents(); // 엔터 입력 시 검색 수행
    }
  }

  const CardItem = ({ item }) => (
    <div
      className={styles.cardItem}
      onClick={() => navigate(`/admin/content/${item.contentId}`)}
    >
      {item.thumbnailUrl
        ? <img src={item.thumbnailUrl} alt={item.title} className={styles.cardImg} />
        : <div className={styles.cardImgPlaceholder} />
      }
      <div className={styles.cardTitle}>{item.title}</div>
      <div className={styles.cardGenre}>{item.genre}</div>
      <div className={styles.cardStatus} style={{fontSize: '12px', color: '#666'}}>
        작가: {item.authorNickname}
      </div>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 관리</div>
        <div className={styles.headerSubtitle}>실제 연재 중인 작품 리스트입니다.</div>
        <div className={styles.headerInner}>
          <div className={styles.searchBox}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="작품명 또는 작가명 검색"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`${styles.tabBtn} ${activeType === type ? styles.tabBtnActive : ""}`}
            >{type}</button>
          ))}
        </div>

        <div className={styles.sectionTitle}>{activeType} 목록</div>
        
        {loading ? (
          <div className={styles.loadingWrap}>로딩 중...</div>
        ) : contents.length === 0 ? (
          <div className={styles.noMore}>검색 결과가 없거나 등록된 작품이 없습니다.</div>
        ) : (
          <div className={styles.dailyGrid}>
            {contents.map((item) => (
              <CardItem key={item.contentId} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
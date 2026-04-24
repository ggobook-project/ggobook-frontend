import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/AdminInspectionPage.module.css";

export default function AdminInspectionPage() {
  const navigate = useNavigate();

  // 메인 탭: 회차 검수 / 작품 검수
  const [mainTab, setMainTab] = useState("작품 검수")
  const [typeFilter, setTypeFilter] = useState("전체")

  // 회차 검수 데이터 (기존 백엔드 연동)
  const [episodeItems, setEpisodeItems] = useState([])

  // 작품 검수 데이터 (localStorage)
  const [contentItems, setContentItems] = useState([])

  const loadEpisodeInspections = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/inspections")
      let dataList = []
      if (Array.isArray(response.data)) dataList = response.data
      else if (response.data?.content) dataList = response.data.content
      else if (response.data?.data) dataList = response.data.data
      setEpisodeItems(dataList)
    } catch {
      // 백엔드 미연결 시 빈 배열 유지
    }
  }

  const loadContentInspections = () => {
    const stored = JSON.parse(localStorage.getItem("pendingContents") || "[]")
    setContentItems(stored)
  }

  useEffect(() => {
    loadEpisodeInspections()
    loadContentInspections()
  }, [])

  const handleApprove = (id) => {
    const updated = contentItems.map(c =>
      c.id === id ? { ...c, status: "연재중" } : c
    )
    setContentItems(updated)
    localStorage.setItem("pendingContents", JSON.stringify(updated))
    alert("승인되었습니다. 작품이 게시됩니다.")
  }

  const handleReject = (id) => {
    const reason = window.prompt("반려 사유를 입력하세요.")
    if (reason === null) return
    const updated = contentItems.map(c =>
      c.id === id ? { ...c, status: "반려됨", rejectReason: reason } : c
    )
    setContentItems(updated)
    localStorage.setItem("pendingContents", JSON.stringify(updated))
    alert("반려 처리되었습니다.")
  }

  const filteredEpisodes = episodeItems.filter(item => {
    if (typeFilter === "전체") return true
    const type = item.content?.type
    return typeFilter === type
  })

  const pendingContents = contentItems.filter(c => c.status === "검수중")

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>검수 관리</div>
        <div className={styles.headerSubtitle}>등록된 작품 및 회차를 검토하고 승인/반려하세요</div>
      </div>

      <div className={styles.content}>
        {/* 메인 탭 */}
        <div className={styles.filterGroup} style={{ marginBottom: 24 }}>
          {["작품 검수", "회차 검수"].map(tab => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`${styles.filterBtn} ${mainTab === tab ? styles.filterBtnActive : ""}`}
            >{tab}</button>
          ))}
        </div>

        {/* 작품 검수 */}
        {mainTab === "작품 검수" && (
          <>
            {pendingContents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#90A4C8", fontSize: 14 }}>
                검수 대기 중인 작품이 없습니다.
              </div>
            ) : (
              pendingContents.map(item => (
                <div key={item.id} className={styles.itemCard} style={{ cursor: "default" }}>
                  <div className={styles.itemLeft}>
                    <div className={styles.thumbnail} />
                    <div>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemMeta}>
                        {item.type} · {item.genre}
                        {item.summary && ` · ${item.summary}`}
                      </div>
                      <div className={styles.itemMeta} style={{ marginTop: 2 }}>
                        신청일: {item.registeredAt}
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionGroup}>
                    <button
                      className={styles.btnApprove}
                      onClick={() => handleApprove(item.id)}
                    >승인</button>
                    <button
                      className={styles.btnReject}
                      onClick={() => handleReject(item.id)}
                    >반려</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* 회차 검수 (기존) */}
        {mainTab === "회차 검수" && (
          <>
            <div className={styles.filterGroup}>
              {["전체", "웹툰", "웹소설"].map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`${styles.filterBtn} ${typeFilter === f ? styles.filterBtnActive : ""}`}
                >{f}</button>
              ))}
            </div>

            {filteredEpisodes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#90A4C8", fontSize: 14 }}>
                현재 대기 중인 회차 검수 요청이 없습니다.
              </div>
            ) : (
              filteredEpisodes.map(item => {
                const contentInfo = item.content || {}
                return (
                  <div
                    key={item.episodeId}
                    className={styles.itemCard}
                    onClick={() => navigate(`/admin/inspection/detail/${item.episodeId}`)}
                  >
                    <div className={styles.itemLeft}>
                      {contentInfo.thumbnailUrl ? (
                        <img src={contentInfo.thumbnailUrl} className={styles.thumbnail} alt="썸네일" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className={styles.thumbnail} />
                      )}
                      <div>
                        <div className={styles.itemTitle}>{contentInfo.title || item.episodeTitle || "제목 없음"}</div>
                        <div className={styles.itemMeta}>
                          작가: {contentInfo.author?.nickname || contentInfo.author?.id || "미상"} · {contentInfo.type} · {item.episodeNumber}화
                        </div>
                      </div>
                    </div>
                    <div className={styles.actionGroup}>
                      <span style={{ fontSize: 13, color: "#2196F3", fontWeight: 600 }}>상세 검토하기 ➔</span>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}

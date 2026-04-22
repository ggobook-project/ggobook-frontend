import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "../styles/EpisodeRegisterPage.module.css"

export default function EpisodeRegisterPage() {
  const navigate = useNavigate()
  const [isFree, setIsFree] = useState(true)
  const [scheduled, setScheduled] = useState(false)
  const [isNovel, setIsNovel] = useState(false)
  const { contentId } = useParams()

  const [thumbFile, setThumbFile] = useState(null)
  const [episodeNumber, setEpisodeNumber] = useState(null)
  const [episodeTitle, setEpisodeTitle] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")

  const [novelText, setNovelText] = useState("")
  const [comicFiles, setComicFiles] = useState([])

  const [ttsFileUrl, setTtsFileUrl] = useState("")


  const handleEpisodeRegister = async () => {
    if (!episodeTitle) {
      alert("회차 제목은 필수입니다.")
      return
    }
    if (isNovel && !novelText.trim()) {
      alert("원고 내용은 필수입니다.")
      return
    }
    if (!isNovel && comicFiles.length === 0) {
      alert("웹툰 이미지를 1장 이상 업로드해주세요.")
      return
    }

    const userEpisode = { 
      episodeNumber : episodeNumber ? parseInt(episodeNumber) : null, 
      episodeTitle,  
      isFree, 
      scheduledAt : scheduledAt || null }

    const formData = new FormData()
    formData.append("episode", new Blob([JSON.stringify(userEpisode)], { type: "application/json" }))

    if(thumbFile) formData.append("thumbnail", thumbFile)

    if(isNovel) {
      const UserNovel = {contentText : novelText, ttsFileUrl}
      formData.append("novel", new Blob([JSON.stringify(UserNovel)], { type: "application/json" }))
    }else {
      comicFiles.forEach((file, idx) => formData.append("episodeFiles", file))      
    }

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch("http://localhost:8080/api/contents/" + contentId + "/episodes", {
        method: "POST", headers: { 'Authorization': `Bearer ${token}` }, body: formData
      })
      if (response.ok) { alert("회차 등록 성공"); navigate("/author/contents/" + contentId) }
      else alert("백엔드 통신 실패 : 회차 등록")
    } catch (error) { alert("에러 발생 (회차 등록 실패) : ", error) }


  }

    const checkNovelForTTS = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch("http://localhost:8080/api/contents/" + contentId, {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) { alert("백엔드 통신 실패(작품 상세)"); return }
      const data = await response.json()
      setIsNovel(data.type === "웹소설")
    } catch (error) {
      console.error("작품 상세 불러오기 실패 : ", error)
    }
  }

  useEffect(() => {
    checkNovelForTTS()

  }, [contentId])




  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>회차 등록</div>
        <div className={styles.headerSubtitle}>새 회차를 등록하세요</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 번호</div>
            <input
              type="number"
              placeholder="회차 번호 입력"
              className={styles.input}
              onChange={e => setEpisodeNumber(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 제목</div>
            <input placeholder="회차 제목 입력" className={styles.input} onChange={e => setEpisodeTitle(e.target.value)}/>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>썸네일</div>
            <input
              type="file"
              accept="image/*"
              className={styles.input}
              onChange={e => setThumbFile(e.target.files[0])}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>원고 업로드</div>
            <div className={styles.fileUpload}>
              {isNovel ? (
                // ✅ 텍스트 입력칸으로 변경
                <textarea
                  placeholder="원고 내용을 입력하세요"
                  className={styles.textarea}
                  rows={15}
                  value={novelText}
                  onChange={e => setNovelText(e.target.value)}
                />
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setComicFiles(Array.from(e.target.files))}
                  />
                  {comicFiles.length > 0 && (
                    <span className={styles.fileLabel}>{comicFiles.length}장 선택됨</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>공개 설정</div>
            <div className={styles.typeGroup}>
              {[{ label: "무료", val: true }, { label: "유료", val: false }].map(opt => (
                <button key={opt.label} onClick={() => setIsFree(opt.val)} className={`${styles.typeBtn} ${isFree === opt.val ? styles.typeBtnActive : ""}`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.scheduleRow}>
              <div className={styles.formLabel}>예약 업로드</div>
              <button
                onClick={() => setScheduled(!scheduled)}
                className={`${styles.toggleBtn} ${scheduled ? styles.toggleBtnActive : ""}`}
              >{scheduled ? "ON" : "OFF"}</button>
            </div>
            {scheduled && (
              <input
                type="datetime-local"
                onChange={e => setScheduledAt(e.target.value)}
                className={styles.input}
              />
            )}
          </div>

          {isNovel && (
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>TTS 목소리 설정</div>
            <div className={styles.ttsBox}>
              <div className={styles.ttsHint}>등장인물별 목소리를 설정하세요</div>
              {["나레이터", "주인공", "상대방"].map(ch => (
                <div key={ch} className={styles.ttsRow}>
                  <span className={styles.ttsChar}>{ch}</span>
                  <select className={styles.ttsSelect}>
                    <option>목소리 선택</option>
                    <option>차분한 여성</option>
                    <option>활발한 남성</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          )}


          <div className={styles.btnGroup}>
            {/* 작가의 회차 리스트가 보여지는 페이지를 만들게 된다면 navigate("/author/contents/" + contentId)로 바꾸기 */}
            <button className={styles.cancelBtn} onClick={() => navigate("/author/contents")}>취소</button>
            <button className={styles.submitBtn} onClick={handleEpisodeRegister}>등록하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
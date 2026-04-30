import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect  } from "react"
import api from "../api/axios"
import styles from "../styles/ContentRegisterPage.module.css"

export default function ContentRegisterPage() {
  const navigate = useNavigate()
  const { contentId } = useParams()
  const isEdit = !!contentId

  const [type, setType] = useState("웹툰")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState("")

  const [serialDay, setSerialDay] = useState([])

  const toggleDay = (day) => {
    setSerialDay(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState("")
 

  const genres = ["로맨스", "판타지", "무협", "현대", "스릴러", "BL", "액션"]

 useEffect(() => {
    if (!isEdit) return
    const loadContent = async () => {
      try {
        const response = await api.get(`/api/contents/${contentId}`)
        const data = response.data
        setType(data.type === "WEBTOON" ? "웹툰" : "웹소설")
        setTitle(data.title || "")
        setGenre(data.genre || "")
        setSummary(data.summary || "")
        setDescription(data.description || "")
        setVideoUrl(data.videoUrl || "")
        setSerialDay(data.serialDays || [])
      } catch (error) {
        console.error("작품 불러오기 실패 : ", error)
      }
    }
 
    const loadTags = async () => {
      try {
        const response = await api.get(`/api/contents/${contentId}/tags`)
        setTags(response.data || [])
      } catch (error) {
        console.error("태그 불러오기 실패 : ", error)
      }
    }
 
    loadContent()
    loadTags()
  }, [contentId])
 
  const handleAddTag = async () => {
    if (!tagInput.trim()) return
    if (tags.some(t => t.tagName === tagInput.trim())) {
      alert("이미 추가된 태그입니다.")
      return
    }
 
    if (isEdit) {
      try {
        await api.post(`/api/contents/${contentId}/tags?tagName=${tagInput.trim()}`)
        const response = await api.get(`/api/contents/${contentId}/tags`)
        setTags(response.data || [])
      } catch (error) {
        console.error("태그 추가 실패 : ", error)
      }
    } else {
      setTags([...tags, { tagId: Date.now(), tagName: tagInput.trim() }])
    }
    setTagInput("")
  }
 
  const handleDeleteTag = async (tag) => {
    if (isEdit) {
      try {
        await api.delete(`/api/contents/${contentId}/tags/${tag.tagId}`)
        setTags(tags.filter(t => t.tagId !== tag.tagId))
      } catch (error) {
        console.error("태그 삭제 실패 : ", error)
      }
    } else {
      setTags(tags.filter(t => t.tagId !== tag.tagId))
    }
  }
 
  const saveToInspection = () => {
    const newContent = {
      id: Date.now(), title, type, genre, summary,
      registeredAt: new Date().toLocaleDateString("ko-KR"),
      status: "검수중"
    }
    const existing = JSON.parse(localStorage.getItem("pendingContents") || "[]")
    localStorage.setItem("pendingContents", JSON.stringify([...existing, newContent]))
    localStorage.setItem("userRole", "AUTHOR")
  }
 
  const handleSubmit = async () => {
    if (!title || !genre || serialDay.length === 0 || (!isEdit && !file)) {
      alert(isEdit ? "작품명, 장르, 연재 요일은 필수입니다." : "작품명, 장르, 연재 요일, 대표 이미지는 필수입니다.")
      return
    }
    const userContent = { title, type, genre, summary, description, videoUrl, serialDay: serialDay.join(",") }
    const formData = new FormData()
    formData.append("content", new Blob([JSON.stringify(userContent)], { type: "application/json" }))
    if (file) formData.append("file", file)
    
    try {
      const url = isEdit ? `/api/contents/${contentId}` : "/api/contents/"
      const response = await api({
        method: isEdit ? "PUT" : "POST",
        url: url,
        data: formData
      })
       console.log("작품 등록 응답:", response.data)
      if (response.status === 200 || response.status === 201) {
        const data = response.data
        const newContentId = data.contentId || data.id
        console.log("newContentId:", newContentId)
 
        if (!isEdit && tags.length > 0 && newContentId) {
          await Promise.all(
            tags.map(tag =>
              api.post(`/api/contents/${newContentId}/tags/register?tagName=${tag.tagName}`)
            )
          )
        }
 
        if (!isEdit) {
          saveToInspection()
          alert("검수 신청이 완료되었습니다.\n관리자 검수 후 게시됩니다.")
        } else {
          alert("작품 수정 성공")
        }
        navigate("/author/contents")
      }
    } catch (error) {
      console.error("통신 에러:", error);
      if (!isEdit) {
        saveToInspection()
        alert("검수 신청이 완료되었습니다.\n관리자 검수 후 게시됩니다.")
        navigate("/author/contents")
      } else {
        alert("수정 중 오류가 발생했습니다.")
      }
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{isEdit ? "작품 수정" : "작품 등록"}</div>
        <div className={styles.headerSubtitle}>{isEdit ? "작품 정보를 수정하세요" : "새 작품을 등록하세요"}</div>
      </div>
 
      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>작품 유형</div>
            <div className={styles.typeGroup}>
              {["웹툰", "웹소설"].map(t => (
                <button key={t} onClick={() => setType(t)} className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ""}`}>{t}</button>
              ))}
            </div>
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>작품명</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="작품명 입력" className={styles.input} />
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>장르</div>
            <div className={styles.genreGroup}>
              {genres.map(g => (
                <button key={g} onClick={() => setGenre(g)} className={`${styles.genreBtn} ${genre === g ? styles.genreBtnActive : ""}`}>{g}</button>
              ))}
            </div>
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>한줄 요약</div>
            <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="작품을 한 줄로 소개해주세요" className={styles.input} />
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>줄거리</div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="작품 줄거리를 입력해주세요" rows={4} className={styles.textarea} />
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>연재 요일 <span className={styles.optional}>(복수 가능)</span></div>
            <div className={styles.dayGroup}>
              {["월", "화", "수", "목", "금", "토", "일"].map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`${styles.dayBtn} ${serialDay.includes(day) ? styles.dayBtnActive : ""} ${day === "토" ? styles.dayBtnSat : ""} ${day === "일" ? styles.dayBtnSun : ""}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>태그</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddTag()}
                placeholder="태그 입력 후 Enter 또는 추가 버튼"
                className={styles.input}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddTag}
                className={styles.typeBtn}
                style={{ flexShrink: 0 }}
              >
                추가
              </button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {tags.map(tag => (
                  <div key={tag.tagId} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "#E3F2FD", borderRadius: 20,
                    padding: "4px 12px", fontSize: 13, color: "#1565C0"
                  }}>
                    #{tag.tagName}
                    <span
                      onClick={() => handleDeleteTag(tag)}
                      style={{ cursor: "pointer", fontSize: 12, color: "#90A4C8", marginLeft: 2 }}
                    >✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>
              대표 이미지 {isEdit && <span className={styles.optional}>(변경 시에만 업로드)</span>}
            </div>
            <label className={styles.fileBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {file ? file.name : "이미지 업로드"}
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            </label>
            {file && (
              <div className={styles.previewBox}>
                <img src={URL.createObjectURL(file)} alt="대표 이미지 미리보기" className={styles.previewImg} />
                <button className={styles.previewRemove} onClick={() => setFile(null)}>✕</button>
              </div>
            )}
          </div>
 
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>홍보 영상 URL <span className={styles.optional}>(선택)</span></div>
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://media.giphy.com/... 또는 영상 URL 입력" className={styles.input} />
            {videoUrl && (
              <div className={styles.preview}>
                {videoUrl.includes("giphy.com")
                  ? <img src={videoUrl} alt="미리보기" className={styles.previewMedia} />
                  : <video src={videoUrl} autoPlay loop muted className={styles.previewMedia} />}
                <div className={styles.previewLabel}>미리보기</div>
              </div>
            )}
          </div>
 
          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate(isEdit ? `/author/contents/${contentId}` : "/author/contents")}>
              취소
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              {isEdit ? "수정하기" : "등록하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

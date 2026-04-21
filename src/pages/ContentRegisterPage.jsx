import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/ContentRegisterPage.module.css"

export default function ContentRegisterPage() {
  const navigate = useNavigate()
  const [type, setType] = useState("웹툰")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState("")

  const genres = ["로맨스", "판타지", "무협", "현대", "스릴러", "BL", "액션"]

  const handleContentRegister = async () => {
    if (!title || !genre || !file) {
      alert("작품명, 장르, 대표 이미지는 필수입니다.")
      return
    }
    const userContent = { title, type, genre, summary, description, videoUrl }
    const formData = new FormData()
    formData.append("content", new Blob([JSON.stringify(userContent)], { type: "application/json" }))
    formData.append("file", file)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch("http://localhost:8080/api/contents/", {
        method: "POST", headers: { 'Authorization': `Bearer ${token}` }, body: formData
      })
      if (response.ok) { alert("작품 등록 성공"); navigate("/author/contents") }
      else alert("백엔드 통신 실패")
    } catch (error) { alert("에러 발생 : ", error) }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>작품 등록</div>
        <div className={styles.headerSubtitle}>새 작품을 등록하세요</div>
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
            <div className={styles.formLabel}>대표 이미지</div>
            <div className={styles.fileUpload}>
              <input type="file" onChange={e => setFile(e.target.files[0])} className={styles.fileInput} />
              <span className={styles.fileLabel}>+ 이미지 업로드</span>
            </div>
            {file && <div className={styles.fileName}>✓ {file.name}</div>}
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
            <button className={styles.cancelBtn} onClick={() => navigate("/author/contents")}>취소</button>
            <button className={styles.submitBtn} onClick={handleContentRegister}>등록하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
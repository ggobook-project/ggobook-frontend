import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/ContentRegisterPage.module.css"

const mockContents = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  title: `내 작품 ${i + 1}`,
  type: i % 2 === 0 ? "웹툰" : "웹소설",
  genre: ["로맨스", "판타지", "무협", "현대"][i % 4],
  summary: `${i + 1}번 작품의 한줄 소개입니다.`,
  description: `${i + 1}번 작품의 줄거리입니다. 흥미진진한 이야기가 펼쳐집니다.`,
  videoUrl: ""
}))

export default function ContentRegisterPage() {
  const navigate = useNavigate()
  const { contentId } = useParams()
  const isEdit = !!contentId
  const editContent = isEdit ? mockContents.find(c => c.id === Number(contentId)) : null

  const [type, setType] = useState(editContent?.type ?? "웹툰")
  const [title, setTitle] = useState(editContent?.title ?? "")
  const [genre, setGenre] = useState(editContent?.genre ?? "")
  const [summary, setSummary] = useState(editContent?.summary ?? "")
  const [description, setDescription] = useState(editContent?.description ?? "")
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(editContent?.videoUrl ?? "")

  const genres = ["로맨스", "판타지", "무협", "현대", "스릴러", "BL", "액션"]

  const handleSubmit = async () => {
    if (!title || !genre || (!isEdit && !file)) {
      alert(isEdit ? "작품명과 장르는 필수입니다." : "작품명, 장르, 대표 이미지는 필수입니다.")
      return
    }
    const userContent = { title, type, genre, summary, description, videoUrl }
    const formData = new FormData()
    formData.append("content", new Blob([JSON.stringify(userContent)], { type: "application/json" }))
    if (file) formData.append("file", file)
    try {
      const token = localStorage.getItem("accessToken")
      const url = isEdit
        ? `http://localhost:8080/api/contents/${contentId}`
        : "http://localhost:8080/api/contents/"
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      if (response.ok) {
        alert(isEdit ? "작품 수정 성공" : "작품 등록 성공")
        navigate("/author/contents")
      } else {
        alert("백엔드 통신 실패")
      }
    } catch (error) {
      alert("에러 발생 : ", error)
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

import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { getMyPageMainData, checkNicknameDuplicate, updateMyInfo } from "../api/mypageApi"
import styles from "../styles/MyInfoEditPage.module.css"

export default function MyInfoEditPage() {
  const navigate = useNavigate()

  const [nickname, setNickname] = useState("")
  const [originalNickname, setOriginalNickname] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
  const [isNicknameChecked, setIsNicknameChecked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarFile, setAvatarFile] = useState(null)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const data = await getMyPageMainData()
        setNickname(data.profile.nickname)
        setOriginalNickname(data.profile.nickname)
        setEmail(data.profile.email)
      } catch {
        alert("정보를 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyInfo()
  }, [])

  const handleCheckNickname = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요.")
    if (nickname === originalNickname) return alert("현재 사용 중인 닉네임입니다.")
    try {
      const isDuplicated = await checkNicknameDuplicate(nickname)
      if (isDuplicated) {
        alert("이미 사용 중인 닉네임입니다.")
        setIsNicknameChecked(false)
      } else {
        alert("사용 가능한 닉네임입니다.")
        setIsNicknameChecked(true)
      }
    } catch {
      alert("중복 확인에 실패했습니다.")
    }
  }

  const handleSubmit = async () => {
    if (nickname !== originalNickname && !isNicknameChecked) return alert("닉네임 중복 확인을 해주세요.")
    if (newPassword && newPassword !== newPasswordConfirm) return alert("새 비밀번호가 일치하지 않습니다.")
    if (newPassword && !currentPassword) return alert("비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.")
    try {
      const updateData = { nickname, ...(newPassword && { currentPassword, newPassword }) }
      await updateMyInfo(updateData)
      alert("정보가 성공적으로 수정되었습니다.")
      navigate("/mypage")
    } catch (error) {
      alert(error.response?.data?.message || "정보 수정에 실패했습니다.")
    }
  }

  if (isLoading) return <div style={{ textAlign: "center", padding: "50px", color: "#4A6FA5" }}>로딩중...</div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 정보 수정</div>
        <div className={styles.headerSubtitle}>프로필과 비밀번호를 변경할 수 있습니다</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>

          {/* 프로필 사진 */}
          <div className={styles.avatarWrap} onClick={() => avatarInputRef.current?.click()}>
            <div
              className={styles.avatar}
              style={avatarFile ? {
                backgroundImage: `url(${URL.createObjectURL(avatarFile)})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              } : undefined}
            />
            <div className={styles.avatarEdit}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => setAvatarFile(e.target.files[0])}
            />
          </div>
          {avatarFile && <div className={styles.avatarName}>✓ {avatarFile.name}</div>}

          {/* 닉네임 */}
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>닉네임</div>
            <div className={styles.inputRow}>
              <input
                value={nickname}
                onChange={e => { setNickname(e.target.value); setIsNicknameChecked(e.target.value === originalNickname) }}
                className={styles.input}
              />
              <button
                className={`${styles.sideBtn} ${isNicknameChecked ? styles.sideBtnDone : ""}`}
                onClick={handleCheckNickname}
              >
                {isNicknameChecked ? "✓ 확인됨" : "중복확인"}
              </button>
            </div>
          </div>

          {/* 이메일 */}
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>이메일</div>
            <div className={styles.inputRow}>
              <input value={email} readOnly className={`${styles.input} ${styles.inputReadonly}`} />
              <button className={styles.sideBtnMuted} onClick={() => alert("이메일은 변경할 수 없습니다.")}>
                인증완료
              </button>
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className={styles.pwSection}>
            <div className={styles.pwTitleRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className={styles.pwTitle}>비밀번호 변경</span>
            </div>
            <div className={styles.pwHint}>변경하지 않으려면 비워두세요</div>

            <div className={styles.formGroup}>
              <div className={styles.formLabel}>현재 비밀번호</div>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
                className={styles.inputFull}
              />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.formLabel}>새 비밀번호</div>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className={styles.inputFull}
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <div className={styles.formLabel}>새 비밀번호 확인</div>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={e => setNewPasswordConfirm(e.target.value)}
                placeholder="새 비밀번호 다시 입력"
                className={`${styles.inputFull} ${newPassword && newPasswordConfirm && newPassword !== newPasswordConfirm ? styles.inputError : ""}`}
              />
              {newPassword && newPasswordConfirm && newPassword !== newPasswordConfirm && (
                <div className={styles.errorMsg}>비밀번호가 일치하지 않습니다</div>
              )}
            </div>
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate("/mypage")}>취소</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>저장하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getMyPageMainData, checkNicknameDuplicate, updateMyInfo } from "../api/mypageApi"
import styles from "../styles/MyInfoEditPage.module.css"

export default function MyInfoEditPage() {
  const navigate = useNavigate()
  
  // 1. 상태 관리 (State)
  const [nickname, setNickname] = useState("")
  const [originalNickname, setOriginalNickname] = useState("") // 변경 여부 확인용
  const [email, setEmail] = useState("") // 이메일은 보통 수정 불가로 둡니다
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("")

  const [isNicknameChecked, setIsNicknameChecked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // 2. 화면 로딩 시 기존 내 정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const data = await getMyPageMainData()
        setNickname(data.profile.nickname)
        setOriginalNickname(data.profile.nickname)
        setEmail(data.profile.email)
      } catch (error) {
        alert("정보를 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyInfo()
  }, [])

  // 3. 닉네임 중복 확인 로직
  const handleCheckNickname = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요.")
    if (nickname === originalNickname) return alert("현재 사용 중인 닉네임입니다.")

    try {
      const isDuplicated = await checkNicknameDuplicate(nickname)
      if (isDuplicated) {
        alert("❌ 이미 사용 중인 닉네임입니다.")
        setIsNicknameChecked(false)
      } else {
        alert("✅ 사용 가능한 닉네임입니다.")
        setIsNicknameChecked(true)
      }
    } catch (error) {
      alert("중복 확인에 실패했습니다.")
    }
  }

  // 4. 정보 저장 (Submit) 로직
  const handleSubmit = async () => {
    // 유효성 검사
    if (nickname !== originalNickname && !isNicknameChecked) {
      return alert("닉네임 중복 확인을 해주세요.")
    }
    if (newPassword && newPassword !== newPasswordConfirm) {
      return alert("새 비밀번호가 일치하지 않습니다.")
    }
    if (newPassword && !currentPassword) {
      return alert("비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.")
    }

    try {
      // 🌟 백엔드에 보낼 데이터 조립 (비밀번호는 입력했을 때만 보냄)
      const updateData = {
        nickname: nickname,
        ...(newPassword && { currentPassword, newPassword }) 
      }

      await updateMyInfo(updateData)
      alert("🎉 정보가 성공적으로 수정되었습니다.")
      navigate("/mypage")
    } catch (error) {
      alert(error.response?.data?.message || "정보 수정에 실패했습니다.")
    }
  }

  if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>로딩중...</div>

  // 🌟 클린 코드 핵심: 팀원분의 map 구조를 깨지 않고 속성만 영리하게 매핑
  const topFields = [
    { 
      label: "닉네임", 
      value: nickname, 
      setter: (val) => { setNickname(val); setIsNicknameChecked(val === originalNickname); }, 
      btn: isNicknameChecked ? "✓ 확인됨" : "중복확인",
      onBtnClick: handleCheckNickname,
      readOnly: false
    },
    { 
      label: "이메일", 
      value: email, 
      setter: setEmail, 
      btn: "인증완료", // 이메일은 보통 수정불가이므로 버튼 막기
      onBtnClick: () => alert("이메일은 변경할 수 없습니다."),
      readOnly: true
    },
  ]

  const pwFields = [
    { label: "현재 비밀번호", value: currentPassword, setter: setCurrentPassword },
    { label: "새 비밀번호", value: newPassword, setter: setNewPassword },
    { label: "새 비밀번호 확인", value: newPasswordConfirm, setter: setNewPasswordConfirm },
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>내 정보 수정</div>
        <div className={styles.headerSubtitle}>프로필과 비밀번호를 변경할 수 있습니다</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} />
            <div className={styles.avatarEdit}>✏</div>
          </div>

          {/* 상단 닉네임 / 이메일 영역 */}
          {topFields.map(f => (
            <div key={f.label} className={styles.formGroup}>
              <div className={styles.label}>{f.label}</div>
              <div className={styles.inputRow}>
                <input 
                  value={f.value} 
                  onChange={e => f.setter(e.target.value)} 
                  readOnly={f.readOnly}
                  className={styles.input} 
                  style={{ backgroundColor: f.readOnly ? "#f5f5f5" : "white" }}
                />
                <button 
                  className={styles.sideBtn} 
                  onClick={f.onBtnClick}
                  style={{ color: f.label === "닉네임" && isNicknameChecked ? "#34A853" : undefined }}
                >
                  {f.btn}
                </button>
              </div>
            </div>
          ))}

          {/* 하단 비밀번호 영역 */}
          <div className={styles.pwSection}>
            <div className={styles.pwTitle}>비밀번호 변경</div>
            {pwFields.map(f => (
              <div key={f.label} className={styles.formGroup}>
                <div className={styles.label}>{f.label}</div>
                <input 
                  type="password" 
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  placeholder={f.label} 
                  className={styles.inputFull} 
                />
              </div>
            ))}
          </div>

          {/* 버튼 영역 */}
          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate("/mypage")}>취소</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>저장하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
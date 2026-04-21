import { useNavigate } from "react-router-dom"
import { useState } from "react"
import styles from "../styles/AdminMemberPage.module.css"

export default function AdminMemberPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const members = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, nickname: `회원${i + 1}`, email: `user${i + 1}@email.com`,
    role: i === 0 ? "관리자" : i === 1 ? "작가" : "일반",
    status: i === 5 ? "정지" : "활성", joinDate: "2026.03.01"
  }))

  const filtered = members.filter(m =>
    m.nickname.includes(query) || m.email.includes(query)
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>회원 관리</div>
        <div className={styles.headerSubtitle}>회원 정보를 조회하고 관리하세요</div>
        <div className={styles.searchWrap}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="아이디, 닉네임 검색"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {filtered.map(m => (
          <div
            key={m.id}
            className={styles.memberCard}
            onClick={() => navigate(`/admin/members/${m.id}`)}
          >
            <div className={styles.memberLeft}>
              <div className={styles.avatar} />
              <div>
                <div className={styles.memberName}>{m.nickname}</div>
                <div className={styles.memberMeta}>{m.email} · 가입일: {m.joinDate}</div>
              </div>
            </div>
            <div className={styles.memberRight} onClick={e => e.stopPropagation()}>
              <span className={styles.roleBadge}>{m.role}</span>
              <span className={`${styles.statusBadge} ${m.status === "활성" ? styles.statusActive : styles.statusBanned}`}>
                {m.status}
              </span>
              <button className={styles.actionBtn}>정지</button>
              <button className={styles.actionBtn}>포인트</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
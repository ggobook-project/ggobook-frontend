import styles from "../styles/AlertModal.module.css";

export default function AlertModal({ isOpen, type = "info", title, message, isConfirm, onConfirm, onCancel }) {
  if (!isOpen) return null;

  const icons = {
    success: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    warning: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="6" x2="12" y2="14" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    confirm: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 9.5 15 10.5 12 12V13" />
        <line x1="12" y1="17.5" x2="12.01" y2="17.5" strokeWidth="3.5" />
      </svg>
    ),
    info: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="9" x2="12" y2="17" />
        <line x1="12" y1="5" x2="12.01" y2="5" />
      </svg>
    ),
  };

  const resolvedType = isConfirm ? "confirm" : type;

  const defaultTitles = {
    success: "완료",
    error: "오류 발생",
    warning: "주의",
    info: "안내",
    confirm: "확인",
  };

  const displayTitle = title || defaultTitles[resolvedType];

  return (
    <div className={styles.overlay} onClick={isConfirm ? undefined : onConfirm}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.iconCircle} data-type={resolvedType}>
          {icons[resolvedType]}
        </div>
        <div className={styles.title}>{displayTitle}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.btnRow}>
          {isConfirm && (
            <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
          )}
          <button className={styles.confirmBtn} onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

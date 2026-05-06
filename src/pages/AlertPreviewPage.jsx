import { useAlert } from "../context/AlertContext";

const CASES = [
  {
    label: "성공 (title O)",
    color: "#4CAF50",
    action: (showAlert) => showAlert("신고가 정상적으로 접수되었습니다.", "success", "신고 완료"),
  },
  {
    label: "성공 (title X)",
    color: "#4CAF50",
    action: (showAlert) => showAlert("저장되었습니다.", "success"),
  },
  {
    label: "에러 (title O)",
    color: "#E53935",
    action: (showAlert) => showAlert("아이디 또는 비밀번호가 일치하지 않습니다.", "error", "로그인 실패"),
  },
  {
    label: "에러 (title X)",
    color: "#E53935",
    action: (showAlert) => showAlert("서버 오류가 발생했습니다.", "error"),
  },
  {
    label: "경고 (title O)",
    color: "#FFA000",
    action: (showAlert) => showAlert("아이디와 비밀번호를 모두 입력해주세요.", "warning", "입력 오류"),
  },
  {
    label: "경고 (title X)",
    color: "#FFA000",
    action: (showAlert) => showAlert("변경사항이 저장되지 않을 수 있습니다.", "warning"),
  },
  {
    label: "정보 (title O)",
    color: "#2196F3",
    action: (showAlert) => showAlert("포인트가 충전되었습니다.", "info", "충전 완료"),
  },
  {
    label: "정보 (title X)",
    color: "#2196F3",
    action: (showAlert) => showAlert("현재 서비스 점검 중입니다.", "info"),
  },
  {
    label: "확인창 (confirm)",
    color: "#2196F3",
    action: async (_, showConfirm) => {
      const ok = await showConfirm("정말로 삭제하시겠습니까?", "삭제 확인");
      await showAlert(ok ? "삭제되었습니다." : "취소되었습니다.", ok ? "success" : "info");
    },
  },
  {
    label: "확인창 (title X)",
    color: "#2196F3",
    action: async (_, showConfirm) => {
      const ok = await showConfirm("로그아웃 하시겠습니까?");
      await showAlert(ok ? "로그아웃 완료." : "취소되었습니다.", ok ? "success" : "info");
    },
  },
  {
    label: "정지 안내 (긴 메시지)",
    color: "#E53935",
    action: (showAlert) =>
      showAlert(
        `해당 계정은 정지 상태입니다.\n\n사유 : 욕설 및 혐오 발언\n해제일 : 2025-06-01`,
        "error",
        "로그인 제한 안내"
      ),
  },
];

// showAlert를 action 클로저 안에서 쓰기 위한 참조용
let _showAlert;

export default function AlertPreviewPage() {
  const { showAlert, showConfirm } = useAlert();
  _showAlert = showAlert;

  return (
    <div style={{ maxWidth: 720, margin: "60px auto", padding: "0 24px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0D1B2A", marginBottom: 8 }}>
        Alert 모달 미리보기
      </h2>
      <p style={{ fontSize: 13, color: "#7A9CC0", marginBottom: 40 }}>
        버튼을 눌러 각 타입의 alert 모달을 확인하세요.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {CASES.map(({ label, color, action }) => (
          <button
            key={label}
            onClick={() => action(showAlert, showConfirm)}
            style={{
              padding: "16px 12px",
              borderRadius: 14,
              border: `1.5px solid ${color}22`,
              background: `${color}11`,
              color: "#0D1B2A",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s, transform 0.1s",
              textAlign: "center",
              lineHeight: 1.5,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.transform = "none"; }}
          >
            <span style={{ display: "block", width: 10, height: 10, borderRadius: "50%", background: color, margin: "0 auto 8px" }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

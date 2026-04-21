import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Auth.css";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/", { replace: true });
    } else if (error) {
      alert("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="auth-container">
      {/* 기존 auth-card 뼈대에 loading-card 클래스를 추가로 얹어서 여백과 정렬만 수정 */}
      <div className="auth-card auth-loading-card">
        <h2 className="auth-loading-title">로그인 처리 중입니다</h2>
        <p className="auth-loading-text">잠시만 기다려주세요... 🚀</p>
      </div>
    </div>
  );
}
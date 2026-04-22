import React from "react";
import "./AiChatbotWidget.css"; // CSS 파일 임포트

export default function AiChatbotWidget() {
  const handleChatClick = () => {
    // 나중에 여기에 모달 창을 열거나, 채팅창을 띄우는 로직을 넣을 겁니다.
    // React -> Spring Boot -> Python(LLM) 통신의 시작점이 될 버튼입니다.
    alert("AI 웹툰 도우미 호출 준비 완료!"); 
  };

  return (
    <div className="chatbot-widget" onClick={handleChatClick}>
      {/* 글자를 가리는 덮개 역할 (CSS에서 설정) */}
      <div className="text-mask"></div>
      
      <video
        className="mascot-video"
        src="/assets/mascot_original.mp4" /* 💡 다운받은 mp4 파일을 public/assets 폴더에 넣고 경로 지정 */
        autoPlay
        loop
        muted
        playsInline /* 모바일에서 전체화면으로 재생되는 것 방지 */
      />
    </div>
  );
}
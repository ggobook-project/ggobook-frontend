import { useState, useRef, useEffect } from "react";
import styles from "../styles/FloatingChatbot.module.css";
import llmApi from "../api/llmAxios";

const CONTENT_CHATBOT_FAQ = "지금 읽는 작품 내용 물어보기 (스포 없음)";

const FAQ_LIST = [
  CONTENT_CHATBOT_FAQ,
  "포인트는 어떻게 충전하나요?",
  "결제 취소 및 환불은 어떻게 하나요?",
  "유료 작품은 어떻게 구매하나요?",
  "웹툰 추천해줘",
  "웹소설 추천해줘",
  "회원가입은 어떻게 하나요?",
  "소셜 로그인이 가능한가요?",
  "작품은 어떻게 등록하나요?",
  "릴레이 소설이 뭔가요?",
  "TTS 기능은 어떻게 사용하나요?",
];

function getViewerInfo() {
  const pathname = window.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const match = pathname.match(/\/(?:novel|webtoon)\/viewer\/(\d+)/);
  if (!match) return null;
  const episodeId = Number(match[1]);
  const contentId = Number(search.get("contentId"));
  if (!episodeId || !contentId) return null;
  return { episodeId, contentId };
}

const stripEmoji = (str) =>
  str.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}]/gu, "").trim();

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content: "안녕하세요! 꼬북이에요\n무엇을 도와드릴까요?",
  },
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqVisible, setFaqVisible] = useState(true);
  const [retryText, setRetryText] = useState(null);
  const [contentMode, setContentMode] = useState(null); // { episodeId, contentId }
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

  const callApi = async (msgs, mode = null) => {
    if (mode) {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        null;
      const response = await llmApi.post("/api/content-chatbot/chat", {
        messages: msgs.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
        contentId: mode.contentId,
        currentEpisodeId: mode.episodeId,
        token,
      });
      return response.data.reply;
    }
    const response = await llmApi.post("/api/chatbot/chat", { messages: msgs });
    return response.data.reply;
  };

  const sendMessage = async (text, mode = contentMode) => {
    if (!text || loading) return;
    setFaqVisible(false);
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setRetryText(null);

    try {
      const reply = await callApi(newMessages, mode);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setRetryText(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "연결에 실패했습니다. LLM 서버가 실행 중인지 확인해주세요.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!retryText || loading) return;
    const text = retryText;
    setRetryText(null);
    const withoutError = messages.slice(0, -1);
    setMessages(withoutError);
    setLoading(true);

    try {
      const reply = await callApi(withoutError);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setRetryText(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "연결에 실패했습니다. LLM 서버가 실행 중인지 확인해주세요.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setFaqVisible(true);
    setRetryText(null);
    setInput("");
    setContentMode(null);
  };

  const handleSend = async () => await sendMessage(input.trim());

  const handleFaqClick = (question) => {
    if (question === CONTENT_CHATBOT_FAQ) {
      const info = getViewerInfo();
      if (!info) {
        setFaqVisible(false);
        setMessages((prev) => [
          ...prev,
          { role: "user", content: question },
          {
            role: "assistant",
            content:
              "작품 뷰어 페이지(소설 읽기 화면)에서 이용할 수 있어요! 작품을 먼저 열어주세요.",
          },
        ]);
        return;
      }
      setContentMode(info);
      sendMessage("지금 읽고 있는 회차까지의 내용을 바탕으로 궁금한 점에 답해줘. 스포일러는 없이.", info);
      return;
    }
    sendMessage(question);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <img
                src="/assets/꼬북이.png"
                alt="꼬북이"
                className={styles.headerAvatar}
              />
              <div>
                <div className={styles.headerName}>꼬북이</div>
                <div className={styles.headerSub}>
                  {contentMode ? "작품 챗봇 모드 · 스포일러 없음" : "GGoBook AI 도우미"}
                </div>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.resetBtn}
                onClick={handleReset}
                title="대화 초기화"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <polyline points="3 3 3 8 8 8" />
                </svg>
              </button>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={
                    msg.role === "user" ? styles.userRow : styles.botRow
                  }
                >
                  {msg.role === "assistant" && (
                    <img
                      src="/assets/꼬북이.png"
                      alt="꼬북이"
                      className={styles.botAvatar}
                    />
                  )}
                  <div
                    className={
                      msg.role === "user" ? styles.userBubble : styles.botBubble
                    }
                  >
                    {stripEmoji(msg.content)}
                    {msg.isError && !loading && (
                      <button className={styles.retryBtn} onClick={handleRetry}>
                        다시 시도
                      </button>
                    )}
                  </div>
                </div>
                {i === 0 && faqVisible && (
                  <div className={styles.faqList}>
                    {FAQ_LIST.map((q, qi) => (
                      <button
                        key={qi}
                        className={styles.faqBtn}
                        onClick={() => handleFaqClick(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className={styles.botRow}>
                <img
                  src="/assets/꼬북이.png"
                  alt="꼬북이"
                  className={styles.botAvatar}
                />
                <div className={styles.botBubble}>
                  <span className={styles.typing}>
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className={styles.floatBtnWrap}>
        <button
          className={styles.floatBtn}
          onClick={() => setIsOpen((v) => !v)}
        >
          <video
            src="/assets/mascot_original3.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={styles.mascotVideo}
          />
        </button>
        <div className={styles.floatLabel}>꼬북이에게 물어보세요</div>
      </div>
    </div>
  );
}

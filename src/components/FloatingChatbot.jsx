import { useState, useRef, useEffect } from "react";
import styles from "../styles/FloatingChatbot.module.css";
import llmApi from "../api/llmAxios";

const FAQ_LIST = [
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

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content: "안녕하세요! 꼬북이에요 🐢\n무엇을 도와드릴까요?",
  },
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqVisible, setFaqVisible] = useState(true);
  const [faqPanelOpen, setFaqPanelOpen] = useState(false);
  const [retryText, setRetryText] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

  const callApi = async (msgs) => {
    const response = await llmApi.post("/api/chatbot/chat", {
      messages: msgs,
    });
    return response.data.reply;
  };

  const sendMessage = async (text) => {
    if (!text || loading) return;
    setFaqVisible(false);
    setFaqPanelOpen(false);
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setRetryText(null);

    try {
      const reply = await callApi(newMessages);
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
    setFaqPanelOpen(false);
    setRetryText(null);
    setInput("");
  };

  const handleSend = async () => await sendMessage(input.trim());
  const handleFaqClick = (question) => sendMessage(question);
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
                src="/assets/mascot.png"
                alt="꼬북이"
                className={styles.headerAvatar}
              />
              <div>
                <div className={styles.headerName}>꼬북이</div>
                <div className={styles.headerSub}>GGoBook AI 도우미</div>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.resetBtn}
                onClick={handleReset}
                title="대화 초기화"
              >
                🔄
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
                      src="/assets/mascot.png"
                      alt="꼬북이"
                      className={styles.botAvatar}
                    />
                  )}
                  <div
                    className={
                      msg.role === "user" ? styles.userBubble : styles.botBubble
                    }
                  >
                    {msg.content}
                    {msg.isError && !loading && (
                      <button className={styles.retryBtn} onClick={handleRetry}>
                        🔄 다시 시도
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
                  src="/assets/mascot.png"
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

          {faqPanelOpen && (
            <div className={styles.faqPanel}>
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

          <div className={styles.inputRow}>
            <button
              className={`${styles.faqToggleBtn} ${faqPanelOpen ? styles.faqToggleBtnActive : ""}`}
              onClick={() => setFaqPanelOpen((v) => !v)}
              title="자주 묻는 질문"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
              </svg>
            </button>
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

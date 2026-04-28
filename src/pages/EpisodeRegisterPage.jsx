import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import api from "../api/axios"; // 🌟 1. 전담 요원(axios) 임포트!
import styles from "../styles/EpisodeRegisterPage.module.css";

const mockEpisodes = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  title: `${i + 1}화`,
  isFree: i < 3,
  novelText: `${i + 1}화 원고 내용입니다. 흥미진진한 이야기가 펼쳐집니다.`,
}));

export default function EpisodeRegisterPage() {
  const navigate = useNavigate();
  const { contentId, episodeId } = useParams();
  const isEdit = !!episodeId;
  const editEpisode = isEdit
    ? mockEpisodes.find((e) => e.id === Number(episodeId))
    : null;

  const [isFree, setIsFree] = useState(editEpisode?.isFree ?? true);
  const [scheduled, setScheduled] = useState(false);
  const [isNovel, setIsNovel] = useState(false);
  const [thumbFile, setThumbFile] = useState(null);
  const [episodeNumber, setEpisodeNumber] = useState(editEpisode?.number ?? "");
  const [episodeTitle, setEpisodeTitle] = useState(editEpisode?.title ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [novelText, setNovelText] = useState(editEpisode?.novelText ?? "");
  const [comicFiles, setComicFiles] = useState([]);
  const [ttsFileUrl, setTtsFileUrl] = useState("");

  const handleSubmit = async () => {
    if (!episodeTitle) {
      alert("회차 제목은 필수입니다.");
      return;
    }
    if (isNovel && !novelText.trim()) {
      alert("원고 내용은 필수입니다.");
      return;
    }
    if (!isEdit && !isNovel && comicFiles.length === 0) {
      alert("웹툰 이미지를 1장 이상 업로드해주세요.");
      return;
    }

    const userEpisode = {
      episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
      episodeTitle,
      isFree,
      scheduledAt: scheduledAt || null,
    };

    const formData = new FormData();
    formData.append(
      "episode",
      new Blob([JSON.stringify(userEpisode)], { type: "application/json" }),
    );
    if (thumbFile) formData.append("thumbFile", thumbFile);

    if (isNovel) {
      const UserNovel = { contentText: novelText, ttsFileUrl };
      formData.append(
        "novel",
        new Blob([JSON.stringify(UserNovel)], { type: "application/json" }),
      );
    } else {
      comicFiles.forEach((file) => formData.append("episodeFiles", file));
    }

    try {
      // 🌟 2. 요원(api) 투입! 긴 URL과 토큰 수동 세팅 제거
      const url = isEdit
        ? `/api/contents/${contentId}/episodes/${episodeId}`
        : `/api/contents/${contentId}/episodes`;
        
      const response = await api({
        method: isEdit ? "PUT" : "POST",
        url: url,
        data: formData, // axios에서는 body 대신 data를 사용합니다.
      });

      // axios는 성공 시 2xx 코드를 반환하므로 response.ok 대신 status 확인
      if (response.status === 200 || response.status === 201) {
        alert(isEdit ? "회차 수정 성공" : "회차 등록 성공");
        navigate(`/author/contents/${contentId}`);
      }
    } catch (error) {
      console.error("에러 발생 : ", error);
      alert(isEdit ? "회차 수정 실패" : "회차 등록 실패");
    }
  };

  useEffect(() => {
    const checkNovelForTTS = async () => {
      try {
        // 🌟 3. 작품 상세 조회도 요원(api)으로 교체!
        const response = await api.get(`/api/contents/${contentId}`);
        
        // axios는 response.data에 실제 JSON 결과물이 들어있습니다!
        setIsNovel(response.data.type === "웹소설");
      } catch (error) {
        console.error("작품 상세 불러오기 실패 : ", error);
        alert("백엔드 통신 실패(작품 상세)");
      }
    };
    checkNovelForTTS();

    const loadNextEpisodeNumber = async () => {
        if (isEdit) return; 
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `http://localhost:8080/api/contents/${contentId}/episodes/next-number`,
                { method: "GET", headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) return;
            const nextNumber = await response.json();
            setEpisodeNumber(nextNumber);
        } catch (error) {
            console.error("회차 번호 불러오기 실패 : ", error);
        }
    };
    loadNextEpisodeNumber();
  }, [contentId]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {isEdit ? "회차 수정" : "회차 등록"}
        </div>
        <div className={styles.headerSubtitle}>
          {isEdit ? "회차 내용을 수정하세요" : "새 회차를 등록하세요"}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 번호</div>
            <input
              type="number"
              placeholder="회차 번호 입력"
              className={styles.input}
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 제목</div>
            <input
              placeholder="회차 제목 입력"
              className={styles.input}
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>썸네일</div>
            <label className={styles.fileBtn}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {thumbFile ? thumbFile.name : "이미지 선택"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbFile(e.target.files[0])}
              />
            </label>
            {thumbFile && (
              <div className={styles.previewBox}>
                <img
                  src={URL.createObjectURL(thumbFile)}
                  alt="썸네일 미리보기"
                  className={styles.previewImg}
                />
                <button
                  className={styles.previewRemove}
                  onClick={() => setThumbFile(null)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>원고 업로드</div>
            {isNovel ? (
              <textarea
                placeholder="원고 내용을 입력하세요"
                className={styles.textarea}
                rows={15}
                value={novelText}
                onChange={(e) => setNovelText(e.target.value)}
              />
            ) : (
              <>
                <label className={styles.fileBtn}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {comicFiles.length > 0
                    ? `${comicFiles.length}장 선택됨`
                    : "이미지 업로드"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setComicFiles((prev) => [
                        ...prev,
                        ...Array.from(e.target.files),
                      ])
                    }
                  />
                </label>
                {comicFiles.length > 0 && (
                  <div className={styles.comicPreviewGrid}>
                    {comicFiles.map((file, idx) => (
                      <div key={idx} className={styles.comicPreviewItem}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`${idx + 1}번 이미지`}
                          className={styles.comicPreviewImg}
                        />
                        <button
                          className={styles.previewRemove}
                          onClick={() =>
                            setComicFiles(
                              comicFiles.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          ✕
                        </button>
                        <div className={styles.comicPreviewNum}>{idx + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>공개 설정</div>
            <div className={styles.typeGroup}>
              {[
                { label: "무료", val: true },
                { label: "유료", val: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setIsFree(opt.val)}
                  className={`${styles.typeBtn} ${isFree === opt.val ? styles.typeBtnActive : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.scheduleRow}>
              <div className={styles.formLabel}>예약 업로드</div>
              <button
                onClick={() => setScheduled(!scheduled)}
                className={`${styles.toggleBtn} ${scheduled ? styles.toggleBtnActive : ""}`}
              >
                {scheduled ? "ON" : "OFF"}
              </button>
            </div>
            {scheduled && (
              <DatePicker
                selected={scheduledAt ? new Date(scheduledAt) : null}
                onChange={(date) =>
                  setScheduledAt(date ? date.toISOString() : "")
                }
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy년 MM월 dd일 HH:mm"
                placeholderText="날짜와 시간을 선택하세요"
                locale={ko}
                className={styles.input}
                wrapperClassName={styles.datePickerWrapper}
                popperPlacement="bottom-start"
              />
            )}
          </div>

          {isNovel && (
            <div className={styles.formGroup}>
              <div className={styles.formLabel}>TTS 목소리 설정</div>
              <div className={styles.ttsBox}>
                <div className={styles.ttsHint}>
                  등장인물별 목소리를 설정하세요
                </div>
                {["나레이터", "주인공", "상대방"].map((ch) => (
                  <div key={ch} className={styles.ttsRow}>
                    <span className={styles.ttsChar}>{ch}</span>
                    <select className={styles.ttsSelect}>
                      <option>목소리 선택</option>
                      <option>차분한 여성</option>
                      <option>활발한 남성</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.btnGroup}>
            <button
              className={styles.cancelBtn}
              onClick={() => navigate(`/author/contents/${contentId}`)}
            >
              취소
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              {isEdit ? "수정하기" : "등록하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
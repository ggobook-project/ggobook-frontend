import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import api from "../api/axios";
import styles from "../styles/EpisodeRegisterPage.module.css";
import { useAlert } from "../context/AlertContext";

export default function EpisodeRegisterPage() {
  const navigate = useNavigate();
  const { contentId, episodeId } = useParams();
  const { showAlert } = useAlert();
  const [searchParams] = useSearchParams();
  const isEdit = !!episodeId;

  const [isFree, setIsFree] = useState(true);
  const [isNovel, setIsNovel] = useState(searchParams.get("novel") === "true");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [novelText, setNovelText] = useState("");
  const [thumbFile, setThumbFile] = useState(null);
  const [existingThumbUrl, setExistingThumbUrl] = useState("");
  const [webtoonImages, setWebtoonImages] = useState([]);
  const [formatLoading, setFormatLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");
  const [isFixedDate, setIsFixedDate] = useState(false); 
  
  // 🌟 핵심 수술 1: 작품의 연재 요일을 기억할 상태 (0=일, 1=월 ... 6=토)
  const [allowedDays, setAllowedDays] = useState([]);

  const dragItem = useRef();
  const dragOverItem = useRef();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minSelectableDate = isEdit ? today : new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (!isEdit) {
      const loadLastEpisodeDate = async () => {
        try {
          const res = await api.get(`/api/author/contents/${contentId}/episodes`, { params: { size: 1, sort: 'episodeNumber,desc' } });
          const list = res.data.content || res.data || [];
          
          if (list.length > 0) {
            const lastDate = new Date(list[0].scheduledAt || list[0].createdAt);
            lastDate.setDate(lastDate.getDate() + 7);
            lastDate.setHours(0, 0, 0, 0);
            setScheduledAt(lastDate.toISOString());
            setIsFixedDate(true); 
          } else {
            setIsFixedDate(false);
          }
        } catch (e) { console.error("이전 날짜 조회 실패", e); }
      };
      loadLastEpisodeDate();
    } else {
      const loadEpisodeData = async () => {
        try {
          const response = await api.get(`/api/episodes/${episodeId}`);
          const data = response.data;
          setEpisodeNumber(data.episodeNumber);
          setEpisodeTitle(data.episodeTitle);
          setIsFree(data.isFree ?? true);
          setExistingThumbUrl(data.thumbnailUrl || "");
          if (data.scheduledAt) setScheduledAt(data.scheduledAt);
          if (data.novel) {
            setIsNovel(true); setNovelText(data.novel.contentText || "");
          } else if (data.comicToons && data.comicToons.length > 0) {
            setIsNovel(false);
            const sortedComics = data.comicToons.sort((a, b) => a.imageOrder - b.imageOrder);
            setWebtoonImages(sortedComics.map(c => ({ id: c.imageUrl, type: 'OLD', url: c.imageUrl, file: null })));
          }
        } catch (error) { showAlert("정보를 불러오지 못했습니다.", "error"); }
      };
      loadEpisodeData();
    }

    const initBasicData = async () => {
      try {
        const [contentRes, numRes] = await Promise.all([
          api.get(`/api/contents/${contentId}`),
          !isEdit ? api.get(`/api/contents/${contentId}/episodes/next-number`) : Promise.resolve({data: episodeNumber})
        ]);
        
        setIsNovel(contentRes.data.type === "웹소설" || contentRes.data.type === "NOVEL");
        if(!isEdit) setEpisodeNumber(numRes.data);

        // 🌟 핵심 수술 2: 작품의 연재 요일("화,목")을 자바스크립트 요일 번호([2, 4])로 변환!
        if (contentRes.data.serialDay) {
          const dayMap = { "일": 0, "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6 };
          const daysArr = contentRes.data.serialDay.split(",").map(d => dayMap[d.trim()]).filter(d => d !== undefined);
          setAllowedDays(daysArr);
        }
      } catch (error) { console.error("초기 데이터 실패", error); }
    };
    initBasicData();
  }, [contentId, isEdit, episodeId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(f => ({ id: URL.createObjectURL(f) + Date.now(), type: 'NEW', url: URL.createObjectURL(f), file: f }));
    setWebtoonImages(prev => [...prev, ...newImages]);
  };
  const handleRemoveImage = (idToRemove) => setWebtoonImages(prev => prev.filter(img => img.id !== idToRemove));
  const dragStart = (e, position) => { dragItem.current = position; };
  const dragEnter = (e, position) => { dragOverItem.current = position; };
  const drop = (e) => {
    const copyListItems = [...webtoonImages];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null; dragOverItem.current = null;
    setWebtoonImages(copyListItems);
  };

  const handleSubmit = async () => {
    if (!episodeTitle) return showAlert("회차 제목은 필수입니다.");
    if (isNovel && !novelText.trim()) return showAlert("원고 내용은 필수입니다.");
    if (!isNovel && webtoonImages.length === 0) return showAlert("웹툰 이미지를 1장 이상 업로드해주세요.");
    if (!scheduledAt) return showAlert("업로드 날짜를 지정해주세요.");

    const userEpisode = {
      episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
      episodeTitle, isFree, scheduledAt: scheduledAt, 
    };

    const formData = new FormData();
    formData.append("episode", new Blob([JSON.stringify(userEpisode)], { type: "application/json" }));
    if (thumbFile) formData.append("thumbFile", thumbFile);

    if (isNovel) {
      formData.append("novel", new Blob([JSON.stringify({ contentText: novelText })], { type: "application/json" }));
    } else {
      webtoonImages.forEach(img => {
        if (img.type === 'OLD') { formData.append("imageOrder", img.url); } 
        else { formData.append("imageOrder", "NEW_FILE"); formData.append("episodeFiles", img.file); }
      });
    }

    try {
      const url = isEdit ? `/api/episodes/${episodeId}` : `/api/contents/${contentId}/episodes`;
      const response = await api({ method: isEdit ? "PATCH" : "POST", url: url, data: formData });
      if (response.status === 200 || response.status === 201) {
        await showAlert(isEdit ? "회차 수정 성공 (검수 대기 상태로 전환됩니다)" : "회차 등록 성공", "success");
        navigate(`/author/contents/${contentId}`);
      }
    } catch (error) { await showAlert("등록/수정 실패", "error"); }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{isEdit ? "회차 수정" : "회차 등록"}</div>
        <div className={styles.headerSubtitle}>{isEdit ? "내용을 수정하면 다시 검수를 받아야 합니다." : "새 회차를 등록하세요"}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 번호</div>
            <input type="number" className={styles.input} value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} disabled={isEdit}/>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>회차 제목</div>
            <input className={styles.input} value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>썸네일 {isEdit && <span className={styles.optional}>(변경 시에만 업로드)</span>}</div>
            <label className={styles.fileBtn}>
              {thumbFile ? thumbFile.name : "이미지 선택"}
              <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files[0])} style={{ display: 'none' }}/>
            </label>
            {(thumbFile || existingThumbUrl) && (
              <div className={styles.previewBox}>
                <img src={thumbFile ? URL.createObjectURL(thumbFile) : existingThumbUrl} className={styles.previewImg} alt="썸네일" />
                <button className={styles.previewRemove} onClick={() => { setThumbFile(null); setExistingThumbUrl(""); }}>✕</button>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>원고 업로드</div>
            {isNovel ? (
              <textarea className={styles.textarea} rows={15} value={novelText} onChange={(e) => setNovelText(e.target.value)} />
            ) : (
              <>
                <label className={styles.fileBtn}>
                  추가 이미지 업로드
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }}/>
                </label>
                {webtoonImages.length > 0 && (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {webtoonImages.map((img, index) => (
                      <div key={img.id} draggable onDragStart={(e) => dragStart(e, index)} onDragEnter={(e) => dragEnter(e, index)} onDragEnd={drop} onDragOver={(e) => e.preventDefault()} 
                        style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFF', cursor: 'grab' }}
                      >
                        <div style={{ fontWeight: 'bold', marginRight: '15px', color: '#4A6FA5', width: '30px' }}>{index + 1}</div>
                        <img src={img.url} alt={`컷 ${index + 1}`} style={{ height: '80px', objectFit: 'contain', marginRight: '15px' }} />
                        <div style={{ flex: 1, fontSize: '12px', color: '#90A4C8' }}>{img.type === 'NEW' ? '새로 추가됨' : '기존 이미지'}</div>
                        <button onClick={() => handleRemoveImage(img.id)} style={{ background: 'none', border: 'none', color: '#E53935', fontSize: '18px', cursor: 'pointer' }}>✕</button>
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
              {[{ label: "무료", val: true }, { label: "유료", val: false }].map((opt) => (
                <button key={opt.label} onClick={() => setIsFree(opt.val)} className={`${styles.typeBtn} ${isFree === opt.val ? styles.typeBtnActive : ""}`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>
              업로드 날짜 
              {isFixedDate && !isEdit && <span className={styles.optional} style={{color: '#4A6FA5'}}> (주간 연재 자동 고정)</span>}
            </div>
            <DatePicker
              selected={scheduledAt ? new Date(scheduledAt) : null}
              onChange={(date) => { if (date) { date.setHours(0, 0, 0, 0); setScheduledAt(date.toISOString()); } else setScheduledAt(""); }}
              dateFormat="yyyy년 MM월 dd일"
              minDate={minSelectableDate}
              disabled={isFixedDate && !isEdit} 
              placeholderText="예약할 날짜를 선택하세요"
              locale={ko}
              className={styles.input}
              // 🌟 핵심 수술 3: 설정된 요일(화,목 등)만 캘린더에서 활성화! 나머지는 클릭 불가
              filterDate={(date) => {
                if (allowedDays.length === 0) return true; // 연재요일 정보가 없으면 다 허용
                return allowedDays.includes(date.getDay()); // 허용된 요일만 True
              }}
            />
            {!isFixedDate && !isEdit && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#E53935' }}>
                * 지정하신 연재 요일에 해당하는 날짜만 선택할 수 있습니다. (최소 3일 이후)
              </div>
            )}
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={() => navigate(`/author/contents/${contentId}`)}>취소</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>{isEdit ? "수정하기" : "등록하기"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
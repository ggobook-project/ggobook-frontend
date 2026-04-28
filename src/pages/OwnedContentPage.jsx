import { useNavigate, useParams } from "react-router-dom"
import styles from "../styles/OwnedContentPage.module.css"
import api from "../api/axios"; 
import { useEffect, useState } from "react";

export default function OwnedContentPage() {
  const navigate = useNavigate()
  const { contentId } = useParams();

  const [ownedContents, setOwnedContents] = useState([]);

  const handleContentClick = (contentId) => {
    navigate(`/mypage/library/${contentId}`);
  };


  useEffect(() => {    
    
    const loadOwnedContents = async () => {
      try {
        
        const response = await api.get(`/api/owns/`);

        const data = response.data;
        setOwnedContents(Array.isArray(data) ? data : data.content ? data.content : []);
        console.log("소장한 작품 목록 : ", data);
      } catch (error) {
        console.error("에피소드 목록 불러오기 실패 : ", error);
      }
  }
    
    loadOwnedContents();
  }, []);


  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>소장한 작품</div>
        <div className={styles.headerSubtitle}>구매한 완결 작품 목록</div>
      </div>
      <div className={styles.content}>
        {ownedContents.map(ownedContent => (
          <div key={ownedContent.contentId} className={styles.card} onClick={() => handleContentClick(ownedContent.contentId)}>
            <div className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.title}>{ownedContent.title}</div>
              <div className={styles.meta}>{ownedContent.author} · {ownedContent.type} ·</div>
            </div>
            <span className={styles.badge}>완결</span>
          </div>
        ))}
      </div>
    </div>
  )
}
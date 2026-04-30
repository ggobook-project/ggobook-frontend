import React, { useState } from 'react';
import styles from './ReportModal.module.css';
import api from '../api/axios';

const ReportModal = ({ isOpen, onClose, targetInfo }) => {
    const [reason, setReason] = useState('SPAM');
    if (!isOpen || !targetInfo) return null;

    const handleSubmit = async (e) => {
        e.stopPropagation(); 
        
        const reportData = {
            targetType: targetInfo.targetType,
            targetId: targetInfo.targetId,
            targetParentId: targetInfo.targetParentId, 
            reportReason: reason, 
            reportedUserId: targetInfo.reportedUserId 
        };

        console.log("백엔드로 보낼 최종 데이터 확인:", reportData);

        try {
            // 백엔드 ReportRequestDTO 구조와 1:1로 매칭시켜 전송합니다.
            await api.post('/api/reports', reportData);
            
            alert("신고가 정상적으로 접수되었습니다.");
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || error.response?.data || "신고 처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3>신고하기</h3>
                <p className={styles.targetName}>
                    신고 대상자: <strong>{targetInfo.targetTitle}</strong>
                </p>
                
                <select 
                    className={styles.select} 
                    value={reason} 
                    onChange={e => setReason(e.target.value)}
                >
                    <option value="SPAM">스팸 홍보/도배글 게시</option>
                    <option value="ABUSIVE_LANGUAGE">욕설 및 혐오 발언</option>
                    <option value="INAPPROPRIATE_CONTENT">음란물/선정적 콘텐츠 게시</option>
                    <option value="COPYRIGHT_INFRINGEMENT">타인 저작권 침해 및 무단 도용</option>
                    <option value="ILLEGAL_PROMOTION">불법 사이트 홍보 및 광고</option>
                    <option value="POLITICAL_DISPUTE">정치적 분쟁 유도 및 조장</option>
                    <option value="FAKE_INFORMATION">허위 사실 유포</option>
                    <option value="OTHER">기타 사유</option>
                </select>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>취소</button>
                    <button className={styles.submitBtn} onClick={handleSubmit}>신고 전송</button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
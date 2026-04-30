// 🌟 1. 경로 주의: 아까 만든 가로채기 요원 파일 이름에 맞춰주세요! 
// (만약 파일 이름이 axios.js면 './axios', axiosConfig.js면 './axiosConfig')
import api from './axios';

// 1. 마이페이지 메인 화면용 데이터 조회
export const getMyPageMainData = async () => {
  // Promise.all을 써서 두 개의 API(프로필, 포인트)를 동시에 병렬로 가져오는 엄청난 최적화 코드입니다! 유지합니다.
  const [profileRes, pointRes] = await Promise.all([
    api.get('/api/mypage'),
    api.get('/api/wallets/balance')
  ]);
  return { profile: profileRes.data, points: pointRes.data };
};

// 2. 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname) => {
  const response = await api.get(`/api/auth/check-nickname?nickname=${nickname}`);
  return response.data; 
};

// 3. 내 정보 수정 (닉네임, 비밀번호 변경)
export const updateMyInfo = async (updateData) => {
  const response = await api.put('/api/mypage', updateData);
  return response.data;
};

// 4. 찜한 작품 목록 조회
export const getMyLikedContents = async (page = 0) => {
  const response = await api.get(`/api/mypage/likes?page=${page}&size=12`);
  return response.data; 
};

// 🌟 5. 찜 취소 (수정됨!)
export const unlikeContent = async (contentId) => {
  // 백엔드 컨트롤러를 POST 방식 토글형으로 통일했으므로, delete 대신 post로 맞춰줍니다!
  const response = await api.post(`/api/likes/${contentId}`);
  return response.data;
};
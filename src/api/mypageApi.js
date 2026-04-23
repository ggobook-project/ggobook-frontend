import api from './axios';

// (기존) 마이페이지 메인 화면용 데이터 조회
export const getMyPageMainData = async () => {
  const [profileRes, pointRes] = await Promise.all([
    api.get('/api/mypage'),
    api.get('/api/mypage/points')
  ]);
  return { profile: profileRes.data, points: pointRes.data.currentBalance };
};

//  닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname) => {
  const response = await api.get(`/api/auth/check-nickname?nickname=${nickname}`);
  return response.data; // true(중복) or false(사용가능)
};

//  내 정보 수정 (닉네임, 비밀번호 변경)
export const updateMyInfo = async (updateData) => {
  const response = await api.put('/api/mypage', updateData);
  return response.data;
};

//  찜한 작품 목록 조회 (백엔드에서 Slice 로 줌)
export const getMyLikedContents = async (page = 0) => {
  const response = await api.get(`/api/mypage/likes?page=${page}&size=12`);
  return response.data; // 백엔드가 Slice<LikedContentDto> 형태로 던져줌
};

//  찜 취소 (Unlike)
export const unlikeContent = async (contentId) => {
  const response = await api.delete(`/api/likes/${contentId}`);
  return response.data;
};
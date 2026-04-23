import axios from 'axios';

// 1. 기본 API 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소 (Vite 환경변수로 빼도 됨)
  withCredentials: true, // 🌟 중요: 리프레시 토큰(Cookie)을 주고받기 위해 필수
});

// 2. 요청(Request) 인터셉터: 백엔드로 요청이 출발하기 직전에 실행됨
api.interceptors.request.use(
  (config) => {
    // 창고에서 VIP 티켓(accessToken)을 꺼냄
    const token = localStorage.getItem('accessToken');
    
    // 티켓이 있다면, 헤더에 'Bearer 티켓번호' 형태로 딱 붙여서 보냄
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답(Response) 인터셉터: 백엔드에서 응답이 도착한 직후 실행됨
api.interceptors.response.use(
  (response) => {
    return response; // 정상 응답은 그대로 화면으로 통과
  },
  (error) => {
    // 클린 코드의 디테일: 만약 토큰이 만료되었거나 권한이 없어서 백엔드가 401 에러를 뱉었다면?
    if (error.response && error.response.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem('accessToken'); // 썩은 티켓 버리기
      window.location.href = '/login'; // 로그인 페이지로 강제 추방
    }
    return Promise.reject(error);
  }
);

export default api;
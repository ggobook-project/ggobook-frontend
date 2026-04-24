import axios from 'axios';

// 1. 기본 API 인스턴스 (우리 회사 전용 요원) 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, 
});

// 2. 요청(Request) 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답(Response) 인터셉터
api.interceptors.response.use(
  (response) => {
    return response; 
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      
      const originalRequest = error.config; 

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
            withCredentials: true 
          });

          if (refreshResponse.status === 200) {
            const newAccessToken = refreshResponse.data;
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // 🌟 변경: 알림창(alert) 제거! 유저 모르게 부드럽게 쫓아냅니다.
          console.error("토큰 완전 만료. 조용히 로그아웃 처리");
          localStorage.removeItem('accessToken');
          window.location.href = '/login'; 
          
          // 🌟 마법의 코드: 에러를 페이지(MyPage 등)로 던지지 않고 빈 깡통을 던져서 에러 파기!
          // 덕분에 다른 모든 페이지에서 try-catch를 수정할 필요가 완전히 사라집니다.
          return new Promise(() => {}); 
        }
      }
    }
    
    // 401 이외의 진짜 에러(서버 다운 등)는 정상적으로 화면에 보고합니다.
    return Promise.reject(error);
  }
);

export default api;
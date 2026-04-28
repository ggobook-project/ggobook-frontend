import axios from 'axios';

// 1. 기본 API 인스턴스 (우리 회사 전용 요원) 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, 
});

// 2. 요청(Request) 인터셉터
api.interceptors.request.use(
  (config) => {
    // 🌟 핵심 1: 영구 보관함(localStorage)이든 일회용 보관함(sessionStorage)이든 토큰이 있는 곳에서 꺼내옵니다!
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
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
            
            // 🌟 핵심 2: 방금 받아온 새 토큰을 "원래 쓰던 보관함"에 맞춰서 다시 예쁘게 넣어줍니다!
            if (localStorage.getItem('accessToken')) {
              localStorage.setItem('accessToken', newAccessToken);
            } else {
              sessionStorage.setItem('accessToken', newAccessToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // 🌟 핵심 3: 토큰이 완전 만료되어 쫓아낼 때는, 두 보관함을 모두 확실하게 탈탈 털어버립니다!
          console.error("토큰 완전 만료. 조용히 로그아웃 처리");
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          
          window.location.href = '/login'; 
          
          // 에러 파기용 빈 깡통 반환 (다른 페이지 에러 방지)
          return new Promise(() => {}); 
        }
      }
    }
    
    // 401 이외의 진짜 에러(서버 다운 등)는 정상적으로 화면에 보고합니다.
    return Promise.reject(error);
  }
);

export default api;
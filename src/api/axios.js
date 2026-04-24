import axios from 'axios';

// 1. 기본 API 인스턴스 (우리 회사 전용 요원) 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 🌟 중요: 리프레시 토큰(Cookie)을 주고받기 위해 필수
});

// 2. 요청(Request) 인터셉터: 출발 직전 무조건 지갑에서 티켓 꺼내서 붙임
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

// 3. 응답(Response) 인터셉터: 백엔드에서 온 에러를 낚아채서 분석함
api.interceptors.response.use(
  (response) => {
    return response; // 정상 응답은 그대로 화면으로 패스!
  },
  async (error) => {
    // 🌟 대기업 무한 로그인 로직: 401(만료) 에러가 났을 때 작전 시작
    if (error.response && error.response.status === 401) {
      
      const originalRequest = error.config; // 방금 실패했던 원래의 요청 정보

      // 무한 루프 방지: 재시도를 한 번도 안 한 요청일 때만 실행
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 몰래 백엔드 매표소로 뛰어가서 새 VIP 티켓을 받아옵니다.
          // (일반 axios를 써야 이 요청 자체가 다시 인터셉터에 걸리는 걸 막을 수 있습니다)
          const refreshResponse = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
            withCredentials: true 
          });

          // 새 티켓 발급 성공!
          if (refreshResponse.status === 200) {
            const newAccessToken = refreshResponse.data;
            
            // 지갑에 새 티켓 꽂아주기
            localStorage.setItem('accessToken', newAccessToken);

            // 아까 실패했던 원래 요청의 티켓을 새것으로 교체하고 다시 쏜다! (유저는 에러가 났었는지 모름)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // 최악의 상황: 매표소에 갔는데 리프레시 토큰(7일짜리 연장권)마저 만료된 경우
          console.error("리프레시 토큰까지 완전히 만료되었습니다.");
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem('accessToken');
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      }
    }
    
    // 401 에러가 아니면 (ex: 500 서버에러, 404 등) 그냥 화면으로 에러를 던짐
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // 스프링 부트 서버 주소
  withCredentials: true             // 쿠키 주고받기 허용
});

export default api;
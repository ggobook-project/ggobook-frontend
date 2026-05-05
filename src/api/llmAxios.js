import axios from "axios";

const llmApi = axios.create({
  baseURL: "http://localhost:8000",
});

llmApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token && config.data) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      config.data = { ...config.data, userId: payload.id, token };
    } catch {}
  }
  return config;
});

export default llmApi;

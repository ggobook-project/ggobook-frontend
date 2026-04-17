import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      {/* 상단 네비게이션 바 역할 */}
      <nav style={{ padding: '10px', borderBottom: '1px solid gray' }}>
        <Link to="/" style={{ marginRight: '10px' }}>메인으로</Link>
        <Link to="/login">로그인</Link>
      </nav>

      {/* URL에 따라 화면이 바뀌는 영역 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
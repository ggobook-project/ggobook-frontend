import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import wave from "./assets/wave.png"
import MainPage from "./pages/MainPage"
import WebtoonPage from "./pages/WebtoonPage"
import NovelPage from "./pages/NovelPage"
import ContentDetailPage from "./pages/ContentDetailPage"
import WebtoonViewerPage from "./pages/WebtoonViewerPage"
import NovelViewerPage from "./pages/NovelViewerPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import FindIdPage from "./pages/FindIdPage"
import FindPasswordPage from "./pages/FindPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import MyPage from "./pages/MyPage"
import MyInfoEditPage from "./pages/MyInfoEditPage"
import LikedContentPage from "./pages/LikedContentPage"
import OwnedContentPage from "./pages/OwnedContentPage"
import RecentContentPage from "./pages/RecentContentPage"
import MyCommentPage from "./pages/MyCommentPage"
import MyRelayNovelPage from "./pages/MyRelayNovelPage"
import PointPage from "./pages/PointPage"
import RankingPage from "./pages/RankingPage"
import SearchResultPage from "./pages/SearchResultPage"
import ContentManagePage from "./pages/ContentManagePage"
import ContentRegisterPage from "./pages/ContentRegisterPage"
import EpisodeRegisterPage from "./pages/EpisodeRegisterPage"
import AuthorContentDetailPage from "./pages/AuthorContentDetailPage"
import RelayNovelPage from "./pages/RelayNovelPage"
import RelayNovelRegisterPage from "./pages/RelayNovelRegisterPage"
import RelayNovelDetailPage from "./pages/RelayNovelDetailPage"
import ContentChatbotPage from "./pages/ContentChatbotPage"
import ParallelUniversePage from "./pages/ParallelUniversePage"
import NoticePage from "./pages/NoticePage"
import NoticeDetailPage from "./pages/NoticeDetailPage"
import AdminMainPage from "./pages/AdminMainPage"
import AdminInspectionPage from "./pages/AdminInspectionPage"
import AdminInspectionDetailPage from "./pages/AdminInspectionDetailPage"
import AdminContentPage from "./pages/AdminContentPage"
import AdminContentDetailPage from "./pages/AdminContentDetailPage"
import AdminMemberPage from "./pages/AdminMemberPage"
import AdminReportPage from "./pages/AdminReportPage"
import AdminNoticePage from "./pages/AdminNoticePage"
import AdminRelayPage from "./pages/AdminRelayPage"
import AdminRelayDetailPage from "./pages/AdminRelayDetailPage"
import AdminTTSPage from "./pages/AdminTTSPage"
import NotFoundPage from "./pages/NotFoundPage"
import { useLocation } from "react-router-dom"
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler"

const hideHeader = ["/", "/login", "/signup", "/find-id", "/find-password", "/reset-password"]
const hideFooter = ["/", "/login", "/signup", "/find-id", "/find-password", "/reset-password", "/ai/chatbot"]

function Layout() {
  const location = useLocation()
  const showHeader = !hideHeader.includes(location.pathname)
  const showFooter = !hideFooter.includes(location.pathname)
  const isViewer =
    location.pathname.startsWith("/webtoon/viewer") ||
    location.pathname.startsWith("/novel/viewer")

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />

      {/* wave.png 배경 */}
<div style={{
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundImage: `url(${wave})`,
  backgroundSize: "cover", backgroundPosition: "center",
  opacity: 0.10,
  zIndex: isViewer ? -1 : 0,  // 뷰어일 때 뒤로
  pointerEvents: "none",
}} />

{/* SVG 파도 배경 */}
<div style={{
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 560'%3E%3Cpath fill='%2390CAF9' fill-opacity='0.12' d='M0,280L60,261.3C120,243,240,205,360,197.3C480,189,600,211,720,229.3C840,248,960,261,1080,250.7C1200,240,1320,205,1380,187.3L1440,170L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z'%3E%3C/path%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 560'%3E%3Cpath fill='%232196F3' fill-opacity='0.07' d='M0,350L60,336C120,322,240,294,360,282.7C480,272,600,277,720,298.7C840,320,960,357,1080,357.3C1200,357,1320,320,1380,301.3L1440,283L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z'%3E%3C/path%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 560'%3E%3Cpath fill='%23BBDEFB' fill-opacity='0.15' d='M0,420L60,405.3C120,391,240,362,360,346.7C480,331,600,330,720,346.7C840,363,960,397,1080,400C1200,403,1320,374,1380,359.3L1440,344L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center 40%, center 60%, center 80%",
  backgroundSize: "200% auto, 200% auto, 200% auto",
  zIndex: isViewer ? -1 : 0,
  pointerEvents: "none",
}} />

      {showHeader && <Header />}
      <div style={{ flex: 1, background: "transparent", position: "relative", zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/webtoon" element={<WebtoonPage />} />
          <Route path="/novel" element={<NovelPage />} />
          <Route path="/contents/:contentId" element={<ContentDetailPage />} />
          <Route path="/webtoon/viewer/:episodeId" element={<WebtoonViewerPage />} />
          <Route path="/novel/viewer/:episodeId" element={<NovelViewerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/edit" element={<MyInfoEditPage />} />
          <Route path="/mypage/likes" element={<LikedContentPage />} />
          <Route path="/mypage/library" element={<OwnedContentPage />} />
          <Route path="/mypage/recent" element={<RecentContentPage />} />
          <Route path="/mypage/comments" element={<MyCommentPage />} />
          <Route path="/mypage/relay" element={<MyRelayNovelPage />} />
          <Route path="/mypage/points" element={<PointPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="/author/contents" element={<ContentManagePage />} />
          <Route path="/author/contents/register" element={<ContentRegisterPage />} />
          <Route path="/author/contents/:contentId" element={<AuthorContentDetailPage />} />
          <Route path="/author/contents/:contentId/edit" element={<ContentRegisterPage />} />
          <Route path="/author/contents/:contentId/episode/register" element={<EpisodeRegisterPage />} />
          <Route path="/author/contents/:contentId/episode/:episodeId/edit" element={<EpisodeRegisterPage />} />
          <Route path="/relay" element={<RelayNovelPage />} />
          <Route path="/relay/register" element={<RelayNovelRegisterPage />} />
          <Route path="/relay/:relayNovelId" element={<RelayNovelDetailPage />} />
          <Route path="/ai/chatbot/:contentId" element={<ContentChatbotPage />} />
          <Route path="/ai/parallel/:episodeId" element={<ParallelUniversePage />} />
          <Route path="/notices" element={<NoticePage />} />
          <Route path="/notices/:noticeId" element={<NoticeDetailPage />} />
          <Route path="/admin" element={<AdminMainPage />} />
          <Route path="/admin/inspections" element={<AdminInspectionPage />} />
          <Route path="/admin/inspection/detail/:episodeId" element={<AdminInspectionDetailPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/content/:contentId" element={<AdminContentDetailPage />} />
          <Route path="/admin/members" element={<AdminMemberPage />} />
          <Route path="/admin/reports" element={<AdminReportPage />} />
          <Route path="/admin/notices" element={<AdminNoticePage />} />
          <Route path="/admin/relays" element={<AdminRelayPage />} />
          <Route path="/admin/relay/detail/:novelId" element={<AdminRelayDetailPage />} />
          <Route path="/admin/tts" element={<AdminTTSPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Routes>
      </div>
      {showFooter && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <Footer />
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
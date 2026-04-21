import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
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
import RelayNovelPage from "./pages/RelayNovelPage"
import RelayNovelRegisterPage from "./pages/RelayNovelRegisterPage"
import RelayNovelDetailPage from "./pages/RelayNovelDetailPage"
import ContentChatbotPage from "./pages/ContentChatbotPage"
import ParallelUniversePage from "./pages/ParallelUniversePage"
import NoticePage from "./pages/NoticePage"
import NoticeDetailPage from "./pages/NoticeDetailPage"
import AdminMainPage from "./pages/AdminMainPage"
import AdminInspectionPage from "./pages/AdminInspectionPage"
import AdminUploadPage from "./pages/AdminUploadPage"
import AdminMemberPage from "./pages/AdminMemberPage"
import AdminReportPage from "./pages/AdminReportPage"
import AdminNoticePage from "./pages/AdminNoticePage"
import AdminRelayPage from "./pages/AdminRelayPage"
import AdminTTSPage from "./pages/AdminTTSPage"
import NotFoundPage from "./pages/NotFoundPage"
import { useLocation } from "react-router-dom"

import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";

const hideHeader = ["/", "/login", "/signup", "/find-id", "/find-password", "/reset-password"]
const hideFooter = ["/", "/login", "/signup", "/find-id", "/find-password", "/reset-password", "/ai/chatbot"]

function Layout() {
  const location = useLocation()
  const showHeader = !hideHeader.includes(location.pathname)
  const showFooter = !hideFooter.includes(location.pathname)

  return (
    <div style={{ fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
      {showHeader && <Header />}
      <div style={{ flex: 1 }}>
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
          <Route path="/mypage/owns" element={<OwnedContentPage />} />
          <Route path="/mypage/recent" element={<RecentContentPage />} />
          <Route path="/mypage/comments" element={<MyCommentPage />} />
          <Route path="/mypage/relays" element={<MyRelayNovelPage />} />
          <Route path="/mypage/points" element={<PointPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="/author/contents" element={<ContentManagePage />} />
          <Route path="/author/contents/register" element={<ContentRegisterPage />} />
          <Route path="/author/contents/:contentId/episode/register" element={<EpisodeRegisterPage />} />
          <Route path="/relay" element={<RelayNovelPage />} />
          <Route path="/relay/register" element={<RelayNovelRegisterPage />} />
          <Route path="/relay/:relayNovelId" element={<RelayNovelDetailPage />} />
          <Route path="/ai/chatbot/:contentId" element={<ContentChatbotPage />} />
          <Route path="/ai/parallel/:episodeId" element={<ParallelUniversePage />} />
          <Route path="/notices" element={<NoticePage />} />
          <Route path="/notices/:noticeId" element={<NoticeDetailPage />} />
          <Route path="/admin" element={<AdminMainPage />} />
          <Route path="/admin/inspections" element={<AdminInspectionPage />} />
          <Route path="/admin/uploads" element={<AdminUploadPage />} />
          <Route path="/admin/members" element={<AdminMemberPage />} />
          <Route path="/admin/reports" element={<AdminReportPage />} />
          <Route path="/admin/notices" element={<AdminNoticePage />} />
          <Route path="/admin/relays" element={<AdminRelayPage />} />
          <Route path="/admin/tts" element={<AdminTTSPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Routes>
      </div>
      {showFooter && <Footer />}
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
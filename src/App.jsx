import { BrowserRouter, Route, Routes } from "react-router-dom"

import AppShell from "@/components/layout/AppShell"
import ProtectedRoute from "@/features/auth/ProtectedRoute"
import { AuthProvider } from "@/features/auth/AuthContext"
import CommunitiesPage from "@/pages/CommunitiesPage"
import CommunityDetailPage from "@/pages/CommunityDetailPage"
import CreateCommunityPage from "@/pages/CreateCommunityPage"
import CreatePostPage from "@/pages/CreatePostPage"
import FeedPage from "@/pages/FeedPage"
import HomePage from "@/pages/HomePage"
import KnowledgePage from "@/pages/KnowledgePage"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/LoginPage"
import NotFoundPage from "@/pages/NotFoundPage"
import PostDetailPage from "@/pages/PostDetailPage"
import ProfilePage from "@/pages/ProfilePage"
import RegisterPage from "@/pages/RegisterPage"
import VerifyEmailPage from "@/pages/VerifyEmailPage"

const PROBLEM_TYPES = ["problem", "idea"]
const RESEARCH_TYPES = ["research", "project"]

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/home" element={<HomePage />} />
              <Route
                path="/feed"
                element={
                  <FeedPage
                    eyebrow="Feed"
                    title="Community feed"
                    description="Follow the questions, problems, ideas, and projects emerging across your communities."
                    createLabel="Start a post"
                  />
                }
              />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/new" element={<CreateCommunityPage />} />
              <Route path="/communities/:slug" element={<CommunityDetailPage />} />
              <Route
                path="/problems"
                element={
                  <FeedPage
                    eyebrow="Problems & Ideas"
                    title="Problems worth solving"
                    description="Real-world challenges and possible directions, shared by the people investigating them."
                    types={PROBLEM_TYPES}
                    createLabel="Share a problem"
                  />
                }
              />
              <Route
                path="/research"
                element={
                  <FeedPage
                    eyebrow="Research & Projects"
                    title="Research, experiments, and projects"
                    description="Structured investigations and work in progress that the community can examine and build on."
                    types={RESEARCH_TYPES}
                    createLabel="Share research"
                  />
                }
              />
              <Route path="/posts/new" element={<CreatePostPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

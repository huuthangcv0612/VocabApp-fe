import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Levels from './pages/Levels'
import LevelDetail from './pages/LevelDetail'
import TopicsPage from './pages/TopicsPage'
import ProgressPage from './pages/ProgressPage'
import Lektion from './pages/Lektion'
import Flashcard from './pages/Flashcard'
import Quiz from './pages/Quiz'
import SpinWheel from './pages/SpinWheel'
import InteractiveRoomPage from './pages/InteractiveRoomPage'
import QuickTestPage from './pages/QuickTestPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ChangePassword from './pages/auth/ChangePassword'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/admin/AdminRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminTests from './pages/admin/AdminTests'
import AdminUsers from './pages/admin/AdminUsers'
import AdminResults from './pages/admin/AdminResults'

import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/pending" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/levels" element={<Levels />} />
            <Route path="/learn" element={<Levels />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:levelId" element={<TopicsPage />} />
            <Route path="/levels/:levelId" element={<LevelDetail />} />
            <Route path="/levels/:levelId/topics/:topicId" element={<LevelDetail />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/lektion/:lektionId" element={<Lektion />} />
            <Route path="/lesson/:lektionId" element={<Lektion />} />
            <Route path="/flashcard/:lektionId" element={<Flashcard />} />
            <Route path="/quiz/:lektionId" element={<Quiz />} />
            <Route path="/spinwheel/:lektionId" element={<SpinWheel />} />
            <Route path="/interactive-room/*" element={<InteractiveRoomPage />} />
            <Route path="/test" element={<QuickTestPage />} />
            <Route path="/take-test" element={<QuickTestPage />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/questions/new" element={<AdminQuestions autoOpenNewModal={true} />} />
            <Route path="/admin/tests" element={<AdminTests />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/results" element={<AdminResults />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App


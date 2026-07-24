import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Levels from './pages/Levels'
import LevelDetail from './pages/LevelDetail'
import Lektion from './pages/Lektion'
import Flashcard from './pages/Flashcard'
import Quiz from './pages/Quiz'
import SpinWheel from './pages/SpinWheel'
import InteractiveRoomPage from './pages/InteractiveRoomPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ChangePassword from './pages/auth/ChangePassword'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
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
          <Route element={<ProtectedRoute />}>
            <Route path="/levels" element={<Levels />} />
            <Route path="/levels/:levelId" element={<LevelDetail />} />
            <Route path="/lektion/:lektionId" element={<Lektion />} />
            <Route path="/lesson/:lektionId" element={<Lektion />} />
            <Route path="/flashcard/:lektionId" element={<Flashcard />} />
            <Route path="/quiz/:lektionId" element={<Quiz />} />
            <Route path="/spinwheel/:lektionId" element={<SpinWheel />} />
            <Route path="/interactive-room/*" element={<InteractiveRoomPage />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

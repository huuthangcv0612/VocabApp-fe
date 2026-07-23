import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/levels" element={<Levels />} />
            <Route path="/levels/:levelId" element={<LevelDetail />} />
            <Route path="/lektion/:lektionId" element={<Lektion />} />
            <Route path="/lesson/:lektionId" element={<Lektion />} />
            <Route path="/flashcard/:lektionId" element={<Flashcard />} />
            <Route path="/quiz/:lektionId" element={<Quiz />} />
            <Route path="/spinwheel/:lektionId" element={<SpinWheel />} />
            <Route path="/interactive-room/*" element={<InteractiveRoomPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

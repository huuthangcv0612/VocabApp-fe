import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Levels from './pages/Levels'
import LevelDetail from './pages/LevelDetail'
import Lektion from './pages/Lektion'
import Flashcard from './pages/Flashcard'
import Quiz from './pages/Quiz'
import SpinWheel from './pages/SpinWheel'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/levels" element={<Levels />} />
        <Route path="/levels/:levelId" element={<LevelDetail />} />
        <Route path="/lektion/:lektionId" element={<Lektion />} />
        <Route path="/lesson/:lektionId" element={<Lektion />} />
        <Route path="/flashcard/:lektionId" element={<Flashcard />} />
        <Route path="/quiz/:lektionId" element={<Quiz />} />
        <Route path="/spinwheel/:lektionId" element={<SpinWheel />} />
      </Routes>
    </Router>
  )
}

export default App

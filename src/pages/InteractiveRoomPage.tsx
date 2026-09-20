import { Routes, Route } from 'react-router-dom'
import { InteractiveRoomLanding } from '../features/interactive-classes/pages/InteractiveRoomLanding'
import { ClassDetailPage } from '../features/interactive-classes/pages/ClassDetailPage'
import { LessonEditorPage } from '../features/interactive-classes/pages/LessonEditorPage'
import { LiveSessionPage } from '../features/interactive-classes/pages/LiveSessionPage'

const InteractiveRoomPage = () => {
  return (
    <Routes>
      <Route path="/" element={<InteractiveRoomLanding />} />
      <Route path="/classes" element={<InteractiveRoomLanding />} />
      <Route path="/classes/:classId" element={<ClassDetailPage />} />
      <Route path="/classes/:classId/lessons" element={<ClassDetailPage />} />
      <Route path="/classes/:classId/lessons/new" element={<LessonEditorPage />} />
      <Route path="/classes/:classId/lessons/:lessonId/edit" element={<LessonEditorPage />} />
      <Route path="/session/:sessionId" element={<LiveSessionPage />} />
      <Route path="/sessions/:sessionId" element={<LiveSessionPage />} />
    </Routes>
  )
}

export default InteractiveRoomPage

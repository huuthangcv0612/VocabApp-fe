import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/pages/interactive-room.css'

type ModeItem = {
  title: string
  icon: string
  description: string
  buttonLabel: string
  path: string
}

const MODE_ITEMS: ModeItem[] = [
  {
    title: 'AI Hội Thoại',
    icon: '🤖',
    description:
      'Luyện hội thoại tiếng Đức theo tình huống thực tế. AI sẽ đóng vai người đối thoại và sửa lỗi cho bạn.',
    buttonLabel: 'Bắt Đầu Hội Thoại',
    path: '/interactive-room/conversation',
  },
  {
    title: 'Sửa Ngữ Pháp',
    icon: '✍️',
    description:
      'Nhập câu tiếng Đức của bạn, AI sẽ kiểm tra ngữ pháp, giải thích lỗi sai và gợi ý câu đúng.',
    buttonLabel: 'Kiểm Tra Ngữ Pháp',
    path: '/interactive-room/grammar-check',
  },
  {
    title: 'Luyện Đặt Câu',
    icon: '💬',
    description:
      'AI đưa ra từ vựng hoặc chủ đề, bạn đặt câu tiếng Đức và nhận phản hồi chi tiết.',
    buttonLabel: 'Luyện Đặt Câu',
    path: '/interactive-room/sentence-practice',
  },
  {
    title: 'Role-play Tình Huống',
    icon: '🎭',
    description:
      'Thực hành các tình huống như gọi món, hỏi đường, giới thiệu bản thân, phỏng vấn…',
    buttonLabel: 'Bắt Đầu Role-play',
    path: '/interactive-room/role-play',
  },
  {
    title: 'AI Quiz Thông Minh',
    icon: '🧠',
    description:
      'AI tự tạo câu hỏi dựa trên từ vựng trong Lektion hiện tại để kiểm tra khả năng ghi nhớ.',
    buttonLabel: 'Làm Quiz AI',
    path: '/interactive-room/ai-quiz',
  },
  {
    title: 'Luyện Phát Âm',
    icon: '🔊',
    description:
      'Nghe phát âm tiếng Đức chuẩn và luyện đọc theo từng từ hoặc câu mẫu.',
    buttonLabel: 'Luyện Phát Âm',
    path: '/interactive-room/pronunciation',
  },
]

const InteractiveRoomPage = () => {
  const navigate = useNavigate()

  return (
    <div className="interactive-room">
      <Header />
      <main className="interactive-room-main">
        <div className="interactive-room-container">
          <div className="interactive-room-top">
            <button
              type="button"
              className="interactive-room-back"
              onClick={() => navigate('/levels')}
            >
              ← Chọn Lektion
            </button>
            <div className="interactive-room-badge">
              <span className="interactive-room-badge-icon">🤖</span>
              <span>Phòng Học Tương Tác</span>
            </div>
            <h1 className="interactive-room-title">
              Học Tiếng Đức Cùng <span>AI</span>
            </h1>
            <p className="interactive-room-subtitle">
              Luyện tập giao tiếp, ngữ pháp và phản xạ tiếng Đức với các chế độ học thông minh.
            </p>
          </div>

          <div className="interactive-room-grid">
            {MODE_ITEMS.map((mode) => (
              <article key={mode.title} className="interactive-room-card">
                <div className="interactive-room-card-tag">coming soon</div>
                <div className="interactive-room-card-icon">{mode.icon}</div>
                <div className="interactive-room-card-body">
                  <h2>{mode.title}</h2>
                  <p>{mode.description}</p>
                </div>
                <button
                  type="button"
                  className="interactive-room-card-button"
                  onClick={() => {
                    console.log('Navigate to', mode.path)
                    navigate(mode.path)
                  }}
                >
                  {mode.buttonLabel}
                </button>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default InteractiveRoomPage

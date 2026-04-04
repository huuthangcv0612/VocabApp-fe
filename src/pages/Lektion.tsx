import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useVocabulary } from '../hooks/useApi'
import '../styles/pages/lesson.css'

const Lektion = () => {
  const { lektionId } = useParams<{ lektionId: string }>()
  const { vocabulary, loading, error } = useVocabulary(lektionId)

  return (
    <div className="lesson">
      <Header />
      <section className="lesson-section">
        <div className="lesson-container">
          <Link to="/levels" className="back-button">
            <span className="back-icon">←</span>
            Chọn Lektion
          </Link>

          <div className="badge-section">
            <div className="badge">
              <span className="badge-icon">📚</span>
              <span className="badge-text">Chọn Chế Độ Học</span>
            </div>
          </div>

          <h1 className="lesson-title">
            Công Cụ Học Tập <span className="highlight">Đột Phá</span>
          </h1>

          <p className="lesson-description">
            Hệ thống bài tập tương tác đa dạng giúp bạn ghi nhớ từ vựng và ngữ pháp tiếng Đức một cách tự nhiên, hiệu quả và không bao giờ nhàm chán.
          </p>

          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-icon">🃏</div>
              <div className="tool-label">Ôn Tập Flashcard</div>
              <p className="tool-description">
                Học từ vựng hiệu quả với thẻ ghi nhớ 2 mặt. Mặt trước tiếng Đức, mặt sau giải nghĩa tiếng Việt kèm ví dụ minh họa sinh động.
              </p>
              <Link to={`/flashcard/${lektionId}`} className="tool-button">
                Bắt Đầu Flashcard
              </Link>
            </div>

            <div className="tool-card">
              <div className="tool-icon">📝</div>
              <div className="tool-label">Kiểm Tra Nhanh (Quiz)</div>
              <p className="tool-description">
                Đánh giá ngay lập tức mức độ ghi nhớ với hệ thống nhập liệu. Phản hồi đúng/sai tức thì với hiệu ứng trực quan giúp khắc sâu trí nhớ.
              </p>
              <Link to={`/quiz/${lektionId}`} className="tool-button">
                Bắt Đầu Quiz
              </Link>
            </div>

            <div className="tool-card">
              <div className="tool-icon">🎯</div>
              <div className="tool-label">Vòng Quay Từ Vựng</div>
              <p className="tool-description">
                Thử thách phản xạ với vòng quay ngẫu nhiên. Khi vòng quay dừng lại ở một từ, bạn sẽ thử hành đặt câu thực tế với từ đó.
              </p>
              <Link to={`/spinwheel/${lektionId}`} className="tool-button">
                Bắt Đầu Vòng Quay
              </Link>
            </div>
          </div>

          {loading && <p className="status-text">Đang tải từ vựng...</p>}
          {error && <p className="status-text error">Lỗi: {error}</p>}
          {!loading && !error && vocabulary.length === 0 && (
            <p className="status-text">Chưa có từ vựng cho bài học này.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Lektion

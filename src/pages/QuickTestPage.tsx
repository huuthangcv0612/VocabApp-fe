import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { testService } from '../services/testService'
import type { LevelType } from '../types/admin'
import type {
  TestLearnerData,
  TestSubmissionResultData,
} from '../types/test'
import '../styles/pages/test.css'

export const QuickTestPage = () => {
  const { t } = useTranslation(['learning', 'common'])
  const [searchParams] = useSearchParams()
  const levelParam = (searchParams.get('level') as LevelType) || 'A1'

  const [testData, setTestData] = useState<TestLearnerData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<TestSubmissionResultData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true)
        const data = await testService.getQuickTest(levelParam)
        setTestData(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('test.notFound')
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [levelParam, t])

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }))
  }

  const handleSubmit = async () => {
    if (!testData) return

    const formattedAnswers = testData.questions.map((q) => ({
      questionId: q._id,
      selectedOption: answers[q._id] ?? 0,
    }))

    try {
      setSubmitting(true)
      const res = await testService.submitTestResult({
        testId: testData.testId,
        testName: testData.testName,
        level: testData.level,
        answers: formattedAnswers,
      })
      setResult(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.states.error')
      alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="test-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <h2>{t('test.loading', { level: levelParam })}</h2>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !testData) {
    return (
      <>
        <Header />
        <div className="test-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <h2>{error || t('test.notFound')}</h2>
          <Link to="/levels" className="btn-test-nav btn-test-next" style={{ display: 'inline-block', marginTop: '20px' }}>
            {t('test.backToLevels')}
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const currentQuestion = testData.questions[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / testData.questions.length) * 100)

  return (
    <>
      <Header />
      <div className="test-page">
        <div className="test-container">
          {!result ? (
            <div className="test-card">
              <div className="test-header">
                <div>
                  <span className="question-topic-badge">{testData.level} • {currentQuestion?.skill}</span>
                  <h2 className="test-title">{testData.testName}</h2>
                </div>
                <div className="test-timer">
                  {t('test.questionCount', { current: currentIndex + 1, total: testData.questions.length })}
                </div>
              </div>

              <div className="test-progress-bar">
                <div className="test-progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>

              <h3 className="question-text">{currentQuestion?.question}</h3>

              <div className="options-grid">
                {currentQuestion?.options.map((optText, idx) => {
                  const isSelected = answers[currentQuestion._id] === idx
                  return (
                    <button
                      key={idx}
                      className={`option-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(currentQuestion._id, idx)}
                    >
                      <span>
                        <strong style={{ marginRight: '8px' }}>{String.fromCharCode(65 + idx)}.</strong> {optText}
                      </span>
                      {isSelected && <span>✓</span>}
                    </button>
                  )
                })}
              </div>

              <div className="test-navigation">
                <button
                  className="btn-test-nav btn-test-prev"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                >
                  {t('test.prevQuestion')}
                </button>

                {currentIndex < testData.questions.length - 1 ? (
                  <button
                    className="btn-test-nav btn-test-next"
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, testData.questions.length - 1))}
                  >
                    {t('test.nextQuestion')}
                  </button>
                ) : (
                  <button
                    className="btn-test-nav btn-test-submit"
                    disabled={submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? t('test.grading') : t('test.submitTest')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="test-card">
              <div className="result-header-badge">
                <div className="score-circle">
                  <span className="percentage">{result.percentage}%</span>
                  <span className="label">{result.score} / {result.total} {t('test.correct')}</span>
                </div>
                <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', color: '#0f172a', margin: '0 0 8px 0' }}>
                  {t('test.resultTitle', { level: result.evaluatedLevel })}
                </h2>
                <p style={{ color: '#64748b' }}>{t('test.resultDesc')}</p>
              </div>

              {(() => {
                const weakSkills = result.weaknesses && result.weaknesses.length > 0
                  ? result.weaknesses
                  : result.skillBreakdown
                  ? Object.entries(result.skillBreakdown)
                      .filter(([, data]) => (data?.percentage ?? 100) < 60)
                      .map(([skill]) => skill)
                  : []

                if (weakSkills.length === 0) return null

                return (
                  <div className="weakness-alert" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#991b1b' }}>
                      {t('test.weaknessAlert')}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.94rem', color: '#7f1d1d' }}>
                      {t('test.weaknessDesc', { skills: weakSkills.join(', ') })}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {weakSkills.map((sk) => (
                        <Link
                          key={sk}
                          to={`/levels`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          {t('test.reviewSkill', { skill: sk.toUpperCase() })}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })()}

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '24px 0 16px 0' }}>{t('test.skillBreakdown')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {result.skillBreakdown &&
                  Object.entries(result.skillBreakdown).map(([skill, data]) => {
                    const isWeak = (data?.percentage ?? 100) < 60
                    return (
                      <div
                        key={skill}
                        style={{
                          background: isWeak ? '#fff5f5' : '#f8fafc',
                          padding: '14px',
                          borderRadius: '16px',
                          border: isWeak ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem', textTransform: 'capitalize', marginBottom: '6px' }}>
                          <span style={{ color: isWeak ? '#b91c1c' : '#0f172a' }}>
                            {skill} {isWeak && <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 800 }}>(⚠️)</span>}
                          </span>
                          <span style={{ color: isWeak ? '#dc2626' : '#2563eb' }}>
                            {data?.percentage}% ({data?.correct}/{data?.total})
                          </span>
                        </div>
                        <div style={{ height: '8px', background: isWeak ? '#fee2e2' : '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${data?.percentage}%`,
                              background: isWeak ? '#ef4444' : '#2a63e8',
                              borderRadius: '999px',
                              transition: 'width 0.6s ease',
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '24px 0 16px 0' }}>{t('test.answerDetails')}</h3>
              {result.answers && result.answers.length > 0 ? (
                result.answers.map((ans, idx) => (
                  <div key={idx} className={`review-item ${ans.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '6px' }}>
                      <span>Câu {idx + 1}</span>
                      <span style={{ color: ans.isCorrect ? '#16a34a' : '#dc2626' }}>
                        {ans.isCorrect ? t('test.correct') : t('test.incorrect')}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.92rem', color: '#475569' }}>
                      {t('test.correctAnswerLabel')} <strong style={{ color: '#16a34a' }}>{ans.correctAnswer}</strong>
                    </p>
                    {ans.explanation && (
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        📖 {ans.explanation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b' }}>{t('test.resultDesc')}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                <Link to="/levels" className="btn-test-nav btn-test-next">
                  {t('test.backToLevels')}
                </Link>
                <Link to="/interactive-room" className="btn-test-nav btn-test-prev">
                  {t('test.interactiveRoom')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default QuickTestPage

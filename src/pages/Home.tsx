import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { levelApi } from '../services/levelApi'
import { subscriptionService } from '../services/subscriptionService'
import type { LevelItem } from '../types/level'
import type { Plan } from '../types/plan'
import '../styles/pages/home.css'

// Asset Imports
import BusIcon from '../assets/Bus 1.svg'
import Girl1Icon from '../assets/Girl 1.svg'
import Girl2Icon from '../assets/Girl 2 1.svg'
import Boy3Icon from '../assets/Boy 3 1.svg'
import BoyLearnIcon from '../assets/Boy learn 1.svg'
import CloudIcon from '../assets/Cloud.svg'
import SunIcon from '../assets/Icon-Sun.svg'
import BookIcon from '../assets/Icon-book.svg'
import PencilIcon from '../assets/Icon-pencil.svg'
import AppleIcon from '../assets/apple 1.svg'
import SchoolIcon from '../assets/School 1.svg'

// SVG Scalloped Divider helper component based on Subtract.svg
const ScallopedDivider = ({ fill = '#2A63E8', flip = false, className = '' }: { fill?: string; flip?: boolean; className?: string }) => (
  <div className={`scalloped-divider ${flip ? 'scalloped-divider--flip' : ''} ${className}`}>
    <svg viewBox="0 0 1265 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M189.748 0C224.68 0 252.998 28.3185 252.998 63.251H0C0 28.3185 28.318 2.06193e-06 63.25 0C98.1274 0 126.411 28.2298 126.499 63.0869C126.587 28.2298 154.871 2.0587e-06 189.748 0ZM316.25 0C351.182 0 379.5 28.3185 379.5 63.251H253C253 28.3185 281.318 2.06193e-06 316.25 0ZM442.75 0C477.682 0 506 28.3185 506 63.251H379.5C379.5 28.3185 407.818 2.06193e-06 442.75 0ZM569.25 0C604.182 0 632.5 28.3185 632.5 63.251H506C506 28.3185 534.318 2.06193e-06 569.25 0ZM695.75 0C730.682 0 759 28.3185 759 63.251H632.5C632.5 28.3185 660.818 2.06193e-06 695.75 0ZM822.25 0C857.182 0 885.5 28.3185 885.5 63.251H759C759 28.3185 787.318 2.06193e-06 822.25 0ZM948.75 0C983.682 0 1012 28.3185 1012 63.251H885.5C885.5 28.3185 913.818 2.06193e-06 948.75 0ZM1201.75 0C1236.68 6.39113e-05 1265 28.3186 1265 63.251H1012C1012 28.3185 1040.32 2.06193e-06 1075.25 0C1110.13 0 1138.41 28.2298 1138.5 63.0869C1138.59 28.2298 1166.87 0 1201.75 0Z" fill={fill}/>
    </svg>
  </div>
)

const sortPlans = (plansList: Plan[]): Plan[] => {
  const order: Record<string, number> = { FREE: 0, PREMIUM: 1, CUSTOM: 2 }

  return [...plansList]
    .filter((plan) => plan.isActive !== false)
    .sort((a, b) => {
      const typeOrderA = order[a.planType] ?? 99
      const typeOrderB = order[b.planType] ?? 99
      if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })
}

const defaultHomePlans: Plan[] = [
  {
    _id: 'default_free',
    id: 'default_free',
    name: 'STARTER',
    code: 'FREE',
    price: 0,
    durationDays: 0,
    description: 'Bắt đầu học từ vựng tiếng Đức nền tảng hoàn toàn miễn phí.',
    features: [
      'Từ vựng thiết yếu',
      'Bài học chọn lọc',
      'Bài tập tương tác',
      'Theo dõi tiến độ',
    ],
    permissions: [],
    planType: 'FREE',
    badge: 'FREE',
    sortOrder: 0,
  },
  {
    _id: 'default_premium',
    id: 'default_premium',
    name: 'COMPLETE',
    code: 'PREMIUM',
    price: 10000,
    durationDays: 30,
    description: 'Mở khóa toàn bộ bài học, phòng luyện nói AI và kiểm tra ngữ pháp không giới hạn.',
    features: [
      'Toàn bộ lộ trình học',
      'Đầy đủ bài học chuyên sâu',
      'Bài tập luyện nghe phản xạ',
      'Tính năng hội thoại AI',
      'Theo dõi tiến độ & streak',
      'Ôn tập từ vựng thông minh',
    ],
    permissions: [],
    planType: 'PREMIUM',
    badge: 'PREMIUM',
    sortOrder: 1,
  },
  {
    _id: 'default_custom',
    id: 'default_custom',
    name: 'BEST VALUE',
    code: 'CUSTOM',
    price: 0,
    durationDays: 365,
    description: 'Trải nghiệm học tiếng Đức trọn vẹn 1 năm với ưu đãi học phí tốt nhất.',
    features: [
      'Toàn bộ lộ trình học A1-B1',
      'Ưu đãi theo năm tiết kiệm',
      'Mọi tính năng bài tập & AI',
      'Hỗ trợ giải đáp chuyên sâu',
    ],
    permissions: [],
    planType: 'CUSTOM',
    badge: 'YEARLY',
    sortOrder: 2,
  },
]

// Fallback Levels mapping
const fallbackLevels = [
  { code: 'A1.1', title: 'STARTER', desc: 'Xây dựng nền tảng từ vựng tiếng Đức hàng ngày, giao tiếp cơ bản và phát âm chuẩn.', icon: BookIcon, theme: 'red', btnText: 'START A1.1' },
  { code: 'A1.2', title: 'PRESCHOOLERS', desc: 'Mở rộng vốn từ về gia đình, đồ ăn, mua sắm và các tình huống giao tiếp thông dụng.', icon: AppleIcon, theme: 'blue', btnText: 'EXPLORE A1.2' },
  { code: 'A2.1', title: 'KINDERGARTEN', desc: 'Nâng cao khả năng diễn đạt, ngữ pháp câu và phản xạ giao tiếp tự tin hơn.', icon: PencilIcon, theme: 'light', btnText: 'EXPLORE A2.1' },
]

const Home = () => {
  const { t } = useTranslation(['learning', 'common'])
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [, setApiLevels] = useState<LevelItem[]>([])
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    let isMounted = true
    levelApi.getAll().then((data) => {
      if (isMounted && data && data.length > 0) {
        setApiLevels(data)
      }
    }).catch(() => {})

    subscriptionService.getPlans().then((data) => {
      if (isMounted && data && data.length > 0) {
        setPlans(data)
      }
    }).catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqData = useMemo(() => [
    { question: t('home.faq1Q'), answer: t('home.faq1A') },
    { question: t('home.faq2Q'), answer: t('home.faq2A') },
    { question: t('home.faq3Q'), answer: t('home.faq3A') },
    { question: t('home.faq4Q'), answer: t('home.faq4A') },
    { question: t('home.faq5Q'), answer: t('home.faq5A') },
    { question: t('home.faq6Q'), answer: t('home.faq6A') },
  ], [t])

  return (
    <div className="home-page">
      {/* Existing HEADER */}
      <Header animate />

      {/* 1. HERO SECTION */}
      <section className="home-hero">
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--1" />
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--2" />
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--3" />

        <div className="home-hero__container">
          <div className="hero-illustration hero-illustration--left">
            <img src={BusIcon} alt="School Bus" className="hero-img hero-img--bus" />
          </div>

          <div className="home-hero__content">
            <h1 className="home-hero__title">
              {t('home.heroTitle')}
            </h1>

            <p className="home-hero__desc">
              {t('home.heroDesc')}
            </p>

            <div className="home-hero__cta">
              <Link to="/learning-path" className="home-btn home-btn--primary">
                {t('home.startLearning')}
              </Link>
              <Link to="/topics" className="home-btn home-btn--secondary">
                {t('home.exploreLessons')}
              </Link>
            </div>
          </div>

          <div className="hero-illustration hero-illustration--right">
            <img src={Girl1Icon} alt="Girl Learning German" className="hero-img hero-img--girl" />
          </div>
        </div>

        <div className="footer-wave home-hero-wave" aria-hidden="true"></div>
      </section>

      {/* 2. WHAT DOES DEUTSCHUP HAVE? */}
      <section className="home-features">
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--4" />
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--5" />

        <div className="home-container">
          <h2 className="home-section-title">{t('home.whatDoesHave')}</h2>

          <div className="home-features__grid">
            {/* CARD 1 */}
            <div className="feature-card feature-card--red">
              <div className="card-thumb">
                <img src={SchoolIcon} alt="Structured Lessons" className="card-thumb__img" />
              </div>
              <h3 className="feature-card__title">{t('home.structuredLessonsTitle')}</h3>
              <p className="feature-card__desc">
                {t('home.structuredLessonsDesc')}
              </p>
            </div>

            {/* CARD 2 */}
            <div className="feature-card feature-card--blue">
              <div className="card-thumb">
                <img src={Girl2Icon} alt="Interactive Exercises" className="card-thumb__img" />
              </div>
              <h3 className="feature-card__title">{t('home.interactiveExercisesTitle')}</h3>
              <p className="feature-card__desc">
                {t('home.interactiveExercisesDesc')}
              </p>
            </div>

            {/* CARD 3 */}
            <div className="feature-card feature-card--darkred">
              <div className="card-thumb">
                <img src={Boy3Icon} alt="AI Learning" className="card-thumb__img" />
              </div>
              <h3 className="feature-card__title">{t('home.aiLearningTitle')}</h3>
              <p className="feature-card__desc">
                {t('home.aiLearningDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT DEUTSCHUP */}
      <section className="home-about">
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--6" />

        <div className="home-about__vault">
          <div className="home-container">
            <h2 className="home-section-title home-section-title--dark">{t('home.aboutTitle')}</h2>
            <p className="home-about__intro">
              {t('home.aboutIntro')}
            </p>

            <div className="home-about__grid">
              <div className="about-block">
                <div className="about-block__header">
                  <img src={SunIcon} alt="Sun" className="about-icon" />
                  <h3>{t('home.ourMission')}</h3>
                </div>
                <p>
                  {t('home.ourMissionDesc')}
                </p>
              </div>

              <div className="about-block">
                <div className="about-block__header">
                  <img src={SunIcon} alt="Sun" className="about-icon" />
                  <h3>{t('home.ourValues')}</h3>
                </div>
                <p>
                  <strong>{t('home.ourValuesDesc')}</strong>
                </p>
              </div>

              <div className="about-block">
                <div className="about-block__header">
                  <img src={SunIcon} alt="Sun" className="about-icon" />
                  <h3>{t('home.ourApproach')}</h3>
                </div>
                <p>
                  <strong>{t('home.ourApproachDesc')}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scalloped Divider out of About */}
      <ScallopedDivider fill="#FFF2B7" flip className="home-about-path-wave" />

      {/* 4. YOUR GERMAN LEARNING PATH */}
      <section className="home-path">
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--7" />
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--8" />
        <img src={CloudIcon} alt="Cloud" className="path-cloud path-cloud--left-1" />
        <img src={CloudIcon} alt="Cloud" className="path-cloud path-cloud--left-2" />
        <img src={CloudIcon} alt="Cloud" className="path-cloud path-cloud--right-1" />
        <img src={CloudIcon} alt="Cloud" className="path-cloud path-cloud--right-2" />

        <div className="home-container">
          <h2 className="home-section-title">{t('home.pathTitle')}</h2>
          <p className="home-section-subtitle">
            {t('home.pathSubtitle')}
          </p>

          <div className="path-grid">
            {fallbackLevels.map((lvl, idx) => (
              <div key={idx} className={`path-card path-card--${lvl.theme}`}>
                <div className="path-card__icon-wrap">
                  <img src={lvl.icon} alt={lvl.code} className="path-icon" />
                </div>
                <div className="path-card__level">{lvl.code}</div>
                <h3 className="path-card__title">{lvl.title}</h3>
                <p className="path-card__desc">{lvl.desc}</p>
                <Link to="/learning-path" className="path-card__btn">
                  {lvl.btnText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEARNING PLANS */}
      <section className="home-plans">
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--9" />

        <div className="home-container">
          <h2 className="home-section-title">{t('home.choosePlan')}</h2>

          <div className="plans-grid">
            {(plans.length > 0 ? sortPlans(plans) : defaultHomePlans).map((plan, index) => {
              const isPopular = plan.planType === 'PREMIUM' || plan.badge === 'POPULAR' || index === 1
              const cardClass = `plan-card ${isPopular ? 'plan-card--red plan-card--popular' : 'plan-card--blue'}`

              let planIcon = PencilIcon
              if (index === 1 || plan.planType === 'PREMIUM') planIcon = BookIcon
              else if (index === 2 || plan.planType === 'CUSTOM') planIcon = AppleIcon

              let subtitle = t('home.flexiblePlanning')
              if (isPopular) subtitle = t('home.easierBudgeting')
              else if (index === 2 || plan.planType === 'CUSTOM') subtitle = t('home.bestValue')

              const btnText = t('home.viewDetail')

              return (
                <div key={plan._id || plan.id || index} className={cardClass}>
                  {isPopular && (
                    <div className="plan-card__badge-floating">{t('home.bestChoice')}</div>
                  )}

                  <div className="plan-card__decor">
                    <img src={planIcon} alt={plan.name} className="plan-icon" />
                  </div>

                  <h3 className="plan-card__title">{plan.name}</h3>
                  <div className="plan-card__subtitle">{subtitle}</div>

                  <p className="plan-card__desc">
                    {plan.description || t('home.heroDesc')}
                  </p>

                  <Link to="/pricing" className="plan-card__btn">
                    {btnText}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. START YOUR GERMAN JOURNEY */}
      <section className="home-steps">
        <img src={CloudIcon} alt="Cloud" className="journey-cloud journey-cloud--top" />
        <img src={CloudIcon} alt="Cloud" className="journey-cloud journey-cloud--small" />
        <div className="home-container">
          <div className="steps-wrapper">
            <div className="steps-header">
              <div className="steps-illustration">
                <img src={BoyLearnIcon} alt="Learner" className="steps-img" />
              </div>
              <h2 className="home-section-title home-section-title--left">{t('home.startJourney')}</h2>
              <Link to="/learning-path" className="home-btn home-btn--primary">
                {t('home.startLearning')}
              </Link>
            </div>

            <div className="steps-list">
              <div className="step-item">
                <img src={SunIcon} alt="Step 1" className="step-icon" />
                <div>
                  <h6 className="step-title">{t('home.step1Title')}</h6>
                  <p className="step-desc">{t('home.step1Desc')}</p>
                </div>
              </div>

              <div className="step-item">
                <img src={SunIcon} alt="Step 2" className="step-icon" />
                <div>
                  <h6 className="step-title">{t('home.step2Title')}</h6>
                  <p className="step-desc">{t('home.step2Desc')}</p>
                </div>
              </div>

              <div className="step-item">
                <img src={SunIcon} alt="Step 3" className="step-icon" />
                <div>
                  <h6 className="step-title">{t('home.step3Title')}</h6>
                  <p className="step-desc">{t('home.step3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="home-faq">
        <img src={CloudIcon} alt="Cloud" className="cloud-decor cloud-decor--10" />

        <div className="home-container">
          <h2 className="home-section-title">{t('home.faqTitle')}</h2>

          <div className="faq-list">
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{item.question}</span>
                  <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                </div>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Existing FOOTER */}
      <Footer />
    </div>
  )
}

export default Home

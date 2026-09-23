import React from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CloudIcon from '../assets/Cloud.svg'
import SunIcon from '../assets/Icon-Sun.svg'
import AirBalloonIcon from '../assets/Icon-AirBollon.svg'
import PlaneIcon from '../assets/Icon-plane.svg'
import '../styles/pages/policy-and-terms.css'

type PolicySection = {
  title: string
  content: string
}

const PolicyCard = ({
  title,
  intro,
  sections,
  lastUpdate,
}: {
  title: string
  intro: string
  sections: PolicySection[]
  lastUpdate: string
}) => (
  <article className="policy-card">
    <div className="policy-card__heading">
      <h2>{title}</h2>
      <span>{lastUpdate}</span>
    </div>
    <p className="policy-card__intro">{intro}</p>
    <div className="policy-card__sections">
      {sections.map((section) => (
        <section className="policy-card__section" key={section.title}>
          <h3>{section.title}</h3>
          <p>{section.content}</p>
        </section>
      ))}
    </div>
  </article>
)

export const PolicyAndTerms: React.FC = () => {
  const { t, i18n } = useTranslation('common')
  const isVi = i18n.language === 'vi'

  const privacySections: PolicySection[] = isVi
    ? [
        {
          title: '1. Thông tin chúng tôi thu thập',
          content: 'Chúng tôi có thể thu thập họ tên, email, tin nhắn và dữ liệu duyệt web cơ bản của bạn.',
        },
        {
          title: '2. Cách chúng tôi thu thập thông tin',
          content: 'Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, gửi biểu mẫu hoặc tương tác với trang web.',
        },
        {
          title: '3. Cách chúng tôi sử dụng thông tin',
          content: 'Chúng tôi sử dụng thông tin để phục vụ học tập, hỗ trợ kỹ thuật và cải thiện trải nghiệm người dùng.',
        },
        {
          title: '4. Cookie và phân tích',
          content: 'Cookie giúp chúng tôi nâng cao hiệu suất, hiểu hành vi người học và mang lại trải nghiệm tối ưu.',
        },
        {
          title: '5. Chia sẻ với bên thứ ba',
          content: 'Chúng tôi chỉ chia sẻ thông tin cần thiết với các đối tác cung cấp dịch vụ tin cậy để vận hành hệ thống.',
        },
        {
          title: '6. Lưu trữ và bảo mật dữ liệu',
          content: 'Chúng tôi chỉ lưu trữ thông tin trong thời gian cần thiết và áp dụng các biện pháp bảo mật hiện đại.',
        },
        {
          title: '7. Quyền của người dùng',
          content: 'Bạn có quyền truy cập, yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào.',
        },
      ]
    : [
        {
          title: '1. Information we collect',
          content: 'We may collect your name, email, company, message, and basic browsing data.',
        },
        {
          title: '2. How we collect information',
          content: 'We collect information when you fill out forms, browse pages, or interact with our website.',
        },
        {
          title: '3. How we use information',
          content: 'We use your information to respond to inquiries, improve our website, and support services.',
        },
        {
          title: '4. Cookies and analytics',
          content: 'Cookies help us improve performance, understand visitor behavior, and deliver a better website experience.',
        },
        {
          title: '5. Sharing with third parties',
          content: 'We only share information with trusted service providers helping us operate our website.',
        },
        {
          title: '6. Data retention and security',
          content: 'We keep your information only as long as needed and apply reasonable measures to protect it.',
        },
        {
          title: '7. Your rights',
          content: 'You may request access, correction, deletion, or actions regarding your personal information.',
        },
      ]

  const termsSections: PolicySection[] = isVi
    ? [
        {
          title: '1. Sử dụng trang web',
          content: 'Vui lòng sử dụng trang web cho mục đích học tập hợp pháp và không gây tổn hại đến hệ thống hoặc người khác.',
        },
        {
          title: '2. Sở hữu trí tuệ',
          content: 'Toàn bộ nội dung trang web bao gồm văn bản, bài học, hình ảnh và thương hiệu thuộc quyền sở hữu của DeutschUp.',
        },
        {
          title: '3. Hành vi bị nghiêm cấm',
          content: 'Bạn không được sao chép trái phép, phá hoại, làm gián đoạn hoặc tìm cách truy cập các phần bị giới hạn.',
        },
        {
          title: '4. Mô tả dịch vụ',
          content: 'Mô tả dịch vụ và nội dung khóa học được cung cấp để tham khảo và có thể được cập nhật theo lộ trình phát triển.',
        },
        {
          title: '5. Giới hạn trách nhiệm',
          content: 'Chúng tôi không chịu trách nhiệm đối với các thiệt hại phát sinh từ lỗi mạng bên ngoài hoặc gián đoạn kỹ thuật bất khả kháng.',
        },
        {
          title: '6. Liên kết bên ngoài',
          content: 'Trang web có thể chứa liên kết tới bên thứ ba và chúng tôi không chịu trách nhiệm về nội dung của các trang đó.',
        },
        {
          title: '7. Thay đổi điều khoản',
          content: 'Chúng tôi có thể cập nhật Điều khoản bất kỳ lúc nào. Việc tiếp tục sử dụng đồng nghĩa bạn chấp thuận các thay đổi.',
        },
        {
          title: '8. Luật áp dụng',
          content: 'Các Điều khoản này được điều chỉnh theo quy định pháp luật hiện hành và thẩm quyền giải quyết tranh chấp địa phương.',
        },
      ]
    : [
        {
          title: '1. Website use',
          content: 'Please use this website only for lawful purposes and avoid actions that may harm others.',
        },
        {
          title: '2. Intellectual property',
          content: 'All website content, including text, images, and branding, belongs to DeutschUp unless stated otherwise.',
        },
        {
          title: '3. Prohibited use',
          content: 'You may not copy, misuse, disrupt, or attempt to access restricted parts of this website.',
        },
        {
          title: '4. Service descriptions',
          content: 'Our service descriptions are provided for general information and may change based on project needs.',
        },
        {
          title: '5. Limitation of liability',
          content: 'We are not responsible for damages caused by website errors, delays, or third-party services.',
        },
        {
          title: '6. External links',
          content: 'This website may contain third-party links, and we are not responsible for their content.',
        },
        {
          title: '7. Changes to terms',
          content: 'We may update these Terms at any time, and continued use means you accept changes.',
        },
        {
          title: '8. Governing law',
          content: 'These Terms are governed by applicable laws and any disputes will follow local jurisdiction.',
        },
      ]

  return (
    <div className="policy-page">
      <Header />

      <main>
        <section className="policy-hero">
          <div className="policy-container policy-hero__container">
            <h1>{t('policy.heroTitle')}</h1>
          </div>
        </section>

        <section className="policy-content policy-container">
          <aside className="policy-contact">
            <div className="policy-contact__card">
              <h2>{t('policy.contactUs')}</h2>
              <p>{t('policy.contactDesc')}</p>
              <div className="policy-contact__divider" />
              <address>
                <span>123 Main Street, New York, USA</span>
                <span>+123 456 789</span>
                <a href="mailto:hello@deutschup.com">hello@deutschup.com</a>
              </address>
              <div className="policy-contact__divider" />
              <div className="policy-contact__socials" aria-label="Social media links">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
              </div>
            </div>
            <a className="policy-contact__button" href="mailto:hello@deutschup.com">
              {t('policy.contactNow')}
            </a>
          </aside>

          <div className="policy-documents">
            <PolicyCard
              title={t('policy.policiesTitle')}
              intro={t('policy.policiesIntro')}
              sections={privacySections}
              lastUpdate={t('policy.lastUpdate')}
            />
            <PolicyCard
              title={t('policy.termsTitle')}
              intro={t('policy.termsIntro')}
              sections={termsSections}
              lastUpdate={t('policy.lastUpdate')}
            />
          </div>
        </section>
      </main>

      <div className="policy-sky-decor" aria-hidden="true">
        <img src={CloudIcon} alt="" className="policy-sky-decor__cloud policy-sky-decor__cloud--one" />
        <img src={CloudIcon} alt="" className="policy-sky-decor__cloud policy-sky-decor__cloud--two" />
        <img src={AirBalloonIcon} alt="" className="policy-sky-decor__balloon" />
        <img src={SunIcon} alt="" className="policy-sky-decor__sun" />
        <img src={PlaneIcon} alt="" className="policy-sky-decor__plane" />
      </div>

      <Footer />
    </div>
  )
}

export default PolicyAndTerms

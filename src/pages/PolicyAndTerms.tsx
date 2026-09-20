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

const privacySections: PolicySection[] = [
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

const termsSections: PolicySection[] = [
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

const PolicyCard = ({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: PolicySection[]
}) => (
  <article className="policy-card">
    <div className="policy-card__heading">
      <h2>{title}</h2>
      <span>Last update: July 2026</span>
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

const PolicyAndTerms = () => (
  <div className="policy-page">
    <Header />

    <main>
      <section className="policy-hero">
        <div className="policy-container policy-hero__container">
          <h1>POLICIES<br />AND TERMS</h1>
        </div>
      </section>

      <section className="policy-content policy-container">
        <aside className="policy-contact">
          <div className="policy-contact__card">
            <h2>CONTACT US</h2>
            <p>If you have questions about this page, please contact us using the details on this website.</p>
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
          <a className="policy-contact__button" href="mailto:hello@deutschup.com">CONTACT NOW</a>
        </aside>

        <div className="policy-documents">
          <PolicyCard
            title="POLICIES"
            intro="We respect your privacy and explain how we collect, use, and protect your information here."
            sections={privacySections}
          />
          <PolicyCard
            title="TERMS"
            intro="By using this website, you agree to follow these Terms and any updates we make."
            sections={termsSections}
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

export default PolicyAndTerms

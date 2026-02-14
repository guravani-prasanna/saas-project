// frontend/src/pages/footer/PrivacyPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './FooterPages.css';

const PrivacyPage = () => {
  const lastUpdated = "December 1, 2023";

  return (
      <div className="footer-page-container">
        <Link to="/" className="back-to-home">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
          </svg>
          Back to Home
        </Link>

        <div className="footer-page-header">
          <h1 className="footer-page-title">Privacy Policy</h1>
          <p className="footer-page-subtitle">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="footer-page-content">
          <div className="footer-page-section">
            <h2 className="section-title">1. Introduction</h2>
            <div className="section-content">
              <p>
                Welcome to SaaS Project. We respect your privacy and are committed to protecting 
                your personal data. This privacy policy will inform you about how we look after 
                your personal data when you visit our website and use our services, and tell you 
                about your privacy rights and how the law protects you.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">2. Information We Collect</h2>
            <div className="section-content">
              <p>We collect several types of information from and about users of our Service:</p>
              
              <h3>Personal Data</h3>
              <ul>
                <li><strong>Identity Data:</strong> Full name, username</li>
                <li><strong>Contact Data:</strong> Email address, phone number</li>
                <li><strong>Profile Data:</strong> Preferences, feedback, survey responses</li>
                <li><strong>Usage Data:</strong> Information about how you use our Service</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              </ul>

              <h3>Non-Personal Data</h3>
              <p>
                We also collect, use, and share aggregated data such as statistical or demographic 
                data for any purpose. Aggregated data may be derived from your personal data but 
                is not considered personal data as this data does not directly or indirectly 
                reveal your identity.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">3. How We Use Your Information</h2>
            <div className="section-content">
              <p>We use your personal data for the following purposes:</p>
              <ul>
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To send you marketing communications (with your consent)</li>
              </ul>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">4. Data Security</h2>
            <div className="section-content">
              <p>
                We have implemented appropriate security measures to prevent your personal data 
                from being accidentally lost, used, or accessed in an unauthorized way, altered, 
                or disclosed. In addition, we limit access to your personal data to those employees, 
                agents, contractors, and other third parties who have a business need to know.
              </p>
              <p>
                We have put in place procedures to deal with any suspected personal data breach 
                and will notify you and any applicable regulator of a breach where we are legally 
                required to do so.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">5. Data Retention</h2>
            <div className="section-content">
              <p>
                We will only retain your personal data for as long as reasonably necessary to 
                fulfill the purposes we collected it for, including for the purposes of satisfying 
                any legal, regulatory, tax, accounting, or reporting requirements.
              </p>
              <p>
                To determine the appropriate retention period for personal data, we consider the 
                amount, nature, and sensitivity of the personal data, the potential risk of harm 
                from unauthorized use or disclosure of your personal data, the purposes for which 
                we process your personal data, and whether we can achieve those purposes through 
                other means, and the applicable legal, regulatory, tax, accounting, or other 
                requirements.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">6. Your Rights</h2>
            <div className="section-content">
              <p>Under certain circumstances, you have rights under data protection laws:</p>
              <ul>
                <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Request restriction of processing</li>
                <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
                <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the information provided 
                in the Contact section.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">7. Contact Us</h2>
            <div className="section-content">
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul>
                <li>By email: privacy@saasproject.com</li>
                <li>By visiting our <Link to="/contact">Contact page</Link></li>
                <li>By mail: 123 Business Street, Suite 100, San Francisco, CA 94107</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PrivacyPage;
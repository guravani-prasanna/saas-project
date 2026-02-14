// frontend/src/pages/footer/TermsPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './FooterPages.css';

const TermsPage = () => {
  const effectiveDate = "December 1, 2023";

  return (
      <div className="footer-page-container">
        <Link to="/" className="back-to-home">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
          </svg>
          Back to Home
        </Link>

        <div className="footer-page-header">
          <h1 className="footer-page-title">Terms of Service</h1>
          <p className="footer-page-subtitle">
            Effective Date: {effectiveDate}
          </p>
        </div>

        <div className="footer-page-content">
          <div className="footer-page-section">
            <h2 className="section-title">1. Agreement to Terms</h2>
            <div className="section-content">
              <p>
                By accessing or using SaaS Project ("the Service"), you agree to be bound by these 
                Terms of Service. If you disagree with any part of the terms, then you may not 
                access the Service.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">2. Description of Service</h2>
            <div className="section-content">
              <p>
                SaaS Project is a cloud-based project management platform that provides tools for 
                task management, team collaboration, project tracking, and reporting services.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">3. User Accounts</h2>
            <div className="section-content">
              <p>When you create an account with us, you must provide information that is:</p>
              <ul>
                <li>Accurate, complete, and current at all times</li>
                <li>Not misleading or deceptive</li>
                <li>Not in violation of any applicable law or regulation</li>
              </ul>
              <p>
                You are responsible for maintaining the confidentiality of your account and password 
                and for restricting access to your computer. You agree to accept responsibility for 
                all activities that occur under your account or password.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">4. Subscription and Payments</h2>
            <div className="section-content">
              <p><strong>Free Trial:</strong> We may offer a free trial period. At the end of the 
              free trial period, you will be automatically charged unless you cancel before the 
              trial ends.</p>
              
              <p><strong>Subscriptions:</strong> Some parts of the Service are billed on a 
              subscription basis. You will be billed in advance on a recurring and periodic basis.</p>
              
              <p><strong>Fee Changes:</strong> We may change subscription fees at any time. We will 
              provide you with reasonable prior notice of any fee changes.</p>
              
              <p><strong>Refunds:</strong> Certain refund requests may be considered on a case-by-case 
              basis and granted at our sole discretion.</p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">5. Content and Conduct</h2>
            <div className="section-content">
              <p>You are responsible for all content that you post, upload, or otherwise make 
              available through the Service. You agree not to use the Service to:</p>
              <ul>
                <li>Upload or transmit any content that is unlawful, harmful, or offensive</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe upon any intellectual property rights</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Transmit any viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to the Service</li>
              </ul>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">6. Intellectual Property</h2>
            <div className="section-content">
              <p>
                The Service and its original content, features, and functionality are and will 
                remain the exclusive property of SaaS Project and its licensors. The Service is 
                protected by copyright, trademark, and other laws of both the United States and 
                foreign countries.
              </p>
              <p>
                Our trademarks and trade dress may not be used in connection with any product or 
                service without the prior written consent of SaaS Project.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">7. Termination</h2>
            <div className="section-content">
              <p>
                We may terminate or suspend your account immediately, without prior notice or 
                liability, for any reason whatsoever, including without limitation if you breach 
                the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish 
                to terminate your account, you may simply discontinue using the Service or contact 
                us to delete your account.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">8. Limitation of Liability</h2>
            <div className="section-content">
              <p>
                In no event shall SaaS Project, nor its directors, employees, partners, agents, 
                suppliers, or affiliates, be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">9. Changes to Terms</h2>
            <div className="section-content">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at 
                any time. If a revision is material, we will try to provide at least 30 days' notice 
                prior to any new terms taking effect. What constitutes a material change will be 
                determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after those revisions become effective, 
                you agree to be bound by the revised terms.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">10. Contact Information</h2>
            <div className="section-content">
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul>
                <li>By email: legal@saasproject.com</li>
                <li>By visiting our <Link to="/contact">Contact page</Link></li>
                <li>By mail: 123 Business Street, Suite 100, San Francisco, CA 94107</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TermsPage;
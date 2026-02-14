import React from 'react';
import { Link } from 'react-router-dom';
import './FooterPages.css';

const SupportPage = () => {
  return (
      <div className="footer-page-container">
        <Link to="/" className="back-to-home">
          ← Back to Home
        </Link>

        <div className="footer-page-header">
          <h1 className="footer-page-title">Support</h1>
          <p className="footer-page-subtitle">
            Need help using our Project & Task Management platform?
            Find answers, guides, and ways to contact our support team.
          </p>
        </div>

        <div className="footer-page-content">
          {/* SUPPORT OVERVIEW */}
          <div className="footer-page-section">
            <h2 className="section-title">How We Can Help</h2>
            <p>
              Our support team is here to help you with account setup,
              project management, task workflows, permissions, billing,
              and security-related questions.
            </p>
          </div>

          {/* SUPPORT CHANNELS */}
          <div className="footer-page-section">
            <h2 className="section-title">Support Channels</h2>
            <ul className="info-list">
              <li>
                <strong>Email Support:</strong> support@saasplatform.com
              </li>
              <li>
                <strong>Help Desk:</strong> Available inside your dashboard
              </li>
              <li>
                <strong>Response Time:</strong> Within 24 business hours
              </li>
              <li>
                <strong>Critical Issues:</strong> Prioritized for enterprise users
              </li>
            </ul>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS */}
          <div className="footer-page-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <ul className="faq-list">
              <li>
                <strong>How do I create a new project?</strong>
                <p>
                  After logging in, go to the Projects section and click
                  “Create Project”. Fill in the required details and assign members.
                </p>
              </li>

              <li>
                <strong>How does multi-tenancy work?</strong>
                <p>
                  Each organization (tenant) has completely isolated data.
                  Users can only access projects and tasks within their own organization.
                </p>
              </li>

              <li>
                <strong>How do I manage user roles?</strong>
                <p>
                  Admins can assign roles such as Admin, Manager, or Member
                  from the Team Management section.
                </p>
              </li>

              <li>
                <strong>What should I do if I forget my password?</strong>
                <p>
                  Use the “Forgot Password” option on the login page
                  to reset your password securely.
                </p>
              </li>
            </ul>
          </div>

          {/* DOCUMENTATION */}
          <div className="footer-page-section">
            <h2 className="section-title">Documentation & Resources</h2>
            <ul className="footer-links">
              <li><Link to="/docs/getting-started">Getting Started Guide</Link></li>
              <li><Link to="/docs/projects">Project Management</Link></li>
              <li><Link to="/docs/tasks">Task & Workflow Guide</Link></li>
              <li><Link to="/docs/security">Security & Permissions</Link></li>
            </ul>
          </div>

          {/* SYSTEM STATUS */}
          <div className="footer-page-section">
            <h2 className="section-title">System Status</h2>
            <p>
              All systems are currently operational.  
              Any scheduled maintenance or outages will be communicated
              in advance via email and dashboard notifications.
            </p>
          </div>

          {/* CONTACT SUPPORT */}
          <div className="footer-page-section">
            <h2 className="section-title">Still Need Help?</h2>
            <p>
              If you couldn’t find an answer here, feel free to reach out
              to our support team directly.
            </p>
            <Link to="/contact" className="submit-btn">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
  );
};

export default SupportPage;

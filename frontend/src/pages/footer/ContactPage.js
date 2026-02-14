import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FooterPages.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
      <div className="footer-page-container">
        <Link to="/" className="back-to-home">
          ← Back to Home
        </Link>

        <div className="footer-page-header">
          <h1 className="footer-page-title">Contact Us</h1>
          <p className="footer-page-subtitle">
            Have questions about projects, tasks, billing, or security?
            Reach out to our team anytime.
          </p>
        </div>

        <div className="footer-page-content">
          {/* CONTACT FORM */}
          <div className="footer-page-section">
            <h2 className="section-title">Send Us a Message</h2>

            {submitSuccess && (
              <div className="success-box">
                <strong>Thank you!</strong> Your message has been sent.
                Our team will respond within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing</option>
                  <option value="feature">Feature Request</option>
                  <option value="security">Security Concern</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Describe your issue or question..."
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* CONTACT INFO */}
          <div className="footer-page-section">
            <h2 className="section-title">Contact Information</h2>
            <ul className="info-list">
              <li><strong>Email:</strong> vijaytamada333@gmail.com</li>
              <li><strong>Phone:</strong> +91 97039 23063</li>
              <li><strong>Support Hours:</strong> Mon – Fri, 9:00 AM – 6:00 PM IST</li>
            </ul>
          </div>

          {/* OFFICE ADDRESS */}
          <div className="footer-page-section">
            <h2 className="section-title">Office Address</h2>
            <p>
              SaaS Platform Pvt Ltd<br />
              5th Floor, Tech Park<br />
              Hyderabad, Telangana – 500081<br />
              India
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-page-section">
            <h2 className="section-title">Quick Links</h2>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/security">Security</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>

          {/* LEGAL LINKS */}
          <div className="footer-page-section">
            <h2 className="section-title">Legal</h2>
            <ul className="footer-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/data-protection">Data Protection</Link></li>
              <li><Link to="/cookie-policy">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
  );
};

export default ContactPage;

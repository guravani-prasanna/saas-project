// frontend/src/pages/footer/AboutPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './FooterPages.css';

const AboutPage = () => {
  return (
      <div className="footer-page-container">
        <Link to="/" className="back-to-home">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
          </svg>
          Back to Home
        </Link>

        <div className="footer-page-header">
          <h1 className="footer-page-title">About SaaS Project</h1>
          <p className="footer-page-subtitle">
            Empowering teams to collaborate, organize, and achieve more together.
          </p>
        </div>

        <div className="footer-page-content">
          <div className="footer-page-section">
            <h2 className="section-title">Our Mission</h2>
            <div className="section-content">
              <p>
                At SaaS Project, our mission is to simplify project management and team collaboration 
                for organizations of all sizes. We believe that when teams have the right tools, they 
                can achieve extraordinary results.
              </p>
              <p>
                We're committed to creating intuitive, powerful software that helps teams plan, 
                track, and deliver projects efficiently while fostering better communication and 
                collaboration.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">Our Story</h2>
            <div className="section-content">
              <p>
                SaaS Project was founded in 2023 by a team of project managers, developers, and 
                designers who were frustrated with the complexity of existing project management tools. 
                We saw a need for a solution that was both powerful enough for complex projects and 
                simple enough for everyday use.
              </p>
              <p>
                What started as an internal tool for our own team quickly grew into a platform 
                used by hundreds of organizations worldwide. Today, we continue to evolve based on 
                user feedback and the changing needs of modern teams.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">Our Values</h2>
            <div className="section-content">
              <ul>
                <li>
                  <strong>Simplicity First:</strong> We believe powerful tools should be easy to use. 
                  We continuously refine our interface to ensure it remains intuitive.
                </li>
                <li>
                  <strong>Customer-Centric:</strong> Our users guide our development. We listen to 
                  feedback and prioritize features that solve real problems.
                </li>
                <li>
                  <strong>Transparency:</strong> We're open about our development process, roadmap, 
                  and pricing. No hidden fees or surprises.
                </li>
                <li>
                  <strong>Security & Privacy:</strong> We take data protection seriously with 
                  enterprise-grade security measures and clear privacy policies.
                </li>
                <li>
                  <strong>Continuous Improvement:</strong> We're always learning, iterating, and 
                  improving our platform to better serve our users.
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">Our Team</h2>
            <div className="section-content">
              <p>
                We're a diverse team of passionate individuals with expertise in software development, 
                UX design, project management, and customer support. While we come from different 
                backgrounds, we share a common goal: creating software that makes work life better 
                for everyone.
              </p>
              <p>
                Our team is fully remote, with members across different time zones, which helps us 
                understand and serve our global customer base better.
              </p>
            </div>
          </div>

          <div className="footer-page-section">
            <h2 className="section-title">Join Our Journey</h2>
            <div className="section-content">
              <p>
                Whether you're looking for a better way to manage projects or interested in joining 
                our team, we'd love to hear from you. Together, we're building the future of 
                work collaboration.
              </p>
              <p>
                <Link to="/contact" className="doc-link">
                  Get in touch with us
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AboutPage;
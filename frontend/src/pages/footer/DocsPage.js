import React from 'react';
import { Link } from 'react-router-dom';
import './FooterPages.css';

const DocsPage = () => {
  return (
      <div className="footer-page-container">
        <Link to="/" className="back-to-home">
          ← Back to Home
        </Link>

        <div className="footer-page-header">
          <h1 className="footer-page-title">Documentation</h1>
          <p className="footer-page-subtitle">
            Everything you need to get started and master our
            Project & Task Management platform.
          </p>
        </div>

        <div className="footer-page-content">
          {/* INTRODUCTION */}
          <div className="footer-page-section">
            <h2 className="section-title">Getting Started</h2>
            <p>
              Our platform is designed to help organizations manage projects,
              tasks, and teams efficiently using a secure multi-tenant
              architecture. Each organization’s data is completely isolated
              and protected.
            </p>
          </div>

          {/* ACCOUNT & AUTH */}
          <div className="footer-page-section">
            <h2 className="section-title">Account & Authentication</h2>
            <ul className="info-list">
              <li>Create an organization and invite team members</li>
              <li>Secure login using JWT-based authentication</li>
              <li>Role-based access control (Admin, Manager, Member)</li>
              <li>Password reset and session expiration for security</li>
            </ul>
          </div>

          {/* PROJECT MANAGEMENT */}
          <div className="footer-page-section">
            <h2 className="section-title">Project Management</h2>
            <p>
              Projects act as containers for tasks and team collaboration.
              Each project belongs to a single organization and is visible
              only to authorized users.
            </p>
            <ul className="info-list">
              <li>Create, update, and archive projects</li>
              <li>Assign project members and roles</li>
              <li>Track project progress and status</li>
            </ul>
          </div>

          {/* TASK MANAGEMENT */}
          <div className="footer-page-section">
            <h2 className="section-title">Task Management</h2>
            <p>
              Tasks help break down work into actionable items with clear
              ownership and deadlines.
            </p>
            <ul className="info-list">
              <li>Create tasks with priority and due dates</li>
              <li>Assign tasks to team members</li>
              <li>Track task status: To Do, In Progress, Done</li>
              <li>Comment and collaborate within tasks</li>
            </ul>
          </div>

          {/* MULTI-TENANCY */}
          <div className="footer-page-section">
            <h2 className="section-title">Multi-Tenancy & Data Isolation</h2>
            <p>
              Our system follows a strict multi-tenant architecture.
              Every record in the database is associated with a tenant ID,
              ensuring complete data isolation between organizations.
            </p>
            <ul className="info-list">
              <li>No cross-organization data access</li>
              <li>Tenant-aware APIs and authorization</li>
              <li>Secure subdomain-based organization access</li>
            </ul>
          </div>

          {/* SECURITY */}
          <div className="footer-page-section">
            <h2 className="section-title">Security Best Practices</h2>
            <ul className="info-list">
              <li>Encrypted passwords and sensitive data</li>
              <li>JWT token expiration and refresh strategy</li>
              <li>Role-based permission checks on every request</li>
              <li>Audit logging for critical actions</li>
            </ul>
          </div>

          {/* DOCUMENTATION LINKS */}
          <div className="footer-page-section">
            <h2 className="section-title">Detailed Guides</h2>
            <ul className="footer-links">
              <li><Link to="/docs/api">API Documentation</Link></li>
              <li><Link to="/docs/roles">User Roles & Permissions</Link></li>
              <li><Link to="/docs/security">Security Overview</Link></li>
              <li><Link to="/docs/faq">Documentation FAQ</Link></li>
            </ul>
          </div>

          {/* NEED HELP */}
          <div className="footer-page-section">
            <h2 className="section-title">Need Help?</h2>
            <p>
              If you’re stuck or need clarification, our support team is
              always ready to help.
            </p>
            <Link to="/support" className="submit-btn">
              Visit Support Page
            </Link>
          </div>
        </div>
      </div>
  );
};

export default DocsPage;

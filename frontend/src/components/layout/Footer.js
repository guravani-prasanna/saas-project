// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>SaaS Project</h3>
        </div>

        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/support">Support</Link>
          <Link to="/documentation">Documentation</Link>
        </div>

        <div className="footer-copy">
          © 2025 SaaS Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

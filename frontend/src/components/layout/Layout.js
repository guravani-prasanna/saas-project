// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ 
  children, 
  className = '', 
  showBreadcrumb = false,
  breadcrumbItems = [],
  pageTitle = '',
  pageDescription = '',
  isLoading = false,
  error = null,
  onRetry = null
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ================= ERROR STATE ================= */
  if (error) {
    return (
      <div className={`layout ${className}`}>
        <Navbar />

        <main className="main-content">
          <div className="container">
            <div className="layout-error">
              <h2>Something went wrong</h2>
              <p>{error.message || 'Unexpected error occurred.'}</p>

              <div className="error-actions">
                <button
                  onClick={() => window.location.reload()}
                  className="error-btn primary"
                >
                  Reload Page
                </button>

                {onRetry && (
                  <button onClick={onRetry} className="error-btn secondary">
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className={`layout ${className}`}>
      {/* ================= LOADING ================= */}
      {isLoading && (
        <div className="layout-loading">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= PAGE HEADER ================= */}
      {pageTitle && (
        <div className="page-header">
          <div className="container">
            <h1>{pageTitle}</h1>
            {pageDescription && <p>{pageDescription}</p>}
          </div>
        </div>
      )}

      {/* ================= BREADCRUMB ================= */}
      {showBreadcrumb && breadcrumbItems.length > 0 && (
        <nav className="breadcrumb">
          <div className="container">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.to}>
                <Link
                  to={item.to}
                  className={`breadcrumb-link ${
                    index === breadcrumbItems.length - 1 ? 'active' : ''
                  }`}
                >
                  {item.label}
                </Link>
                {index < breadcrumbItems.length - 1 && (
                  <span className="breadcrumb-separator">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {children}
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= BACK TO TOP ================= */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  );
};

/* ================= LAYOUT VARIANTS ================= */
export const FullWidthLayout = (props) => (
  <Layout className="full-width" {...props} />
);

export const CompactLayout = (props) => (
  <Layout className="compact" {...props} />
);

export const FixedWidthLayout = (props) => (
  <Layout className="fixed-width" {...props} />
);

export const FluidLayout = (props) => (
  <Layout className="fluid" {...props} />
);

export const WithSidebarLayout = (props) => (
  <Layout className="with-sidebar" {...props} />
);

export const PageLayout = ({
  title,
  description,
  breadcrumbItems = [],
  children,
  ...props
}) => (
  <Layout
    pageTitle={title}
    pageDescription={description}
    showBreadcrumb={breadcrumbItems.length > 0}
    breadcrumbItems={breadcrumbItems}
    {...props}
  >
    {children}
  </Layout>
);

export default Layout;

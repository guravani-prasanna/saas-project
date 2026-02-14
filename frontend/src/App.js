import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import UsersPage from './pages/UsersPage';

// Footer Pages
import AboutPage from './pages/footer/AboutPage';
import ContactPage from './pages/footer/ContactPage';
import PrivacyPage from './pages/footer/PrivacyPage';
import TermsPage from './pages/footer/TermsPage';
import SupportPage from './pages/footer/SupportPage';
import DocsPage from './pages/footer/DocsPage';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>

            {/* ================= PUBLIC (NO LAYOUT) ================= */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ================= FOOTER PAGES (PUBLIC + LAYOUT) ================= */}
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />

            <Route
              path="/contact"
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />

            <Route
              path="/privacy"
              element={
                <Layout>
                  <PrivacyPage />
                </Layout>
              }
            />

            <Route
              path="/terms"
              element={
                <Layout>
                  <TermsPage />
                </Layout>
              }
            />

            <Route
              path="/support"
              element={
                <Layout>
                  <SupportPage />
                </Layout>
              }
            />

            <Route
              path="/docs"
              element={
                <Layout>
                  <DocsPage />
                </Layout>
              }
            />

            {/* ================= PROTECTED ROUTES ================= */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']}>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ================= DEFAULT ================= */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ================= 404 ================= */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

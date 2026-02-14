// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    tenantName: '',
    subdomain: '',
    adminEmail: '',
    adminFullName: '',
    adminPassword: '',
    confirmPassword: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setForm((prev) => ({ ...prev, [name]: newValue }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.tenantName.trim()) {
      errors.tenantName = 'Organization name is required';
    } else if (form.tenantName.length < 3) {
      errors.tenantName = 'Organization name must be at least 3 characters';
    }
    
    if (!form.subdomain.trim()) {
      errors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(form.subdomain)) {
      errors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    } else if (form.subdomain.length < 3) {
      errors.subdomain = 'Subdomain must be at least 3 characters';
    }
    
    if (!form.adminEmail.trim()) {
      errors.adminEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      errors.adminEmail = 'Please enter a valid email address';
    }
    
    if (!form.adminFullName.trim()) {
      errors.adminFullName = 'Full name is required';
    }
    
    if (!form.adminPassword) {
      errors.adminPassword = 'Password is required';
    } else if (form.adminPassword.length < 8) {
      errors.adminPassword = 'Password must be at least 8 characters';
    }
    
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.adminPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!form.terms) {
      errors.terms = 'You must accept the Terms & Conditions';
    }
    
    return errors;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength: (strength / 4) * 100, label: labels[strength] };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tenantName: form.tenantName.trim(),
        subdomain: form.subdomain.trim().toLowerCase(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        adminFullName: form.adminFullName.trim(),
      };
      
      const response = await api.post('/auth/register-tenant', payload);
      
      setSuccessMsg('Organization registered successfully! Redirecting to login...');
      
      // Clear form
      setForm({
        tenantName: '',
        subdomain: '',
        adminEmail: '',
        adminFullName: '',
        adminPassword: '',
        confirmPassword: '',
        terms: false,
      });
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.response?.data?.data?.errors?.[0]?.msg || 
                  'Registration failed. Please try again.';
      setError(msg);
      
      // Handle specific backend validation errors
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        setValidationErrors(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(backendErrors).map(([key, value]) => [key, value.msg || value])
          )
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(form.adminPassword);

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <h1 className="register-title">Create Your Organization</h1>
          <p className="register-subtitle">Get started with your free account</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className="step active">
            <div className="step-number">1</div>
            <div className="step-label">Organization</div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-label">Admin Details</div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-label">Complete</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Organization Details */}
          <div className="form-group">
            <label className="form-label">
              Organization Name
              <span className="required-badge">Required</span>
            </label>
            <input
              type="text"
              name="tenantName"
              value={form.tenantName}
              onChange={handleChange}
              className={`form-input ${validationErrors.tenantName ? 'error' : ''}`}
              placeholder="Enter your organization name"
              maxLength={50}
            />
            {validationErrors.tenantName && (
              <div className="validation-error">{validationErrors.tenantName}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Subdomain
              <span className="required-badge">Required</span>
            </label>
            <input
              type="text"
              name="subdomain"
              value={form.subdomain}
              onChange={handleChange}
              className={`form-input ${validationErrors.subdomain ? 'error' : ''}`}
              placeholder="your-organization"
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <div className="subdomain-preview">
              Your dashboard will be at: <span className="highlight">{form.subdomain || 'your-organization'}</span>.yourapp.com
            </div>
            {validationErrors.subdomain && (
              <div className="validation-error">{validationErrors.subdomain}</div>
            )}
          </div>

          {/* Admin Details */}
          <div className="form-group">
            <label className="form-label">
              Admin Full Name
              <span className="required-badge">Required</span>
            </label>
            <input
              type="text"
              name="adminFullName"
              value={form.adminFullName}
              onChange={handleChange}
              className={`form-input ${validationErrors.adminFullName ? 'error' : ''}`}
              placeholder="Enter your full name"
            />
            {validationErrors.adminFullName && (
              <div className="validation-error">{validationErrors.adminFullName}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Admin Email
              <span className="required-badge">Required</span>
            </label>
            <input
              type="email"
              name="adminEmail"
              value={form.adminEmail}
              onChange={handleChange}
              className={`form-input ${validationErrors.adminEmail ? 'error' : ''}`}
              placeholder="Enter your email address"
            />
            {validationErrors.adminEmail && (
              <div className="validation-error">{validationErrors.adminEmail}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
              <span className="required-badge">Required</span>
            </label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="adminPassword"
                value={form.adminPassword}
                onChange={handleChange}
                className={`form-input ${validationErrors.adminPassword ? 'error' : ''}`}
                placeholder="Create a secure password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="toggle-password"
                tabIndex="-1"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {form.adminPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${
                      passwordStrength.strength < 50 ? 'weak' :
                      passwordStrength.strength < 75 ? 'fair' : 'good'
                    }`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
                <div className="strength-text">
                  Password strength: {passwordStrength.label}
                </div>
              </div>
            )}
            {validationErrors.adminPassword && (
              <div className="validation-error">{validationErrors.adminPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm Password
              <span className="required-badge">Required</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter your password"
            />
            {validationErrors.confirmPassword && (
              <div className="validation-error">{validationErrors.confirmPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
              />
              <span>
                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </span>
            </label>
            {validationErrors.terms && (
              <div className="validation-error">{validationErrors.terms}</div>
            )}
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="error-message">
              <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="success-message">
              <svg className="success-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Organization Account'
            )}
          </button>

          {/* Footer */}
          <div className="register-footer">
            Already have an organization? <Link to="/login">Sign in here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
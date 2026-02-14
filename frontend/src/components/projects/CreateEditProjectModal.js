// frontend/src/components/projects/CreateEditProjectModal.js
import React, { useState } from 'react';
import api from '../../services/api';
import './CreateEditProjectModal.css';

const CreateEditProjectModal = ({ project, onClose, onSaved }) => {
  const isEdit = !!project.id;
  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status || 'active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validation
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Project name is required';
    } else if (name.length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    } else if (name.length > 100) {
      errors.name = 'Project name must be less than 100 characters';
    }

    if (description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        status
      };

      if (isEdit) {
        await api.put(`/projects/${project.id}`, projectData);
      } else {
        await api.post('/projects', projectData);
      }
      
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving project';
      setError(msg);
      
      // Handle backend validation errors
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
      setSaving(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'archived': return 'status-archived';
      case 'completed': return 'status-completed';
      default: return 'status-active';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'archived': return 'Archived';
      case 'completed': return 'Completed';
      default: return 'Active';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Project' : 'Create New Project'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <label>
            <span>
              Project Name
              <span className="required">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className={validationErrors.name ? 'error' : ''}
              placeholder="Enter project name"
              maxLength={100}
              autoFocus
            />
            {validationErrors.name && (
              <div className="error-msg" style={{ marginTop: '0.5rem' }}>
                {validationErrors.name}
              </div>
            )}
            <div className="char-counter">
              {name.length}/100 characters
            </div>
          </label>

          {/* Description */}
          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              className={validationErrors.description ? 'error' : ''}
              placeholder="Describe the project (optional)"
              maxLength={500}
            />
            {validationErrors.description && (
              <div className="error-msg" style={{ marginTop: '0.5rem' }}>
                {validationErrors.description}
              </div>
            )}
            <div className={`char-counter ${description.length > 450 ? 'warning' : ''}`}>
              {description.length}/500 characters
            </div>
          </label>

          {/* Status */}
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
            <div className="status-preview">
              <span>Preview:</span>
              <span className={getStatusColor(status)}>
                {getStatusLabel(status)}
              </span>
            </div>
          </label>

          {/* Error Message */}
          {error && (
            <div className="error-msg">
              {error}
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading-spinner"></span>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditProjectModal;
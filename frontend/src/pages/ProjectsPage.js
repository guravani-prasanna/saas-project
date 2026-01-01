// frontend/src/pages/ProjectsPage.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import CreateEditProjectModal from '../components/projects/CreateEditProjectModal';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalProject, setModalProject] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    archived: 0
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      const projectsData = res.data.data.projects || [];
      setProjects(projectsData);
      
      // Calculate stats
      const statsData = {
        total: projectsData.length,
        active: projectsData.filter(p => p.status === 'active').length,
        completed: projectsData.filter(p => p.status === 'completed').length,
        archived: projectsData.filter(p => p.status === 'archived').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearch('');
    loadProjects();
  };

  return (
    <div className="projects-page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button 
          type="button" 
          onClick={() => setModalProject({})}
          className="create-project-btn"
        >
          Create New Project
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.archived}</div>
          <div className="stat-label">Archived</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Search by project name..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
          <button 
            type="button" 
            onClick={loadProjects}
            className="apply-filters-btn"
          >
            Apply Filters
          </button>
          <button 
            type="button" 
            onClick={handleClearFilters}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="empty-title">No Projects Found</h3>
          <p className="empty-description">
            {search || statusFilter 
              ? "Try changing your search or filter criteria."
              : "Get started by creating your first project."}
          </p>
          <div className="empty-actions">
            <button 
              type="button" 
              onClick={() => setModalProject({})}
              className="create-project-btn"
            >
              Create First Project
            </button>
          </div>
        </div>
      ) : (
        /* Projects Grid */
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="card-header">
                <h3 className="project-title">{project.name}</h3>
                <p className="project-description">
                  {project.description?.slice(0, 100) || 'No description provided'}
                  {project.description && project.description.length > 100 ? '...' : ''}
                </p>
                <div className="project-meta">
                  <div className="meta-row">
                    <span className="meta-label">Status:</span>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Tasks:</span>
                    <span className="meta-value">{project.taskCount || 0}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">By:</span>
                    <span className="meta-value">
                      {project.createdBy?.fullName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <Link 
                  to={`/projects/${project.id}`} 
                  className="view-project-btn"
                >
                  <svg className="view-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  View Details
                </Link>
                <div className="card-actions">
                  <button 
                    type="button" 
                    onClick={() => setModalProject(project)}
                    className="action-btn edit-btn"
                  >
                    <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDelete(project.id)}
                    className="action-btn delete-btn"
                  >
                    <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      {modalProject !== null && (
        <CreateEditProjectModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onSaved={() => {
            setModalProject(null);
            loadProjects();
          }}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
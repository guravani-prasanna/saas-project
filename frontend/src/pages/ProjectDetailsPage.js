// frontend/src/pages/ProjectDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProjectDetailsPage.css';
const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });

  const loadProject = async () => {
    try {
      const res = await api.get('/projects');
      const foundProject = res.data.data.projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/tasks`, {
        params: {
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          assignedTo: filters.assignedTo || undefined,
        },
      });
      setTasks(res.data.data.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleProjectDelete = async () => {
    if (!window.confirm('Delete project and all tasks?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      navigate('/projects');
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Format task data - DO NOT include assignedTo if empty
      const taskToSend = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
      };
      
      // Only include assignedTo if it has a value
      if (newTask.assignedTo && newTask.assignedTo.trim() !== '') {
        taskToSend.assignedTo = newTask.assignedTo;
      }
      
      // ✅ CORRECTED: Send date in YYYY-MM-DD format (backend accepts this)
      if (newTask.dueDate && newTask.dueDate.trim() !== '') {
        // Ensure the date is in YYYY-MM-DD format
        const formattedDate = newTask.dueDate;
        taskToSend.dueDate = formattedDate; // Backend accepts "2036-12-31"
      }
      
      console.log('Creating task with data:', taskToSend);
      
      await api.post(`/projects/${projectId}/tasks`, taskToSend);
      setTaskModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
      });
      loadTasks();
    } catch (error) {
      alert('Failed to create task: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch (error) {
      alert('Failed to update task status');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  if (!project) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="project-details-container">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-header-top">
          <div className="project-title-section">
            <h1 className="project-title">{project.name}</h1>
            <p className="project-description">{project.description}</p>
          </div>
          <div className="project-header-actions">
            <span className={`project-status-badge ${
              project.status === 'active' ? 'status-active' :
              project.status === 'archived' ? 'status-archived' :
              'status-default'
            }`}>
              {project.status}
            </span>
            <button
              onClick={handleProjectDelete}
              className="delete-project-btn"
            >
              Delete Project
            </button>
          </div>
        </div>
        
        <div className="project-stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">Total Tasks</h3>
            <p className="stat-value">{project.taskCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Completed Tasks</h3>
            <p className="stat-value">{project.completedTaskCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Created</h3>
            <p className="stat-date">
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="tasks-header">
          <h2 className="tasks-title">Tasks</h2>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="add-task-btn"
          >
            Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            className="filter-select"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          <button
            onClick={loadTasks}
            className="filter-btn filter-apply"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters({ status: '', priority: '', assignedTo: '' });
              loadTasks();
            }}
            className="filter-btn filter-clear"
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <div className="tasks-loading">
            <div className="tasks-loading-spinner"></div>
          </div>
        ) : (
          <div className="tasks-board">
            {['todo', 'in_progress', 'completed'].map((column) => (
              <div key={column} className="tasks-column">
                <div className="column-header">
                  <h3 className="column-title">
                    {column.replace('_', ' ')} 
                    <span>({grouped[column].length})</span>
                  </h3>
                </div>
                <div className="tasks-list">
                  {grouped[column].length > 0 ? (
                    grouped[column].map((task) => (
                      <div key={task.id} className="task-card">
                        <div className="task-header">
                          <h4 className="task-title">{task.title}</h4>
                          <span className={`task-priority priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="task-description">{task.description}</p>
                        
                        {task.assignedTo && (
                          <div className="task-meta">
                            <div className="task-assignee">
                              <span>👤</span>
                              <span>{task.assignedTo.fullName}</span>
                            </div>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="task-meta">
                            <div className="task-due-date">
                              <span>📅</span>
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        <div className="task-actions">
                          {column !== 'todo' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'todo')}
                              className="status-btn status-todo"
                            >
                              Mark Todo
                            </button>
                          )}
                          {column !== 'in_progress' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              className="status-btn status-in-progress"
                            >
                              Mark In Progress
                            </button>
                          )}
                          {column !== 'completed' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="status-btn status-completed"
                            >
                              Mark Complete
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="status-btn delete-task-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-column">
                      No tasks in this column
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {taskModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create New Task</h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="task-form">
              <div className="form-group">
                <label className="form-label">
                  Title <span>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  className="form-input form-textarea"
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Priority
                </label>
                <select
                  className="form-select"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Assigned To (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="User ID (optional)"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                />
                <p className="form-hint">
                  Enter user ID or leave empty for unassigned
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
                <p className="form-hint">
                  ✅ Backend accepts YYYY-MM-DD format (e.g., 2036-12-31)
                </p>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
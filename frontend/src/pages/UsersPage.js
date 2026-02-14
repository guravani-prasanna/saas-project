// frontend/src/pages/UsersPage.js
import React, { useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import AddEditUserModal from '../components/users/AddEditUserModal';
import './UsersPage.css';

const UsersPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    regularUsers: 0
  });

  const loadUsers = async () => {
    if (!user?.tenant?.id && !user?.tenantId) return;
    const tenantId = user.tenant?.id || user.tenantId;
    setLoading(true);
    try {
      const res = await api.get(`/tenants/${tenantId}/users`, {
        params: {
          search: search || undefined,
          role: roleFilter || undefined,
        },
      });
      const usersData = res.data.data.users || [];
      setUsers(usersData);
      
      // Calculate stats
      const statsData = {
        total: usersData.length,
        active: usersData.filter(u => u.isActive).length,
        inactive: usersData.filter(u => !u.isActive).length,
        admins: usersData.filter(u => u.role === 'tenant_admin').length,
        regularUsers: usersData.filter(u => u.role === 'user').length
      };
      setStats(statsData);
      
      // Reset selected users
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'tenant_admin') {
      loadUsers().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch (error) {
      alert('Failed to delete user');
      console.error('Delete error:', error.response?.data);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) return;
    try {
      await Promise.all(selectedUsers.map(id => api.delete(`/users/${id}`)));
      loadUsers();
    } catch (error) {
      alert('Failed to delete users');
      console.error('Bulk delete error:', error.response?.data);
    }
  };

  // CORRECTED: Use PATCH /users/:id instead of /users/:id/status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      console.log(`Updating user ${userId} status to: ${newStatus ? 'active' : 'inactive'}`);
      
      // CORRECT ENDPOINT: PATCH /users/:id
      await api.patch(`/users/${userId}`, { 
        isActive: newStatus 
      });
      
      loadUsers();
    } catch (error) {
      console.error('Toggle status error:', error.response?.data || error.message);
      
      // Try alternative endpoints if PATCH fails
      if (error.response?.status === 404 || error.response?.status === 405) {
        try {
          console.log('Trying PUT endpoint instead...');
          await api.put(`/users/${userId}`, { isActive: !currentStatus });
          loadUsers();
          return;
        } catch (putError) {
          console.error('PUT also failed:', putError.response?.data);
        }
      }
      
      alert(`Failed to update user status: ${error.response?.data?.message || error.message}`);
    }
  };

  // CORRECTED: Bulk status update with correct endpoint
  const handleBulkStatusChange = async (newStatus) => {
    try {
      console.log(`Bulk updating ${selectedUsers.length} users to ${newStatus ? 'active' : 'inactive'}`);
      
      // Update each user individually with PATCH
      await Promise.all(
        selectedUsers.map(id => 
          api.patch(`/users/${id}`, { isActive: newStatus })
        )
      );
      
      loadUsers();
    } catch (error) {
      console.error('Bulk status change error:', error.response?.data);
      alert('Failed to update user status. Please try updating users individually.');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length && users.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    loadUsers();
  };

  // Access Control
  if (user?.role !== 'tenant_admin') {
    return (
      <div className="users-page-container">
        <div className="access-denied">
          <div className="access-denied-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="access-denied-title">Access Denied</h2>
          <p className="access-denied-message">
            You need administrator privileges to access the Users page.
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '??';
    
    return fullName
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to test API endpoints (optional - for debugging)
  const testUserEndpoint = async () => {
    if (users.length > 0) {
      const testUserId = users[0].id;
      console.log('Testing API endpoints for user:', testUserId);
      
      try {
        // Test PATCH
        const patchRes = await api.patch(`/users/${testUserId}`, { 
          isActive: !users[0].isActive 
        });
        console.log('✅ PATCH /users/:id works:', patchRes.data);
        
        // Revert the change
        await api.patch(`/users/${testUserId}`, { 
          isActive: users[0].isActive 
        });
        
        loadUsers();
      } catch (error) {
        console.log('❌ PATCH failed:', error.response?.status, error.response?.data);
      }
    }
  };

  return (
    <div className="users-page-container">
      {/* Debug button (optional - remove in production) */}
      {users.length > 0 && process.env.NODE_ENV === 'development' && (
        <button 
          onClick={testUserEndpoint}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '5px 10px',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 100
          }}
        >
          Test API
        </button>
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <button 
          type="button" 
          onClick={() => setModalUser({})}
          className="add-user-btn"
        >
          Add New User
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-item active">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-item inactive">
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactive Users</div>
        </div>
        <div className="stat-item admins">
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Administrators</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">Regular User</option>
            <option value="tenant_admin">Administrator</option>
          </select>
          <button 
            type="button" 
            onClick={loadUsers}
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

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <input
            type="checkbox"
            className="bulk-checkbox"
            checked={selectedUsers.length === users.length && users.length > 0}
            onChange={handleSelectAll}
          />
          <span className="bulk-selected">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          </span>
          <div className="bulk-buttons">
            <button 
              type="button" 
              onClick={() => handleBulkStatusChange(true)}
              className="bulk-btn bulk-activate"
            >
              Activate
            </button>
            <button 
              type="button" 
              onClick={() => handleBulkStatusChange(false)}
              className="bulk-btn bulk-deactivate"
            >
              Deactivate
            </button>
            <button 
              type="button" 
              onClick={handleBulkDelete}
              className="bulk-btn bulk-delete"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <h3 className="empty-title">No Users Found</h3>
          <p className="empty-description">
            {search || roleFilter 
              ? "Try changing your search or filter criteria."
              : "Get started by adding your first team member."}
          </p>
          <div className="empty-actions">
            <button 
              type="button" 
              onClick={() => setModalUser({})}
              className="add-user-btn"
            >
              Add First User
            </button>
          </div>
        </div>
      ) : (
        /* Users Table */
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    className="bulk-checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="bulk-checkbox"
                      checked={selectedUsers.includes(userItem.id)}
                      onChange={() => handleSelectUser(userItem.id)}
                    />
                  </td>
                  <td>
                    <div className="user-avatar">
                      <div className="avatar-circle">
                        {getInitials(userItem.fullName)}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{userItem.fullName}</span>
                        <span className="user-email">{userItem.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${userItem.role}`}>
                      {userItem.role === 'tenant_admin' ? 'Administrator' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${userItem.isActive ? 'active' : 'inactive'}`}>
                      {userItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {new Date(userItem.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        type="button" 
                        onClick={() => setModalUser(userItem)}
                        className="action-btn edit-btn"
                      >
                        <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleToggleUserStatus(userItem.id, userItem.isActive)}
                        className="action-btn"
                        style={{
                          background: userItem.isActive ? '#fef3c7' : '#d1fae5',
                          color: userItem.isActive ? '#92400e' : '#065f46'
                        }}
                      >
                        <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                          {userItem.isActive ? (
                            <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          ) : (
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          )}
                        </svg>
                        {userItem.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(userItem.id)}
                        className="action-btn delete-btn"
                      >
                        <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {users.length} of {stats.total} users
            </div>
            {/* Add pagination controls here if needed */}
          </div>
        </div>
      )}

      {/* User Modal */}
      {modalUser !== null && (
        <AddEditUserModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onSaved={() => {
            setModalUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;
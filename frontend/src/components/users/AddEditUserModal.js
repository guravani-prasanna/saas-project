// frontend/src/components/users/AddEditUserModal.js
import React, { useContext, useState } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AddEditUserModal = ({ user, onClose, onSaved }) => {
  const isEdit = !!user.id;
  const [email, setEmail] = useState(user.email || '');
  const [fullName, setFullName] = useState(user.fullName || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user.role || 'user');
  const [isActive, setIsActive] = useState(
    user.isActive !== undefined ? user.isActive : true,
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim()) {
      setError('Full name and email are required');
      return;
    }
    setSaving(true);
    try {
      const tenantId = currentUser.tenant?.id || currentUser.tenantId;
      if (isEdit) {
        const payload = {
          fullName,
          role,
          isActive,
        };
        if (password) {
          payload.password = password; // if you support password change
        }
        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post(`/tenants/${tenantId}/users`, {
          email,
          password,
          fullName,
          role,
        });
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving user';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{isEdit ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              disabled={isEdit}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Full Name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label>
            Password {isEdit ? '(leave blank to keep existing)' : ''}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>Active</span>
          </label>
          {error && <div className="error-msg">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditUserModal;

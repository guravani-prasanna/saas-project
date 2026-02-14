// frontend/src/components/tasks/CreateTaskModal.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './CreateTaskModal.css';
const CreateTaskModal = ({ projectId, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const meRes = await api.get('/auth/me');
        const tenantId = meRes.data.data.tenant.id;
        const res = await api.get(`/tenants/${tenantId}/users`);
        setUsers(res.data.data.users || []);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    try {
      // Prepare task data - DO NOT include assignedTo if empty
      const taskData = {
        title,
        description,
        priority,
      };
      
      // Only include assignedTo if it has a value
      if (assignedTo && assignedTo.trim() !== '') {
        taskData.assignedTo = assignedTo;
      }
      
      // ✅ CORRECTED: Send date in YYYY-MM-DD format (backend accepts this)
      if (dueDate && dueDate.trim() !== '') {
        // The date input already provides YYYY-MM-DD format
        taskData.dueDate = dueDate; // Backend accepts "2036-12-31"
      }
      
      console.log('Creating task with data:', taskData);
      
      await api.post(`/projects/${projectId}/tasks`, taskData);
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating task';
      setError(msg);
      console.error('Task creation error:', err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: YYYY-MM-DD (e.g., 2036-12-31)
              </p>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';  // Changed from AuthContext
import './Navbar.css';
const Navbar = () => {
  const { user, logout, isTenantAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/projects" className="hover:text-gray-300">Projects</Link>
          {(isTenantAdmin || isSuperAdmin) && (
            <Link to="/users" className="hover:text-gray-300">Users</Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>{user?.fullName} ({user?.role})</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
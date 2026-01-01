import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsRes = await api.get('/projects?limit=5');
      const projects = projectsRes.data.data.projects || [];
      setRecentProjects(projects);
      setStats(prev => ({...prev, totalProjects: projectsRes.data.data.total || 0}));

      // Fetch tasks assigned to current user
      // Option 1: If you have an endpoint for user's tasks
      try {
        const tasksRes = await api.get('/tasks/my-tasks'); // Adjust endpoint as needed
        const userTasks = tasksRes.data.data.tasks || tasksRes.data.data || [];
        setMyTasks(userTasks.slice(0, 5));
        
        // Calculate task statistics
        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(task => 
          task.status === 'completed' || task.status === 'done'
        ).length;
        const pendingTasks = totalTasks - completedTasks;
        
        setStats(prev => ({
          ...prev,
          totalTasks,
          completedTasks,
          pendingTasks
        }));
      } catch (taskError) {
        console.log('No user tasks endpoint, trying alternative approach...');
        // Option 2: Fetch all tasks and filter by assignee
        await fetchTasksForUser(projects);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alternative method if no user tasks endpoint exists
  const fetchTasksForUser = async (projects) => {
    try {
      let allUserTasks = [];
      
      // Fetch tasks from each project
      for (const project of projects) {
        try {
          const tasksRes = await api.get(`/projects/${project.id}/tasks`);
          const projectTasks = tasksRes.data.data.tasks || tasksRes.data.data || [];
          
          // Filter tasks assigned to current user
          const userProjectTasks = projectTasks.filter(task => 
            task.assigneeId === user.id || 
            task.assignee?.id === user.id ||
            task.assignedTo === user.id
          );
          
          allUserTasks = [...allUserTasks, ...userProjectTasks];
        } catch (projectError) {
          console.warn(`Could not fetch tasks for project ${project.id}:`, projectError);
        }
      }
      
      // For tenant admin, show all tasks if no assigned tasks found
      if (allUserTasks.length === 0 && user?.role === 'tenant_admin') {
        // Fetch some recent tasks instead
        for (const project of projects.slice(0, 3)) {
          try {
            const tasksRes = await api.get(`/projects/${project.id}/tasks?limit=3`);
            const projectTasks = tasksRes.data.data.tasks || tasksRes.data.data || [];
            allUserTasks = [...allUserTasks, ...projectTasks];
          } catch (error) {
            continue;
          }
        }
      }
      
      setMyTasks(allUserTasks.slice(0, 5));
      
      // Calculate statistics
      const totalTasks = allUserTasks.length;
      const completedTasks = allUserTasks.filter(task => 
        task.status === 'completed' || task.status === 'done'
      ).length;
      const pendingTasks = totalTasks - completedTasks;
      
      setStats(prev => ({
        ...prev,
        totalTasks,
        completedTasks,
        pendingTasks
      }));
      
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      // Set mock data as fallback
      setMyTasks([
        { id: 1, title: 'Setup project structure', description: 'Initialize project files', priority: 'high', status: 'pending' },
        { id: 2, title: 'Design database schema', description: 'Create ER diagram', priority: 'medium', status: 'in-progress' },
        { id: 3, title: 'Implement authentication', description: 'Setup JWT tokens', priority: 'high', status: 'completed' }
      ]);
    }
  };

  // Handle empty states
  const renderMyTasks = () => {
    if (myTasks.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No tasks assigned to you</p>
          {user?.role === 'tenant_admin' && (
            <p className="text-sm text-gray-400">
              As a tenant admin, you can assign tasks to yourself from the Projects page.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {myTasks.map(task => (
          <div key={task.id} className="border-b pb-4 last:border-b-0">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-gray-600 text-sm">{task.description || 'No description'}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
              <span className={`px-2 py-1 rounded ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority || 'normal'}
              </span>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status || 'pending'}
                </span>
                {task.projectName && (
                  <span className="text-gray-400">Project: {task.projectName}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRecentProjects = () => {
    if (recentProjects.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No projects yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentProjects.map(project => (
          <div key={project.id} className="border-b pb-4 last:border-b-0">
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-gray-600 text-sm">{project.description || 'No description'}</p>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Tasks: {project.taskCount || 0}</span>
              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || user?.email || 'User'}!
            {user?.role === 'tenant_admin' && ' (Admin)'}
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Tasks</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-600">Completed</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completedTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <a href="/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </a>
            </div>
            {renderRecentProjects()}
          </div>

          {/* My Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {user?.role === 'tenant_admin' ? 'Recent Tasks' : 'My Tasks'}
              </h2>
              <a href="/tasks" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </a>
            </div>
            {renderMyTasks()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
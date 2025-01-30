import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Settings,
  Shield,
  Mail,
  Building2,
  UserPlus,
  Key,
  Lock,
  Unlock,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Clock,
  RefreshCw,
  FileText,
  Cog,
  Database,
  Bell,
  FileBox,
  Save,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserForm } from './UserForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'head' | 'manager' | 'normal' | 'view';
  department?: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

interface SystemLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string;
  lastUpdated: string;
  updatedBy: string;
}

export function SystemAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'logs' | 'settings'>('users');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);

  // Load data from storage
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    const storedLogs = localStorage.getItem('systemLogs');
    const storedRoles = localStorage.getItem('roles');
    const storedSettings = localStorage.getItem('systemSettings');

    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedLogs) setSystemLogs(JSON.parse(storedLogs));
    if (storedRoles) setRoles(JSON.parse(storedRoles));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
  }, []);

  // Save data to storage when updated
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('systemLogs', JSON.stringify(systemLogs));
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('systemSettings', JSON.stringify(settings));
  }, [users, systemLogs, roles, settings]);

  // Add log entry
  const addLogEntry = (entry: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...entry,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Handle user actions
  const handleNewUser = (userData: any) => {
    const newUser = {
      ...userData,
      id: `U-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: user?.name
    };

    setUsers(prev => [newUser, ...prev]);
    addLogEntry({
      type: 'success',
      action: 'User Created',
      user: user?.name || 'System',
      details: `New user ${newUser.name} (${newUser.email}) was created`
    });
    setShowForm(false);
  };

  const handleEditUser = (userData: any) => {
    setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
    addLogEntry({
      type: 'info',
      action: 'User Updated',
      user: user?.name || 'System',
      details: `User ${userData.name} was updated`
    });
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      addLogEntry({
        type: 'warning',
        action: 'User Deleted',
        user: user?.name || 'System',
        details: `User ${selectedUser.name} was deleted`
      });
      setSelectedUser(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'inactive' : 'active';
        addLogEntry({
          type: 'info',
          action: 'User Status Changed',
          user: user?.name || 'System',
          details: `User ${u.name} status changed to ${newStatus}`
        });
        return {
          ...u,
          status: newStatus
        };
      }
      return u;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'locked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'head': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    if (selectedRole !== 'all' && user.role !== selectedRole) return false;
    if (selectedDepartment !== 'all' && user.department !== selectedDepartment) return false;
    if (selectedStatus !== 'all' && user.status !== selectedStatus) return false;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.department?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Render functions for different tabs
  const renderLogs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
        <button
          onClick={() => {
            setSystemLogs([]);
            addLogEntry({
              type: 'info',
              action: 'Logs Cleared',
              user: user?.name || 'System',
              details: 'System logs were cleared'
            });
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RotateCw className="h-4 w-4" />
          Clear Logs
        </button>
      </div>
      {systemLogs.map(log => (
        <div
          key={log.id}
          className={`p-4 rounded-lg ${
            log.type === 'error' ? 'bg-red-50' :
            log.type === 'warning' ? 'bg-yellow-50' :
            log.type === 'success' ? 'bg-green-50' :
            'bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {log.type === 'error' ? <XCircle className="h-5 w-5 text-red-600" /> :
               log.type === 'warning' ? <AlertCircle className="h-5 w-5 text-yellow-600" /> :
               log.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
               <Activity className="h-5 w-5 text-blue-600" />}
              <span className="font-medium">{log.action}</span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">{log.details}</p>
          <p className="text-sm text-gray-500 mt-1">By: {log.user}</p>
        </div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                defaultValue="IT Management System"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Language
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Policy
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Strong</option>
                <option>Medium</option>
                <option>Basic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                defaultValue="30"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="2fa" className="rounded border-gray-300" />
              <label htmlFor="2fa" className="text-sm text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Server
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email From
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="noreply@example.com"
              />
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retention Period (days)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                defaultValue="30"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoBackup" className="rounded border-gray-300" />
              <label htmlFor="autoBackup" className="text-sm text-gray-700">
                Enable Automatic Backups
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
          <Save className="h-5 w-5" />
          Save Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
            <p className="text-gray-600">Manage users, roles, and system settings</p>
          </div>
          {activeTab === 'users' && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
            >
              <UserPlus className="h-5 w-5" />
              Add User
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
              activeTab === 'roles'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
              activeTab === 'logs'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="head">Head</option>
                  <option value="manager">Manager</option>
                  <option value="normal">Normal</option>
                  <option value="view">View Only</option>
                </select>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      {user.department && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Building2 className="h-4 w-4" />
                          <span>{user.department}</span>
                        </div>
                      )}
                      {user.lastLogin && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Last login: {new Date(user.lastLogin).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`p-2 rounded-lg ${
                        user.status === 'active'
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.status === 'active' ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Unlock className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit User"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete User"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'roles' && (
          <div>Roles & Permissions content</div>
        )}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* User Form */}
      {(showForm || selectedUser) && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowForm(false);
            setSelectedUser(null);
          }}
          onSubmit={selectedUser ? handleEditUser : handleNewUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the user "{selectedUser.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600"
              >
                <Trash2 className="h-5 w-5" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
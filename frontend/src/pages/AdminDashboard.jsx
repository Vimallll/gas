import { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [configs, setConfigs] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'verification_officer',
  });

  useEffect(() => {
    fetchDashboard();
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/admin/config');
      setConfigs(response.data);
    } catch (err) {
      console.error('Failed to fetch configs', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/create', newUser);
      alert('User created successfully');
      setShowCreateUserForm(false);
      setNewUser({ name: '', email: '', password: '', role: 'verification_officer' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put('/admin/users/status', {
        action: 'update_status',
        userId,
        isActive: !currentStatus,
      });
      alert('User status updated');
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const updateConfig = async (key, value) => {
    try {
      await api.put('/admin/config', { key, value });
      alert('Configuration updated');
      fetchConfigs();
    } catch (err) {
      alert('Failed to update configuration');
    }
  };

  const triggerAudit = async () => {
    try {
      const response = await api.post('/admin/audit/trigger', {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      alert(`Audit triggered: ${response.data.selectedCount} applications selected`);
      fetchDashboard();
    } catch (err) {
      alert('Failed to trigger audit');
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get('/admin/reports/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export report');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Gas Subsidy Program Management</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={activeTab === 'config' ? 'active' : ''}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Applications</h3>
              <p className="stat-number">{stats.stats.totalApplications}</p>
            </div>
            <div className="stat-card approved">
              <h3>Approved</h3>
              <p className="stat-number">{stats.stats.approved}</p>
              <p className="stat-percent">{stats.stats.approvalRate}%</p>
            </div>
            <div className="stat-card rejected">
              <h3>Rejected</h3>
              <p className="stat-number">{stats.stats.rejected}</p>
              <p className="stat-percent">{stats.stats.rejectionRate}%</p>
            </div>
            <div className="stat-card pending">
              <h3>Pending</h3>
              <p className="stat-number">{stats.stats.pending}</p>
            </div>
            <div className="stat-card fraud">
              <h3>Fraud Cases</h3>
              <p className="stat-number">{stats.stats.fraud}</p>
            </div>
            <div className="stat-card audit">
              <h3>Audit Queue</h3>
              <p className="stat-number">{stats.stats.auditQueue}</p>
            </div>
          </div>

          <div className="actions-section">
            <button onClick={triggerAudit} className="btn-primary">
              Trigger Monthly Audit
            </button>
            <button onClick={exportReport} className="btn-secondary">
              Export Report (Excel)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <div className="users-header">
            <h2>User Management</h2>
            <button
              onClick={() => setShowCreateUserForm(!showCreateUserForm)}
              className="btn-primary"
            >
              {showCreateUserForm ? 'Cancel' : '+ Create User'}
            </button>
          </div>

          {showCreateUserForm && (
            <div className="create-user-form">
              <h3>Create New User</h3>
              <form onSubmit={createUser}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    disabled // Only one option available now
                  >
                    <option value="verification_officer">Verification Officer</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary">Create User</button>
              </form>
            </div>
          )}

          <div className="users-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className="btn-small"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="config-content">
          <div className="config-card">
            <h3>Income Limit (Annual)</h3>
            <input
              type="number"
              value={configs.incomeLimit || ''}
              onChange={(e) => updateConfig('incomeLimit', parseFloat(e.target.value))}
              placeholder="Enter income limit"
            />
          </div>

          <div className="config-card">
            <h3>Eligibility Threshold</h3>
            <input
              type="number"
              value={configs.eligibilityThreshold || ''}
              onChange={(e) => updateConfig('eligibilityThreshold', parseFloat(e.target.value))}
              placeholder="Minimum score for auto-approval"
            />
          </div>

          <div className="config-card">
            <h3>Borderline Threshold</h3>
            <input
              type="number"
              value={configs.borderlineThreshold || ''}
              onChange={(e) => updateConfig('borderlineThreshold', parseFloat(e.target.value))}
              placeholder="Score for manual review"
            />
          </div>

          <div className="config-card">
            <h3>Audit Sampling Rate</h3>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={configs.auditSamplingRate || ''}
              onChange={(e) => updateConfig('auditSamplingRate', parseFloat(e.target.value))}
              placeholder="0.1 for 10%"
            />
          </div>

          <div className="config-card">
            <h3>Subsidy Amount (per cylinder)</h3>
            <input
              type="number"
              value={configs.subsidyAmount || ''}
              onChange={(e) => updateConfig('subsidyAmount', parseFloat(e.target.value))}
              placeholder="Subsidy in INR"
            />
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="reports-content">
          <button onClick={exportReport} className="btn-primary">
            Export All Applications (Excel)
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;




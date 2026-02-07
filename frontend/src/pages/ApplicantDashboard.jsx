import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ApplicationForm from '../components/ApplicationForm';
import ApplicationStatus from '../components/ApplicationStatus';
import './Dashboard.css';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await api.get('/applications/my-application');
      setApplication(response.data);
      setShowForm(response.data?.status === 'draft');
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch application', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmitted = () => {
    fetchApplication();
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <p>Gas Subsidy Eligibility Application</p>
      </div>

      {!application && !showForm && (
        <div className="dashboard-card">
          <p>You haven't created an application yet.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create New Application
          </button>
        </div>
      )}

      {showForm && (
        <ApplicationForm
          application={application}
          onSubmitted={handleApplicationSubmitted}
          onCancel={() => setShowForm(false)}
        />
      )}

      {application && !showForm && (
        <ApplicationStatus application={application} />
      )}
    </div>
  );
};

export default ApplicantDashboard;




import { useState, useEffect } from 'react';
import api from '../services/api';
import './VerificationDashboard.css';

const VerificationDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/verification/pending');
      setApplications(response.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!action || !remarks) {
      alert('Please select action and provide remarks');
      return;
    }

    try {
      await api.post(`/verification/${selectedApp._id}/review`, {
        action,
        remarks,
        isFraud: action === 'flag_fraud',
        fraudReason: action === 'flag_fraud' ? remarks : undefined,
      });
      alert('Application reviewed successfully');
      setSelectedApp(null);
      setAction('');
      setRemarks('');
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to review application');
    }
  };

  const viewApplication = async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      setSelectedApp(response.data);
    } catch (err) {
      console.error('Failed to fetch application', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="verification-dashboard">
      <div className="dashboard-header">
        <h1>Verification Dashboard</h1>
        <p>Review and verify applications</p>
      </div>

      <div className="dashboard-layout">
        <div className="applications-list">
          <h2>Pending Verifications ({applications.length})</h2>
          {applications.length === 0 ? (
            <p>No pending applications</p>
          ) : (
            <div className="app-list">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className={`app-item ${selectedApp?._id === app._id ? 'selected' : ''}`}
                  onClick={() => viewApplication(app._id)}
                >
                  <div>
                    <strong>{app.personalDetails?.name}</strong>
                    <div className="app-meta">
                      Score: {app.eligibilityScore || 'N/A'} | Status: {app.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedApp && (
          <div className="application-detail">
            <h2>Application Details</h2>
            <div className="detail-section">
              <h3>Personal Details</h3>
              <p><strong>Name:</strong> {selectedApp.personalDetails?.name}</p>
              <p><strong>Aadhaar:</strong> {selectedApp.personalDetails?.aadhaarNumber}</p>
              <p><strong>PAN:</strong> {selectedApp.personalDetails?.panNumber || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Household Details</h3>
              <p><strong>Family Size:</strong> {selectedApp.householdDetails?.familySize}</p>
              <p><strong>Ration Card:</strong> {selectedApp.householdDetails?.rationCardNumber || 'N/A'}</p>
              <p><strong>Category:</strong> {selectedApp.householdDetails?.rationCardCategory || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Income Details</h3>
              <p><strong>Annual Income:</strong> ₹{selectedApp.incomeDetails?.annualIncome}</p>
              <p><strong>ITR Filed:</strong> {selectedApp.incomeDetails?.itrFiled ? 'Yes' : 'No'}</p>
            </div>

            <div className="detail-section">
              <h3>Uploaded Documents</h3>
              {selectedApp.documents ? (
                <div className="documents-grid">
                  {Object.entries(selectedApp.documents).map(([key, path]) => {
                    if (!path) return null;

                    const getDocumentUrl = (docPath) => {
                      if (docPath.startsWith('http')) return docPath;
                      if (docPath.startsWith('/uploads')) return `https://gas-backend-d91w.onrender.com${docPath}`;
                      return `https://gas-backend-d91w.onrender.com/uploads/${docPath}`;
                    };

                    return (
                      <div key={key} className="document-item">
                        <span className="document-label">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                        <a
                          href={getDocumentUrl(path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-link"
                        >
                          View Document
                        </a>
                      </div>
                    );
                  })}
                  {Object.values(selectedApp.documents).every(v => !v) && <p>No documents uploaded.</p>}
                </div>
              ) : (
                <p>No documents found.</p>
              )}
            </div>

            {selectedApp.eligibilityScore !== undefined && (
              <div className="detail-section">
                <h3>Eligibility Score: {selectedApp.eligibilityScore}</h3>
                {selectedApp.scoringBreakdown && (
                  <div className="score-breakdown">
                    <div>Ration Card: +{selectedApp.scoringBreakdown.rationCardScore}</div>
                    <div>Income: +{selectedApp.scoringBreakdown.incomeScore}</div>
                    <div>Electricity: +{selectedApp.scoringBreakdown.electricityScore}</div>
                    <div>No ITR: +{selectedApp.scoringBreakdown.itrScore}</div>
                    <div>Family Size: +{selectedApp.scoringBreakdown.familySizeScore}</div>
                  </div>
                )}
              </div>
            )}

            <div className="review-section">
              <h3>Review Action</h3>
              <select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="">Select Action</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="flag_fraud">Flag as Fraud</option>
              </select>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks..."
                rows="4"
              />
              <button onClick={handleReview} className="btn-primary">
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationDashboard;




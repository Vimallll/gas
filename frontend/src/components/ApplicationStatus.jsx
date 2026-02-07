import { useState } from 'react';
import api from '../services/api';
import './ApplicationStatus.css';

const ApplicationStatus = ({ application }) => {
  const [certificateUrl, setCertificateUrl] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      draft: '#718096',
      submitted: '#3182ce',
      under_review: '#d69e2e',
      pending_verification: '#d69e2e',
      approved: '#38a169',
      rejected: '#e53e3e',
      audit_flagged: '#d69e2e',
    };
    return colors[status] || '#718096';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      pending_verification: 'Pending Verification',
      approved: 'Approved',
      rejected: 'Rejected',
      audit_flagged: 'Audit Flagged',
    };
    return labels[status] || status;
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await api.get(`/verification/${application._id}/certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${application._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download certificate', err);
    }
  };

  return (
    <div className="application-status">
      <div className="status-header">
        <h2>Application Status</h2>
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(application.status) }}
        >
          {getStatusLabel(application.status)}
        </div>
      </div>

      {application.eligibilityScore !== undefined && (
        <div className="score-section">
          <h3>Eligibility Score: {application.eligibilityScore}</h3>
          {application.scoringBreakdown && (
            <div className="score-breakdown">
              <div>Ration Card: +{application.scoringBreakdown.rationCardScore}</div>
              <div>Income Certificate: +{application.scoringBreakdown.incomeScore}</div>
              <div>Electricity Bill: +{application.scoringBreakdown.electricityScore}</div>
              <div>No ITR: +{application.scoringBreakdown.itrScore}</div>
              <div>Family Size: +{application.scoringBreakdown.familySizeScore}</div>
            </div>
          )}
        </div>
      )}

      {application.status === 'approved' && (
        <div className="approved-section">
          <p className="success-message">✓ Your application has been approved!</p>
          {application.certificateNumber && (
            <div>
              <p>Certificate Number: <strong>{application.certificateNumber}</strong></p>
              <button onClick={handleDownloadCertificate} className="btn-primary">
                Download Certificate
              </button>
            </div>
          )}
        </div>
      )}

      {application.status === 'rejected' && application.rejectionReason && (
        <div className="rejected-section">
          <p className="error-message">✗ Application Rejected</p>
          <p><strong>Reason:</strong> {application.rejectionReason}</p>
        </div>
      )}

      <div className="application-details">
        <h3>Application Details</h3>
        <div className="details-grid">
          <div>
            <strong>Name:</strong> {application.personalDetails?.name}
          </div>
          <div>
            <strong>Aadhaar:</strong> {application.personalDetails?.aadhaarNumber}
          </div>
          <div>
            <strong>Family Size:</strong> {application.householdDetails?.familySize}
          </div>
          <div>
            <strong>Annual Income:</strong> ₹{application.incomeDetails?.annualIncome}
          </div>
          <div>
            <strong>Submitted:</strong> {new Date(application.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;




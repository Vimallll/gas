import { useState, useEffect } from 'react';
import api from '../services/api';
import './ApplicationForm.css';

const ApplicationForm = ({ application, onSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    personalDetails: {
      name: '',
      fatherName: '',
      dateOfBirth: '',
      gender: '',
      aadhaarNumber: '',
      panNumber: '',
    },
    householdDetails: {
      familySize: '',
      rationCardNumber: '',
      rationCardCategory: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
    },
    incomeDetails: {
      annualIncome: '',
      incomeCertificateAmount: '',
      itrFiled: false,
      selfDeclared: false,
    },
    consentAccepted: false,
  });

  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (application) {
      setFormData({
        personalDetails: application.personalDetails || formData.personalDetails,
        householdDetails: application.householdDetails || formData.householdDetails,
        incomeDetails: application.incomeDetails || formData.incomeDetails,
        consentAccepted: application.digitalConsent?.accepted || false,
      });
    }
  }, [application]);

  const handleChange = (section, field, value) => {
    if (section === 'address') {
      setFormData((prev) => ({
        ...prev,
        householdDetails: {
          ...prev.householdDetails,
          address: {
            ...prev.householdDetails.address,
            [field]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  const handleFileChange = (field, e) => {
    setFiles((prev) => ({
      ...prev,
      [field]: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('personalDetails', JSON.stringify(formData.personalDetails));
      formDataToSend.append('householdDetails', JSON.stringify(formData.householdDetails));
      formDataToSend.append('incomeDetails', JSON.stringify(formData.incomeDetails));
      formDataToSend.append('consentAccepted', formData.consentAccepted);

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      let applicationId;
      if (application?._id && application.status === 'draft') {
        // Update existing draft
        const updateResponse = await api.put(`/applications/${application._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        applicationId = updateResponse.data.application._id;
      } else {
        // Create new
        const createResponse = await api.post('/applications', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        applicationId = createResponse.data.application._id;
      }

      // Submit application
      await api.post(`/applications/${applicationId}/submit`);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-form-container">
      <form onSubmit={handleSubmit} className="application-form">
        <h2>Application Form</h2>

        {/* Personal Details */}
        <section className="form-section">
          <h3>Personal Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.personalDetails.name}
                onChange={(e) => handleChange('personalDetails', 'name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Father's Name</label>
              <input
                type="text"
                value={formData.personalDetails.fatherName}
                onChange={(e) => handleChange('personalDetails', 'fatherName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.personalDetails.dateOfBirth}
                onChange={(e) => handleChange('personalDetails', 'dateOfBirth', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.personalDetails.gender}
                onChange={(e) => handleChange('personalDetails', 'gender', e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Aadhaar Number *</label>
              <input
                type="text"
                value={formData.personalDetails.aadhaarNumber}
                onChange={(e) => handleChange('personalDetails', 'aadhaarNumber', e.target.value)}
                maxLength="12"
                required
              />
            </div>
            <div className="form-group">
              <label>PAN Number (Optional)</label>
              <input
                type="text"
                value={formData.personalDetails.panNumber}
                onChange={(e) => handleChange('personalDetails', 'panNumber', e.target.value)}
                maxLength="10"
              />
            </div>
          </div>
        </section>

        {/* Household Details */}
        <section className="form-section">
          <h3>Household Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Family Size *</label>
              <input
                type="number"
                value={formData.householdDetails.familySize}
                onChange={(e) => handleChange('householdDetails', 'familySize', e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Ration Card Number</label>
              <input
                type="text"
                value={formData.householdDetails.rationCardNumber}
                onChange={(e) => handleChange('householdDetails', 'rationCardNumber', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Ration Card Category</label>
              <select
                value={formData.householdDetails.rationCardCategory}
                onChange={(e) => handleChange('householdDetails', 'rationCardCategory', e.target.value)}
              >
                <option value="">Select</option>
                <option value="AAY">AAY</option>
                <option value="BPL">BPL</option>
                <option value="APL">APL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Street Address</label>
              <input
                type="text"
                value={formData.householdDetails.address.street}
                onChange={(e) => handleChange('address', 'street', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.householdDetails.address.city}
                onChange={(e) => handleChange('address', 'city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.householdDetails.address.state}
                onChange={(e) => handleChange('address', 'state', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                value={formData.householdDetails.address.pincode}
                onChange={(e) => handleChange('address', 'pincode', e.target.value)}
                maxLength="6"
              />
            </div>
          </div>
        </section>

        {/* Income Details */}
        <section className="form-section">
          <h3>Income Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Annual Income (INR) *</label>
              <input
                type="number"
                value={formData.incomeDetails.annualIncome}
                onChange={(e) => handleChange('incomeDetails', 'annualIncome', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Income Certificate Amount (INR)</label>
              <input
                type="number"
                value={formData.incomeDetails.incomeCertificateAmount}
                onChange={(e) => handleChange('incomeDetails', 'incomeCertificateAmount', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.incomeDetails.itrFiled}
                  onChange={(e) => handleChange('incomeDetails', 'itrFiled', e.target.checked)}
                />
                ITR Filed
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.incomeDetails.selfDeclared}
                  onChange={(e) => handleChange('incomeDetails', 'selfDeclared', e.target.checked)}
                />
                Self Declared Income
              </label>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="form-section">
          <h3>Documents Upload</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Aadhaar Card *</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('aadhaar', e)} />
            </div>
            <div className="form-group">
              <label>Ration Card</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('rationCard', e)} />
            </div>
            <div className="form-group">
              <label>Income Certificate</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('incomeCertificate', e)} />
            </div>
            <div className="form-group">
              <label>Electricity Bill</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('electricityBill', e)} />
            </div>
            <div className="form-group">
              <label>PAN Card (Optional)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('pan', e)} />
            </div>
            <div className="form-group">
              <label>Address Proof</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('addressProof', e)} />
            </div>
          </div>
        </section>

        {/* Consent */}
        <section className="form-section">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.consentAccepted}
                onChange={(e) => setFormData((prev) => ({ ...prev, consentAccepted: e.target.checked }))}
                required
              />
              I hereby give my consent for digital verification of my eligibility for the gas subsidy program. *
            </label>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/auth/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // Redirect to login after signup
            // login(response.data.user, response.data.token); // Removed auto-login
            navigate('/login', {
                state: { message: 'Account created successfully! Please login.' }
            });
        } catch (err) {
            console.error('Signup error:', err);
            // Log full error object for debugging
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Error status:', err.response.status);
            }

            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.details ||
                err.message ||
                'Failed to signup. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Gas Subsidy Eligibility Portal</h1>
                    <p>Government Gas Supply Program</p>
                    <p className="signup-subtitle">Create New Account</p>
                </div>

                <form onSubmit={handleSignup} className="login-form">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Login here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;

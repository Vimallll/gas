import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/dashboard">Gas Subsidy Portal</Link>
        </div>
        <div className="nav-links">
          {user?.role === 'admin' && (
            <Link to="/admin">Admin Dashboard</Link>
          )}
          {user?.role === 'verification_officer' && (
            <Link to="/verification">Verification</Link>
          )}
          {user?.role === 'applicant' && (
            <Link to="/dashboard">My Application</Link>
          )}
          <span className="user-info">{user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;




// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={handleLogoClick}>
        SENTRY
      </div>
      
      <div className="navbar-links">
        <Link to="/global-view" className="navbar-link">
          Global View
        </Link>
        <Link to="/dashboard" className="navbar-link">
          Dashboard
        </Link>
        <Link to="/analytics" className="navbar-link">
          Analytics
        </Link>
        <Link to="/about" className="navbar-link">
          About
        </Link>
        <button 
          className="navbar-logout"
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
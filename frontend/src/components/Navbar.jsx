import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/dashboard';
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        🏥 CarePoint
      </Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        {user ? (
          <>
            <Link to={getDashboardLink()} style={styles.link}>Dashboard</Link>
            <span style={styles.userBadge}>{user.name} ({user.role})</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    transition: 'all 0.2s',
  },
  userBadge: {
    background: 'rgba(102,126,234,0.3)',
    border: '1px solid rgba(102,126,234,0.5)',
    color: '#a78bfa',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  logoutBtn: {
    background: 'rgba(245,87,108,0.2)',
    border: '1px solid rgba(245,87,108,0.4)',
    color: '#fca5a5',
    padding: '7px 18px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  registerBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
};

export default Navbar;

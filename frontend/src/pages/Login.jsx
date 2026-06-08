import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', formData);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>🔐</div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="Enter your email"
              style={styles.input} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="Enter your password"
              style={styles.input} required />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}><span>or</span></div>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.linkText}>Create one here</Link>
        </p>

        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo Credentials</p>
          <p style={styles.demoText}>Admin: admin@gmail.com / 123456</p>
          <p style={styles.demoText}>Patient: patient@gmail.com / 123456</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: 'calc(100vh - 60px)', padding: '40px 20px',
  },
  card: {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '24px',
    padding: '44px 40px',
    width: '100%',
    maxWidth: '420px',
  },
  iconWrap: { fontSize: '40px', textAlign: 'center', marginBottom: '12px' },
  title: { textAlign: 'center', color: 'white', fontSize: '26px', fontWeight: '600', marginBottom: '6px' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.55)', marginBottom: '28px', fontSize: '14px' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' },
  input: {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none',
    borderRadius: '12px', fontSize: '16px',
    fontWeight: '500', cursor: 'pointer',
    marginTop: '8px', transition: 'all 0.2s',
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
  },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px' },
  linkText: { color: '#a78bfa', textDecoration: 'none', fontWeight: '500' },
  demoBox: {
    marginTop: '20px',
    background: 'rgba(102,126,234,0.1)',
    border: '1px solid rgba(102,126,234,0.3)',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  demoTitle: { color: '#a78bfa', fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
  demoText: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '3px' },
};

export default Login;

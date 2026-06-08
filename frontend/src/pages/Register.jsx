import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient',
    phone: '', specialization: '', experience: '', fees: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', formData);
      login(data);
      toast.success('Account created! Welcome 🎉');
      if (data.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>📝</div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join our medical platform today</p>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'Email address' },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
            { label: 'Phone', name: 'phone', type: 'text', placeholder: 'Phone number' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} style={styles.formGroup}>
              <label style={styles.label}>{label}</label>
              <input type={type} name={name} value={formData[name]}
                onChange={handleChange} placeholder={placeholder}
                style={styles.input} required={name !== 'phone'} />
            </div>
          ))}

          <div style={styles.formGroup}>
            <label style={styles.label}>I am registering as</label>
            <select name="role" value={formData.role} onChange={handleChange} style={styles.select}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {formData.role === 'doctor' && (
            <div style={styles.doctorSection}>
              <p style={styles.doctorSectionTitle}>Doctor Details</p>
              {[
                { label: 'Specialization', name: 'specialization', type: 'text', placeholder: 'e.g. Cardiologist' },
                { label: 'Experience (years)', name: 'experience', type: 'number', placeholder: 'e.g. 5' },
                { label: 'Consultation Fee ($)', name: 'fees', type: 'number', placeholder: 'e.g. 50' },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name} style={styles.formGroup}>
                  <label style={styles.label}>{label}</label>
                  <input type={type} name={name} value={formData[name]}
                    onChange={handleChange} placeholder={placeholder}
                    style={styles.input} required />
                </div>
              ))}
            </div>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.linkText}>Login here</Link>
        </p>
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
    maxWidth: '460px',
  },
  iconWrap: { fontSize: '40px', textAlign: 'center', marginBottom: '12px' },
  title: { textAlign: 'center', color: 'white', fontSize: '26px', fontWeight: '600', marginBottom: '6px' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.55)', marginBottom: '28px', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '7px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' },
  input: {
    width: '100%', padding: '11px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px', color: 'white',
    fontSize: '14px', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '11px 16px',
    background: 'rgba(30,27,75,0.8)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px', color: 'white',
    fontSize: '14px', boxSizing: 'border-box',
  },
  doctorSection: {
    background: 'rgba(102,126,234,0.1)',
    border: '1px solid rgba(102,126,234,0.3)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '16px',
  },
  doctorSectionTitle: { color: '#a78bfa', fontSize: '13px', fontWeight: '500', marginBottom: '14px' },
  button: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none',
    borderRadius: '12px', fontSize: '16px',
    fontWeight: '500', cursor: 'pointer',
    marginTop: '4px', transition: 'all 0.2s',
  },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '20px' },
  linkText: { color: '#a78bfa', textDecoration: 'none', fontWeight: '500' },
};

export default Register;

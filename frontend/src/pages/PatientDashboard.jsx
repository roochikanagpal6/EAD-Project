import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:   { bg:'rgba(250,207,76,0.15)', color:'#fcd34d', border:'rgba(250,207,76,0.3)' },
  confirmed: { bg:'rgba(52,211,153,0.15)', color:'#6ee7b7', border:'rgba(52,211,153,0.3)' },
  cancelled: { bg:'rgba(248,113,113,0.15)', color:'#fca5a5', border:'rgba(248,113,113,0.3)' },
  completed: { bg:'rgba(96,165,250,0.15)', color:'#93c5fd', border:'rgba(96,165,250,0.3)' },
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get('/appointments/my');
      setAppointments(data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/appointments/cancel/${id}`);
      toast.success('Cancelled');
      fetchAppointments();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Appointments</h2>
          <p style={styles.subtitle}>Welcome back, {user?.name} 👋</p>
        </div>
        <button onClick={() => navigate('/')} style={styles.newBtn}>+ Book New</button>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : appointments.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{fontSize:'48px', marginBottom:'12px'}}>📋</div>
          <p style={{color:'rgba(255,255,255,0.6)', marginBottom:'16px'}}>No appointments yet</p>
          <button onClick={() => navigate('/')} style={styles.newBtn}>Find a Doctor</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {appointments.map((apt) => {
            const sc = statusConfig[apt.status] || statusConfig.pending;
            return (
              <div key={apt._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.docName}>Dr. {apt.doctorId?.name}</h3>
                  <span style={{...styles.badge, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`}}>
                    {apt.status}
                  </span>
                </div>
                <p style={styles.spec}>{apt.doctorId?.specialization}</p>
                <div style={styles.infoRow}>📅 {apt.date} &nbsp; ⏰ {apt.time}</div>
                <div style={styles.infoRow}>💰 Fee: ${apt.doctorId?.fees}</div>
                <span style={{
                  ...styles.payBadge,
                  background: apt.paymentStatus==='paid' ? 'rgba(52,211,153,0.15)' : 'rgba(250,207,76,0.15)',
                  color: apt.paymentStatus==='paid' ? '#6ee7b7' : '#fcd34d',
                  border: `1px solid ${apt.paymentStatus==='paid' ? 'rgba(52,211,153,0.3)' : 'rgba(250,207,76,0.3)'}`,
                }}>
                  {apt.paymentStatus==='paid' ? '✅ Paid' : '⏳ Unpaid'}
                </span>
                {apt.notes && <p style={styles.notes}>📝 {apt.notes}</p>}
                <div style={styles.actions}>
                  {apt.paymentStatus==='unpaid' && apt.status!=='cancelled' && (
                    <button onClick={() => navigate(`/payment/${apt._id}`)} style={styles.payBtn}>Pay Now</button>
                  )}
                  {apt.status!=='cancelled' && apt.status!=='completed' && (
                    <button onClick={() => handleCancel(apt._id)} style={styles.cancelBtn}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding:'32px', maxWidth:'1100px', margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px', flexWrap:'wrap', gap:'12px' },
  title: { fontSize:'26px', color:'white', margin:0 },
  subtitle: { color:'rgba(255,255,255,0.55)', margin:'4px 0 0', fontSize:'14px' },
  newBtn: {
    padding:'10px 22px',
    background:'linear-gradient(135deg,#667eea,#764ba2)',
    color:'white', border:'none', borderRadius:'12px',
    cursor:'pointer', fontWeight:'500', fontSize:'14px',
  },
  empty: { textAlign:'center', color:'rgba(255,255,255,0.5)', padding:'60px', fontSize:'17px' },
  emptyCard: {
    textAlign:'center', padding:'60px',
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'20px',
  },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' },
  card: {
    background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', padding:'22px',
  },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' },
  docName: { color:'white', fontSize:'16px', margin:0 },
  badge: { padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  spec: { color:'#a78bfa', fontSize:'13px', margin:'4px 0 12px' },
  infoRow: { color:'rgba(255,255,255,0.65)', fontSize:'13px', marginBottom:'6px' },
  payBadge: { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', margin:'8px 0' },
  notes: { color:'rgba(255,255,255,0.4)', fontSize:'12px', fontStyle:'italic', margin:'8px 0' },
  actions: { display:'flex', gap:'8px', marginTop:'14px' },
  payBtn: { flex:1, padding:'9px', background:'linear-gradient(135deg,#43e97b,#38f9d7)', color:'#064e3b', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'500', fontSize:'13px' },
  cancelBtn: { flex:1, padding:'9px', background:'rgba(248,113,113,0.15)', color:'#fca5a5', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'10px', cursor:'pointer', fontSize:'13px' },
};

export default PatientDashboard;

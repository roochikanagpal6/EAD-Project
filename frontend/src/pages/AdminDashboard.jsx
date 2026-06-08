import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, d, u, a] = await Promise.all([
        API.get('/admin/stats'), API.get('/admin/doctors'),
        API.get('/admin/users'), API.get('/admin/appointments')
      ]);
      setStats(s.data); setDoctors(d.data); setUsers(u.data); setAppointments(a.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const approveDoctor = async (id, approve) => {
    try {
      await API.put(`/admin/doctor/approve/${id}`, { isApproved: approve });
      toast.success(approve ? 'Doctor approved ✅' : 'Doctor rejected');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await API.delete(`/admin/user/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div style={styles.loading}>Loading admin panel...</div>;

  const statCards = [
    { label:'Total Patients', value:stats.totalUsers, grad:'linear-gradient(135deg,#667eea,#764ba2)' },
    { label:'Approved Doctors', value:stats.totalDoctors, grad:'linear-gradient(135deg,#43e97b,#38f9d7)' },
    { label:'Pending Approvals', value:stats.pendingDoctors, grad:'linear-gradient(135deg,#f7971e,#ffd200)' },
    { label:'Total Appointments', value:stats.totalAppointments, grad:'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { label:'Completed', value:stats.completedAppointments, grad:'linear-gradient(135deg,#f093fb,#f5576c)' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛡️ Admin Dashboard</h2>
      <div style={styles.tabs}>
        {['stats','doctors','users','appointments'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{...styles.tab, ...(activeTab===tab ? styles.tabActive : {})}}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div style={styles.statsGrid}>
          {statCards.map(({ label, value, grad }) => (
            <div key={label} style={styles.statCard}>
              <div style={{...styles.statIcon, background:grad}}></div>
              <div style={{...styles.statNum, background:grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>{value ?? 0}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'doctors' && (
        <div>
          <h3 style={styles.tabTitle}>Manage Doctors ({doctors.length})</h3>
          <div style={styles.list}>
            {doctors.map(doc => (
              <div key={doc._id} style={styles.rowCard}>
                <div>
                  <span style={styles.rowName}>Dr. {doc.name}</span>
                  <span style={styles.rowMeta}> — {doc.specialization} · {doc.experience}yrs · ${doc.fees}</span>
                </div>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <span style={{...styles.badge, background:doc.isApproved?'rgba(52,211,153,0.15)':'rgba(250,207,76,0.15)', color:doc.isApproved?'#6ee7b7':'#fcd34d'}}>
                    {doc.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                  {!doc.isApproved && <button onClick={() => approveDoctor(doc._id, true)} style={styles.approveBtn}>Approve</button>}
                  {doc.isApproved && <button onClick={() => approveDoctor(doc._id, false)} style={styles.revokeBtn}>Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3 style={styles.tabTitle}>All Users ({users.length})</h3>
          <div style={styles.list}>
            {users.map(u => (
              <div key={u._id} style={styles.rowCard}>
                <div>
                  <span style={styles.rowName}>{u.name}</span>
                  <span style={styles.rowMeta}> ({u.role}) — {u.email}</span>
                </div>
                {u.role !== 'admin' && <button onClick={() => deleteUser(u._id)} style={styles.deleteBtn}>Delete</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div>
          <h3 style={styles.tabTitle}>All Appointments ({appointments.length})</h3>
          <div style={styles.list}>
            {appointments.map(apt => (
              <div key={apt._id} style={styles.rowCard}>
                <div>
                  <span style={styles.rowName}>{apt.patientId?.name}</span>
                  <span style={styles.rowMeta}> → Dr. {apt.doctorId?.name} · {apt.date} at {apt.time}</span>
                </div>
                <div style={{display:'flex', gap:'6px'}}>
                  <span style={{...styles.badge, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)'}}>{apt.status}</span>
                  <span style={{...styles.badge, background:apt.paymentStatus==='paid'?'rgba(52,211,153,0.15)':'rgba(250,207,76,0.15)', color:apt.paymentStatus==='paid'?'#6ee7b7':'#fcd34d'}}>{apt.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding:'32px', maxWidth:'1100px', margin:'0 auto' },
  loading: { textAlign:'center', padding:'60px', color:'white', fontSize:'18px' },
  title: { fontSize:'26px', color:'white', marginBottom:'24px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap' },
  tab: { padding:'10px 22px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'12px', cursor:'pointer', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:'14px' },
  tabActive: { background:'linear-gradient(135deg,#667eea,#764ba2)', border:'1px solid transparent', color:'white' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'16px' },
  statCard: {
    background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px',
    padding:'24px', textAlign:'center',
  },
  statIcon: { width:'40px', height:'4px', borderRadius:'2px', margin:'0 auto 14px' },
  statNum: { fontSize:'42px', fontWeight:'600', marginBottom:'6px' },
  statLabel: { color:'rgba(255,255,255,0.55)', fontSize:'13px' },
  tabTitle: { color:'white', marginBottom:'16px', fontSize:'17px' },
  list: { display:'flex', flexDirection:'column', gap:'10px' },
  rowCard: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px',
    padding:'14px 20px', flexWrap:'wrap', gap:'10px',
  },
  rowName: { color:'white', fontWeight:'500', fontSize:'14px' },
  rowMeta: { color:'rgba(255,255,255,0.5)', fontSize:'13px' },
  badge: { padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  approveBtn: { padding:'6px 14px', background:'rgba(52,211,153,0.2)', color:'#6ee7b7', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  revokeBtn: { padding:'6px 14px', background:'rgba(250,207,76,0.15)', color:'#fcd34d', border:'1px solid rgba(250,207,76,0.3)', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  deleteBtn: { padding:'6px 14px', background:'rgba(248,113,113,0.15)', color:'#fca5a5', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
};

export default AdminDashboard;

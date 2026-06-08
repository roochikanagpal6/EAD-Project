import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [editForm, setEditForm] = useState({ about:'', specialization:'', experience:'', fees:'', slots:'', availableDays:'' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aptRes, profileRes] = await Promise.all([
        API.get('/appointments/doctor'),
        API.get('/doctors/me/profile')
      ]);
      setAppointments(aptRes.data);
      setProfile(profileRes.data);
      setEditForm({
        about: profileRes.data.about || '',
        specialization: profileRes.data.specialization || '',
        experience: profileRes.data.experience || '',
        fees: profileRes.data.fees || '',
        slots: (profileRes.data.slots||[]).join(', '),
        availableDays: (profileRes.data.availableDays||[]).join(', '),
      });
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/status/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch { toast.error('Update failed'); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/doctors/me/profile', {
        ...editForm,
        slots: editForm.slots.split(',').map(s=>s.trim()).filter(Boolean),
        availableDays: editForm.availableDays.split(',').map(s=>s.trim()).filter(Boolean),
      });
      toast.success('Profile updated!');
      fetchData();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Doctor Dashboard</h2>
          <p style={styles.subtitle}>Dr. {user?.name} 👨‍⚕️</p>
        </div>
        {!profile?.isApproved && (
          <div style={styles.pendingBanner}>⏳ Pending admin approval</div>
        )}
      </div>

      <div style={styles.tabs}>
        {['appointments','profile'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{...styles.tab, ...(activeTab===tab ? styles.tabActive : {})}}>
            {tab === 'appointments' ? '📅 Appointments' : '👤 My Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'appointments' && (
        <div>
          <p style={{color:'rgba(255,255,255,0.6)', marginBottom:'16px', fontSize:'14px'}}>
            Total: {appointments.length} appointment(s)
          </p>
          {appointments.length === 0 ? (
            <div style={styles.emptyCard}><p style={{color:'rgba(255,255,255,0.5)'}}>No appointments yet</p></div>
          ) : (
            <div style={styles.aptList}>
              {appointments.map(apt => (
                <div key={apt._id} style={styles.aptCard}>
                  <div style={styles.aptInfo}>
                    <span style={styles.patientName}>{apt.patientId?.name}</span>
                    <span style={styles.aptMeta}>{apt.date} · {apt.time}</span>
                    {apt.notes && <span style={styles.aptNotes}>{apt.notes}</span>}
                  </div>
                  <div style={styles.aptRight}>
                    <span style={{
                      ...styles.statusDot,
                      background: apt.status==='confirmed'?'rgba(52,211,153,0.2)':apt.status==='completed'?'rgba(96,165,250,0.2)':apt.status==='cancelled'?'rgba(248,113,113,0.2)':'rgba(250,207,76,0.2)',
                      color: apt.status==='confirmed'?'#6ee7b7':apt.status==='completed'?'#93c5fd':apt.status==='cancelled'?'#fca5a5':'#fcd34d',
                    }}>{apt.status}</span>
                    <span style={{...styles.statusDot, background: apt.paymentStatus==='paid'?'rgba(52,211,153,0.15)':'rgba(250,207,76,0.15)', color:apt.paymentStatus==='paid'?'#6ee7b7':'#fcd34d'}}>
                      {apt.paymentStatus}
                    </span>
                    <div style={styles.aptActions}>
                      {apt.status==='pending' && <button onClick={()=>updateStatus(apt._id,'confirmed')} style={styles.confirmBtn}>Confirm</button>}
                      {apt.status==='confirmed' && <button onClick={()=>updateStatus(apt._id,'completed')} style={styles.completeBtn}>Complete</button>}
                      {apt.status!=='cancelled'&&apt.status!=='completed' && <button onClick={()=>updateStatus(apt._id,'cancelled')} style={styles.cancelBtn}>Cancel</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={styles.profileCard}>
          <h3 style={{color:'white', marginBottom:'20px', fontSize:'17px'}}>Edit Profile</h3>
          <form onSubmit={saveProfile}>
            {[['Specialization','specialization','text'],['Experience (years)','experience','number'],['Fee ($)','fees','number']].map(([label,name,type])=>(
              <div key={name} style={styles.formGroup}>
                <label style={styles.label}>{label}</label>
                <input type={type} value={editForm[name]} onChange={e=>setEditForm({...editForm,[name]:e.target.value})} style={styles.input} />
              </div>
            ))}
            <div style={styles.formGroup}>
              <label style={styles.label}>About</label>
              <textarea value={editForm.about} rows={3} onChange={e=>setEditForm({...editForm,about:e.target.value})} style={{...styles.input,resize:'vertical'}} placeholder="Short bio..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Time Slots (comma separated)</label>
              <input value={editForm.slots} onChange={e=>setEditForm({...editForm,slots:e.target.value})} style={styles.input} placeholder="9:00 AM, 10:00 AM, 3:00 PM" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Available Days (comma separated)</label>
              <input value={editForm.availableDays} onChange={e=>setEditForm({...editForm,availableDays:e.target.value})} style={styles.input} placeholder="Monday, Tuesday, Wednesday" />
            </div>
            <button type="submit" style={styles.saveBtn}>Save Changes</button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding:'32px', maxWidth:'1100px', margin:'0 auto' },
  loading: { textAlign:'center', padding:'60px', color:'white', fontSize:'18px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' },
  title: { fontSize:'26px', color:'white', margin:0 },
  subtitle: { color:'rgba(255,255,255,0.55)', margin:'4px 0 0', fontSize:'14px' },
  pendingBanner: { background:'rgba(250,207,76,0.15)', border:'1px solid rgba(250,207,76,0.3)', color:'#fcd34d', padding:'10px 16px', borderRadius:'12px', fontSize:'13px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'24px' },
  tab: { padding:'10px 22px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'12px', cursor:'pointer', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:'14px' },
  tabActive: { background:'linear-gradient(135deg,#667eea,#764ba2)', border:'1px solid transparent', color:'white' },
  emptyCard: { textAlign:'center', padding:'40px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px' },
  aptList: { display:'flex', flexDirection:'column', gap:'10px' },
  aptCard: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px',
    padding:'16px 20px', flexWrap:'wrap', gap:'12px',
  },
  aptInfo: { display:'flex', flexDirection:'column', gap:'4px' },
  patientName: { color:'white', fontWeight:'500', fontSize:'15px' },
  aptMeta: { color:'rgba(255,255,255,0.55)', fontSize:'13px' },
  aptNotes: { color:'rgba(255,255,255,0.4)', fontSize:'12px', fontStyle:'italic' },
  aptRight: { display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' },
  statusDot: { padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
  aptActions: { display:'flex', gap:'6px' },
  confirmBtn: { padding:'6px 12px', background:'rgba(52,211,153,0.2)', color:'#6ee7b7', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'8px', cursor:'pointer', fontSize:'12px' },
  completeBtn: { padding:'6px 12px', background:'rgba(96,165,250,0.2)', color:'#93c5fd', border:'1px solid rgba(96,165,250,0.3)', borderRadius:'8px', cursor:'pointer', fontSize:'12px' },
  cancelBtn: { padding:'6px 12px', background:'rgba(248,113,113,0.15)', color:'#fca5a5', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', cursor:'pointer', fontSize:'12px' },
  profileCard: { background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', padding:'28px', maxWidth:'560px' },
  formGroup: { marginBottom:'16px' },
  label: { display:'block', marginBottom:'7px', color:'rgba(255,255,255,0.8)', fontSize:'14px', fontWeight:'500' },
  input: { width:'100%', padding:'11px 16px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'12px', color:'white', fontSize:'14px', boxSizing:'border-box' },
  saveBtn: { padding:'12px 28px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'500', fontSize:'15px' },
};

export default DoctorDashboard;

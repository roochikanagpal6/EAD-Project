import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await API.get(`/doctors/${doctorId}`);
        setDoctor(data);
      } catch {
        toast.error('Doctor not found');
        navigate('/');
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) { toast.error('Select date and time'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/appointments/book', { doctorId, ...formData });
      toast.success('Appointment booked! 🎉');
      navigate(`/payment/${data.appointment._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📅 Book Appointment</h2>
        <div style={styles.doctorBanner}>
          <div style={styles.avatar}>{doctor.name.charAt(0)}</div>
          <div>
            <h3 style={styles.docName}>Dr. {doctor.name}</h3>
            <span style={styles.specBadge}>{doctor.specialization}</span>
            <p style={styles.fee}>Fee: <b style={{color:'#a78bfa'}}>${doctor.fees}</b></p>
          </div>
        </div>
        <div style={styles.divider}/>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Date</label>
            <input type="date" value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={styles.input} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Time Slot</label>
            {doctor.slots?.length > 0 ? (
              <div style={styles.slotsGrid}>
                {doctor.slots.map((slot) => (
                  <button key={slot} type="button"
                    onClick={() => setFormData({ ...formData, time: slot })}
                    style={{ ...styles.slotBtn, ...(formData.time === slot ? styles.slotActive : {}) }}>
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <input type="time" value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                style={styles.input} required />
            )}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Notes (optional)</label>
            <textarea value={formData.notes} rows={3}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Describe your symptoms..."
              style={{...styles.input, resize:'vertical'}} />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Booking...' : 'Confirm & Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display:'flex', justifyContent:'center', padding:'40px 20px', minHeight:'calc(100vh - 60px)' },
  loading: { textAlign:'center', padding:'60px', color:'white', fontSize:'18px' },
  card: {
    background:'rgba(255,255,255,0.08)', backdropFilter:'blur(30px)',
    border:'1px solid rgba(255,255,255,0.15)', borderRadius:'24px',
    padding:'40px', maxWidth:'500px', width:'100%',
  },
  title: { color:'white', textAlign:'center', marginBottom:'24px', fontSize:'22px' },
  doctorBanner: {
    display:'flex', gap:'16px', alignItems:'center',
    background:'rgba(102,126,234,0.15)', border:'1px solid rgba(102,126,234,0.3)',
    borderRadius:'16px', padding:'16px', marginBottom:'20px',
  },
  avatar: {
    width:'56px', height:'56px', borderRadius:'50%',
    background:'linear-gradient(135deg,#667eea,#764ba2)',
    color:'white', fontSize:'22px', fontWeight:'600',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  docName: { color:'white', fontSize:'17px', margin:'0 0 6px' },
  specBadge: {
    background:'rgba(167,139,250,0.2)', color:'#a78bfa',
    border:'1px solid rgba(167,139,250,0.4)',
    padding:'3px 10px', borderRadius:'20px', fontSize:'12px',
  },
  fee: { color:'rgba(255,255,255,0.6)', fontSize:'13px', marginTop:'6px' },
  divider: { borderTop:'1px solid rgba(255,255,255,0.1)', margin:'20px 0' },
  formGroup: { marginBottom:'18px' },
  label: { display:'block', marginBottom:'8px', color:'rgba(255,255,255,0.8)', fontSize:'14px', fontWeight:'500' },
  input: {
    width:'100%', padding:'11px 16px',
    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)',
    borderRadius:'12px', color:'white', fontSize:'14px', boxSizing:'border-box',
  },
  slotsGrid: { display:'flex', flexWrap:'wrap', gap:'8px' },
  slotBtn: {
    padding:'8px 14px', borderRadius:'10px',
    border:'1px solid rgba(255,255,255,0.2)',
    background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)',
    cursor:'pointer', fontSize:'13px', transition:'all 0.2s',
  },
  slotActive: {
    background:'linear-gradient(135deg,#667eea,#764ba2)',
    border:'1px solid transparent', color:'white',
  },
  button: {
    width:'100%', padding:'13px',
    background:'linear-gradient(135deg,#667eea,#764ba2)',
    color:'white', border:'none', borderRadius:'12px',
    fontSize:'15px', fontWeight:'500', cursor:'pointer', transition:'all 0.2s',
  },
};

export default BookAppointment;

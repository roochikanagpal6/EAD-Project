import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const gradients = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #ff9a9e, #fecfef)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #fd746c, #ff9068)',
  'linear-gradient(135deg, #56ab2f, #a8e063)',
  'linear-gradient(135deg, #373b44, #4286f4)',
  'linear-gradient(135deg, #ee9ca7, #ffdde1)',
  'linear-gradient(135deg, #2980b9, #6dd5fa)',
  'linear-gradient(135deg, #f7971e, #ffd200)',
];

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await API.get('/doctors');
        setDoctors(data);
        setFiltered(data);
      } catch {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const results = doctors.filter(doc =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, doctors]);

  const handleBook = (doctorId) => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (user.role !== 'patient') { toast.error('Only patients can book'); return; }
    navigate(`/book/${doctorId}`);
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>🏥 Trusted Medical Platform</div>
        <h1 style={styles.heroTitle}>Find &amp; Book Your Doctor</h1>
        <p style={styles.heroSub}>Connect with top specialists and book appointments instantly</p>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.stats}>
          <div style={styles.statItem}><b style={{fontSize:'22px'}}>{doctors.length}+</b><span>Doctors</span></div>
          <div style={styles.statDivider}/>
          <div style={styles.statItem}><b style={{fontSize:'22px'}}>15+</b><span>Specializations</span></div>
          <div style={styles.statDivider}/>
          <div style={styles.statItem}><b style={{fontSize:'22px'}}>24/7</b><span>Available</span></div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Specialists ({filtered.length})</h2>
        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner}/>
            <p style={{color:'rgba(255,255,255,0.6)', marginTop:'12px'}}>Loading doctors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>No doctors found matching your search</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map((doctor, index) => (
              <div key={doctor._id} style={styles.card}>
                <div style={{...styles.cardTop, background: gradients[index % gradients.length]}}>
                  <div style={styles.avatar}>{doctor.name.charAt(0).toUpperCase()}</div>
                  <div style={styles.cardTopInfo}>
                    <h3 style={styles.docName}>Dr. {doctor.name}</h3>
                    <span style={styles.specBadge}>{doctor.specialization}</span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>⭐</span>
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>💰</span>
                    <span>Consultation Fee: <b style={{color:'#a78bfa'}}>${doctor.fees}</b></span>
                  </div>
                  {doctor.rating > 0 && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>🌟</span>
                      <span>Rating: <b style={{color:'#fcd34d'}}>{Number(doctor.rating).toFixed(1)}/5</b> ({doctor.totalReviews} reviews)</span>
                    </div>
                  )}
                  {doctor.about && (
                    <p style={styles.about}>{doctor.about}</p>
                  )}
                  <button
                    onClick={() => handleBook(doctor._id)}
                    style={{...styles.bookBtn, background: gradients[index % gradients.length]}}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    textAlign: 'center',
    padding: '60px 20px 50px',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(102,126,234,0.2)',
    border: '1px solid rgba(102,126,234,0.4)',
    color: '#a78bfa',
    padding: '6px 18px',
    borderRadius: '20px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  heroTitle: { fontSize: '42px', fontWeight: '600', color: 'white', marginBottom: '10px' },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: '17px', marginBottom: '30px' },
  searchWrap: {
    maxWidth: '520px',
    margin: '0 auto 32px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px 14px 50px',
    borderRadius: '30px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    fontSize: '15px',
    boxSizing: 'border-box',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '32px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px 40px',
    maxWidth: '420px',
    margin: '0 auto',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    color: 'white',
    fontSize: '13px',
  },
  statDivider: { width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' },
  section: { padding: '40px 32px' },
  sectionTitle: { color: 'white', fontSize: '22px', fontWeight: '500', marginBottom: '24px' },
  loadingWrap: { textAlign: 'center', padding: '60px' },
  spinner: {
    width: '40px', height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '17px', padding: '40px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTop: {
    padding: '24px 20px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  avatar: {
    width: '56px', height: '56px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '600',
    color: 'white',
    flexShrink: 0,
  },
  cardTopInfo: { flex: 1 },
  docName: { color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '6px' },
  specBadge: {
    background: 'rgba(255,255,255,0.25)',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  cardBody: { padding: '16px 20px 20px' },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
    marginBottom: '8px',
  },
  infoIcon: { fontSize: '14px' },
  about: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    fontStyle: 'italic',
    margin: '10px 0 14px',
    lineHeight: '1.5',
  },
  bookBtn: {
    width: '100%',
    padding: '11px',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'all 0.2s',
  },
};

export default Home;

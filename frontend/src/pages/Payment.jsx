import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../api/axios';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ appointmentId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { data } = await API.post('/payment/create-payment-intent', { appointmentId });
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (error) { toast.error(error.message); return; }
      await API.post('/payment/confirm', { appointmentId, paymentIntentId: paymentIntent.id });
      toast.success('Payment successful! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.cardElement}>
        <CardElement options={{ style: { base: { fontSize:'16px', color:'#fff', '::placeholder':{ color:'rgba(255,255,255,0.4)' }, iconColor:'#a78bfa' } } }} />
      </div>
      <p style={styles.hint}>💡 Test: 4242 4242 4242 4242 · Any expiry · Any CVC</p>
      <button type="submit" disabled={!stripe||loading} style={styles.payBtn}>
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/appointments/my');
        const apt = data.find(a => a._id === appointmentId);
        if (!apt) { toast.error('Not found'); navigate('/dashboard'); return; }
        if (apt.paymentStatus === 'paid') { toast('Already paid!', {icon:'✅'}); navigate('/dashboard'); return; }
        setAppointment(apt);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [appointmentId]);

  if (loading) return <div style={styles.loading}>Loading payment...</div>;
  if (!appointment) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>💳</div>
        <h2 style={styles.title}>Secure Payment</h2>
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Doctor</span>
            <span style={styles.summaryValue}>Dr. {appointment.doctorId?.name}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Date</span>
            <span style={styles.summaryValue}>{appointment.date}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Time</span>
            <span style={styles.summaryValue}>{appointment.time}</span>
          </div>
          <div style={{...styles.summaryRow, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'12px', marginTop:'4px'}}>
            <span style={{...styles.summaryLabel, color:'white', fontWeight:'500'}}>Total</span>
            <span style={{...styles.summaryValue, color:'#a78bfa', fontSize:'20px', fontWeight:'600'}}>${appointment.doctorId?.fees}</span>
          </div>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm appointmentId={appointmentId} amount={appointment.doctorId?.fees} />
        </Elements>
        <button onClick={() => navigate('/dashboard')} style={styles.skipBtn}>Pay Later</button>
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
    padding:'40px', maxWidth:'460px', width:'100%',
  },
  iconWrap: { fontSize:'40px', textAlign:'center', marginBottom:'12px' },
  title: { color:'white', textAlign:'center', marginBottom:'24px', fontSize:'22px' },
  summary: {
    background:'rgba(102,126,234,0.1)', border:'1px solid rgba(102,126,234,0.25)',
    borderRadius:'16px', padding:'20px', marginBottom:'24px',
  },
  summaryRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' },
  summaryLabel: { color:'rgba(255,255,255,0.55)', fontSize:'14px' },
  summaryValue: { color:'white', fontSize:'14px', fontWeight:'500' },
  cardElement: {
    padding:'14px 16px',
    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)',
    borderRadius:'12px', marginBottom:'10px',
  },
  hint: { color:'rgba(255,255,255,0.4)', fontSize:'12px', marginBottom:'16px' },
  payBtn: {
    width:'100%', padding:'13px',
    background:'linear-gradient(135deg,#43e97b,#38f9d7)',
    color:'#064e3b', border:'none', borderRadius:'12px',
    fontSize:'16px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s',
  },
  skipBtn: {
    width:'100%', padding:'10px',
    background:'transparent', color:'rgba(255,255,255,0.4)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px',
    cursor:'pointer', marginTop:'10px', fontSize:'14px',
  },
};

export default Payment;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PawPrint, Mail, Lock, User, ShieldCheck,
  ArrowRight, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';



/* ─── Floating animated particles ─── */
const FloatingParticles = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[...Array(12)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: `${Math.random() * 4 + 2}px`,
        height: `${Math.random() * 4 + 2}px`,
        background: i % 3 === 0 ? 'var(--brand-400)' : i % 3 === 1 ? 'var(--accent-400)' : 'var(--purple-400)',
        borderRadius: '50%',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.1,
        animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 4}s`,
      }} />
    ))}
  </div>
);

/* ─── Animated logo orb ─── */
const LogoOrb = () => (
  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
    {/* Outer ring */}
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      border: '1px solid rgba(34,197,94,0.3)',
      animation: 'spin-slow 8s linear infinite',
    }}>
      <div style={{
        position: 'absolute', top: '-4px', left: '50%',
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'var(--brand-400)', transform: 'translateX(-50%)',
        boxShadow: '0 0 12px var(--brand-glow-hard)',
      }} />
    </div>
    {/* Inner glow */}
    <div style={{
      position: 'absolute', inset: '8px', borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--brand-600), var(--accent-500))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 30px var(--brand-glow)',
    }}>
      <PawPrint size={28} color="white" />
    </div>
  </div>
);

/* ─── Toast notification ─── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 18px',
      borderRadius: '12px',
      background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
      color: type === 'error' ? '#fca5a5' : 'var(--brand-300)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      animation: 'slide-in-right 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      maxWidth: '380px',
    }}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
};



/* ════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
═══════════════════════════════════════════════════════ */
export default function Auth() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'



  // Classic login fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [showPass, setShowPass] = useState(false);



  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const navigate   = useNavigate();
  const googleBtnRef = useRef(null);

  // ── Check for ?verified=true ──
  const isVerified = new URLSearchParams(window.location.search).get('verified') === 'true';
  useEffect(() => {
    if (isVerified) setToast({ type: 'success', text: '✅ Email verified! You can now sign in.' });
  }, [isVerified]);

  // ── Classic email/password ──
  const handleClassicSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isLogin = tab === 'login';
      const payload = isLogin ? { email, password } : { name, email, password, clinicName, clinicPhone };
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}${endpoint}`, payload);
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setToast({ type: 'success', text: 'Account created! Please check your email to verify.' });
        setTab('login');
      }
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Tab config ── */
  const tabs = [
    { id: 'login',    label: 'Sign In' },
    { id: 'register', label: 'Sign Up' },
  ];

  return (
    <>
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-900)',
        fontFamily: 'Inter, sans-serif',
      }}>

        {/* ══════ LEFT PANEL — Hero ══════ */}
        <div style={{
          flex: '1.1',
          position: 'relative',
          background: 'linear-gradient(135deg, var(--bg-800) 0%, #0a1628 50%, var(--bg-900) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          overflow: 'hidden',
          borderRight: '1px solid var(--border-1)',
        }}>
          <FloatingParticles />

          {/* Glow orbs */}
          <div className="glow-orb" style={{ width: '500px', height: '500px', background: 'var(--brand-500)', top: '-150px', left: '-150px', opacity: 0.08 }} />
          <div className="glow-orb" style={{ width: '350px', height: '350px', background: 'var(--accent-500)', bottom: '-100px', right: '-50px', opacity: 0.06 }} />

          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, animation: 'fadeInUp 0.8s ease forwards' }}>
            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px var(--brand-glow)',
              }}>
                <PawPrint size={22} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>VetSense AI</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>The future of</span><br/>
              <span className="gradient-text">veterinary care</span><br/>
              <span style={{ color: 'var(--text-primary)' }}>is here.</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '420px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              AI-powered diagnostics, smart vaccinations, farm management, and emergency vet locator — all in one platform.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['🐾 AI Diagnostics', '💉 Smart Vaccines', '🏥 Vet Locator', '🌾 Farm Management'].map(f => (
                <span key={f} style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-2)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}>
                  {f}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
              {[['10K+', 'Animals Tracked'], ['500+', 'Vets Registered'], ['99%', 'Uptime']].map(([val, label]) => (
                <div key={label}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: 'var(--brand-400)' }}>{val}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════ RIGHT PANEL — Auth Form ══════ */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Logo orb */}
            <LogoOrb />

            {/* Heading */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {tab === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                {tab === 'login' ? 'Sign in to your VetSense dashboard' : 'Join thousands of vets & pet owners'}
              </p>
            </div>

            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-1)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '1.75rem',
            }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: '9px',
                    background: tab === t.id ? 'var(--surface-3)' : 'transparent',
                    color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: tab === t.id ? 600 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ════ LOGIN TAB ════ */}
            {tab === 'login' && (
              <form onSubmit={handleClassicSubmit}>
                <div className="input-group">
                  <label><Mail size={14}/> Email</label>
                  <input className="input-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <label><Lock size={14}/> Password</label>
                  <input className="input-control" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '38px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }} disabled={loading}>
                  {loading ? <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }}/> : <>Sign In <ArrowRight size={16}/></>}
                </button>
              </form>
            )}

            {/* ════ CREATE CLINIC (REGISTER) TAB ════ */}
            {tab === 'register' && (
              <form onSubmit={handleClassicSubmit}>
                <div className="input-group">
                  <label><User size={14}/> Admin Full Name</label>
                  <input className="input-control" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label><ShieldCheck size={14}/> Clinic / Organization Name</label>
                  <input className="input-control" type="text" placeholder="Happy Paws Vet" value={clinicName} onChange={e => setClinicName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label><ShieldCheck size={14}/> Clinic Phone</label>
                  <input className="input-control" type="text" placeholder="+1 234 567 890" value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} required />
                </div>

                <div className="input-group">
                  <label><Mail size={14}/> Email</label>
                  <input className="input-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <label><Lock size={14}/> Password</label>
                  <input className="input-control" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '38px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }} disabled={loading}>
                  {loading ? <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }}/> : <>Create Clinic Account <ArrowRight size={16}/></>}
                </button>
              </form>
            )}

            {/* Footer */}
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              By continuing, you agree to our{' '}
              <span style={{ color: 'var(--brand-400)', cursor: 'pointer' }}>Terms</span>{' '}and{' '}
              <span style={{ color: 'var(--brand-400)', cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

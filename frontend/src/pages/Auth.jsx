import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import {
  PawPrint, Mail, Lock, User, ShieldCheck,
  ArrowRight, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

/* ─── Google Icon SVG ─── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

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

/* ─── OTP dots display ─── */
const OTPDots = ({ filledCount }) => (
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '0.5rem 0 1.5rem' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        width: '12px', height: '12px', borderRadius: '50%',
        background: i < filledCount ? 'var(--brand-400)' : 'var(--surface-2)',
        border: `1px solid ${i < filledCount ? 'var(--brand-400)' : 'var(--border-2)'}`,
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        transform: i < filledCount ? 'scale(1.2)' : 'scale(1)',
        boxShadow: i < filledCount ? '0 0 10px var(--brand-glow-hard)' : 'none',
      }} />
    ))}
  </div>
);

/* ════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
═══════════════════════════════════════════════════════ */
export default function Auth() {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'otp'
  const [otpPhase, setOtpPhase] = useState(false); // within 'otp' tab: false=send, true=verify
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    let timer;
    if (otpPhase && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpPhase, timeLeft]);

  // Classic login fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('Owner');
  const [showPass, setShowPass] = useState(false);

  // OTP fields
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode]   = useState('');
  const [userId, setUserId]     = useState(null);

  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const navigate   = useNavigate();
  const googleBtnRef = useRef(null);

  // ── Check for ?verified=true ──
  const isVerified = new URLSearchParams(window.location.search).get('verified') === 'true';
  useEffect(() => {
    if (isVerified) setToast({ type: 'success', text: '✅ Email verified! You can now sign in.' });
  }, [isVerified]);

  // Google OAuth is now handled via @react-oauth/google component

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/api/auth/google-login`, {
        credential: response.credential,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Google login failed' });
    } finally {
      setLoading(false);
    }
  };

  // ── Classic email/password ──
  const handleClassicSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isLogin = tab === 'login';
      const payload = isLogin ? { email, password } : { name, email, password, role };
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}${endpoint}`, payload);
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setToast({ type: 'success', text: '🎉 Account created! Please sign in.' });
        setTab('login');
      }
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ──
  const handleSendOTP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/api/auth/send-otp`, { email: otpEmail });
      setUserId(data.userId);
      setOtpPhase(true);
      setTimeLeft(300);
      setResendCooldown(30);
      setToast({ type: 'success', text: '📧 OTP sent! Check your inbox.' });
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/api/auth/verify-otp`, { userId, otpCode });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Invalid or expired OTP' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Tab config ── */
  const tabs = [
    { id: 'login',    label: 'Sign In' },
    { id: 'register', label: 'Sign Up' },
    { id: 'otp',      label: 'OTP Login' },
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
                {tab === 'otp' && otpPhase ? 'Enter Your OTP' :
                 tab === 'otp' ? 'OTP Login' :
                 tab === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                {tab === 'otp' && otpPhase ? 'Check your email for the 6-digit code' :
                 tab === 'otp' ? 'Sign in securely with a one-time password' :
                 tab === 'login' ? 'Sign in to your VetSense dashboard' : 'Join thousands of vets & pet owners'}
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
                  onClick={() => { setTab(t.id); setOtpPhase(false); }}
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

            {/* ── Google OAuth Button ── */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleCallback}
                onError={() => setToast({ type: 'error', text: 'Google Login Failed' })}
                useOneTap
              />
            </div>

            {/* OR Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-1)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-1)' }} />
            </div>

            {/* ════ OTP TAB ════ */}
            {tab === 'otp' && !otpPhase && (
              <form onSubmit={handleSendOTP}>
                <div className="input-group">
                  <label><Mail size={14}/> Email Address</label>
                  <input
                    className="input-control"
                    type="email"
                    placeholder="you@example.com"
                    value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }}/> : <><Mail size={16}/> Send OTP</>}
                </button>
              </form>
            )}

            {tab === 'otp' && otpPhase && (
              <form onSubmit={handleVerifyOTP}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Code sent to <strong style={{ color: 'var(--brand-400)' }}>{otpEmail}</strong>
                  </p>
                  <p style={{ color: timeLeft <= 60 ? '#ef4444' : 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>
                    Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <OTPDots filledCount={otpCode.length} />
                <div className="input-group">
                  <label><ShieldCheck size={14}/> 6-Digit OTP</label>
                  <input
                    className="input-control"
                    type="text"
                    maxLength={6}
                    placeholder="······"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.5em', fontWeight: 700 }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '0.5rem' }} disabled={loading || otpCode.length < 6 || timeLeft === 0}>
                  {loading ? <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }}/> : <><ShieldCheck size={16}/> {timeLeft === 0 ? 'OTP Expired' : 'Verify & Sign In'}</>}
                </button>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={handleSendOTP} disabled={resendCooldown > 0 || loading} style={{ flex: 1, padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '8px', color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s' }}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                    <button type="button" onClick={() => { setOtpPhase(false); setOtpCode(''); }} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-2)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s' }}>
                    Change Email
                    </button>
                </div>
              </form>
            )}

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

            {/* ════ REGISTER TAB ════ */}
            {tab === 'register' && (
              <form onSubmit={handleClassicSubmit}>
                <div className="input-group">
                  <label><User size={14}/> Full Name</label>
                  <input className="input-control" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label><ShieldCheck size={14}/> Role</label>
                  <select className="input-control" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="Owner">🐾 Pet / Farm Owner</option>
                    <option value="Vet">👨‍⚕️ Veterinarian</option>
                    <option value="Admin">🔐 Administrator</option>
                  </select>
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
                  {loading ? <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }}/> : <>Create Account <ArrowRight size={16}/></>}
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

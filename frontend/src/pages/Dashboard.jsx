import React, { useState } from 'react';
import { Activity, Bell, Calendar, ShieldAlert, DollarSign, ArrowUpRight, TrendingUp, Clock, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Animated number counter ─── */
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
};

/* ─── Premium stat card ─── */
const StatCard = ({ title, value, suffix='', icon, color, gradient, change, delay=0 }) => (
  <div className="glass-panel card-hover animate-fade-in-up" style={{
    padding: '22px',
    animationDelay: `${delay}s`,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Background gradient glow */}
    <div style={{
      position: 'absolute', top: '-20px', right: '-20px',
      width: '100px', height: '100px', borderRadius: '50%',
      background: color, filter: 'blur(40px)', opacity: 0.12,
    }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 8px 24px ${color}33`,
      }}>
        <span style={{ color: 'white' }}>{icon}</span>
      </div>

      {change !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          padding: '4px 8px', borderRadius: '999px',
          background: change >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${change >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: change >= 0 ? 'var(--brand-400)' : '#fca5a5',
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          <TrendingUp size={12} />
          {change >= 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>

    <div>
      <p style={{ margin: '0 0 4px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
        <AnimatedCounter target={value} suffix={suffix} />
      </p>
    </div>
  </div>
);

/* ─── Activity feed item ─── */
const ActivityItem = ({ text, time, type = 'default' }) => {
  const typeConfig = {
    vaccine: { bg: 'rgba(34,197,94,0.1)',  dot: 'var(--brand-400)',  icon: '💉' },
    consult: { bg: 'rgba(6,182,212,0.1)',   dot: 'var(--accent-400)', icon: '🩺' },
    record:  { bg: 'rgba(168,85,247,0.1)', dot: 'var(--purple-400)', icon: '📋' },
    default: { bg: 'var(--surface-1)',      dot: 'var(--text-muted)', icon: '📌' },
  };
  const cfg = typeConfig[type] || typeConfig.default;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px', borderRadius: '10px',
      background: cfg.bg,
      marginBottom: '8px',
      border: '1px solid var(--border-1)',
      transition: 'all 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{text}</p>
        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11}/> {time}
        </p>
      </div>
    </div>
  );
};

/* ─── Fee row ─── */
const FeeRow = ({ disease, fee, color, bg, icon }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderRadius: '10px',
    background: 'var(--surface-1)',
    border: '1px solid var(--border-1)',
    transition: 'all 0.2s ease',
    cursor: 'default',
  }}
  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--border-1)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{disease}</span>
    </div>
    <span style={{
      fontSize: '0.9rem', fontWeight: 700,
      color: color,
      background: bg,
      padding: '3px 10px', borderRadius: '999px',
      border: `1px solid ${color}33`,
    }}>{fee}</span>
  </div>
);

/* ════════════════════════════════════════════════════
   DASHBOARD MAIN
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    { label: 'Book Appointment', icon: '📅', path: '/doctors',    color: 'var(--brand-500)',   bg: 'rgba(34,197,94,0.08)', roles: ['ADMIN', 'VET', 'STAFF'] },
    { label: 'Add New Animal',   icon: '🐾', path: '/farm',       color: 'var(--accent-500)',  bg: 'rgba(6,182,212,0.08)', roles: ['ADMIN', 'STAFF'] },
    { label: 'AI Symptom Check', icon: '⚡', path: '/ai-checker', color: 'var(--purple-500)',  bg: 'rgba(168,85,247,0.08)', roles: ['ADMIN', 'VET'] },
    { label: 'Team Management',  icon: '👥', path: '/team',       color: '#3b82f6',            bg: 'rgba(59,130,246,0.08)', roles: ['ADMIN'] },
    { label: 'Emergency Vet',    icon: '🚑', path: '/locator',    color: '#ef4444',            bg: 'rgba(239,68,68,0.08)', roles: ['ADMIN', 'VET', 'STAFF'] },
  ].filter(action => action.roles.includes(user.role || 'ADMIN'));

  const fees = [
    { disease: 'Normal Checkup',       fee: '₹300',  color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  icon: '🩺' },
    { disease: 'Skin Disease',         fee: '₹500',  color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  icon: '🔬' },
    { disease: 'Minor Surgery',        fee: '₹800',  color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  icon: '🏥' },
    { disease: 'Fever / Infection',    fee: '₹400',  color: '#f472b6', bg: 'rgba(244,114,182,0.08)', icon: '🌡️' },
    { disease: 'Fracture / Orthopedic',fee: '₹1,200',color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', icon: '🦴' },
    { disease: 'Dental & Eye Care',    fee: '₹600',  color: '#22d3ee', bg: 'rgba(34,211,238,0.08)',  icon: '👁️' },
    { disease: 'Vaccination Visit',    fee: '₹250',  color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', icon: '💉' },
    { disease: 'Emergency / Critical', fee: '₹2,000+',color: '#f87171',bg: 'rgba(248,113,113,0.08)', icon: '🚨' },
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Welcome header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {greeting}
          </p>
          <span style={{ color: 'var(--brand-400)', fontSize: '0.85rem' }}>·</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {greeting}, <span className="gradient-text">{user.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
          Here's what's happening with your animals today.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
            <StatCard title="Total Animals"     value={4}  icon={<Activity size={20}/>}    color="#22c55e" gradient="linear-gradient(135deg,#22c55e,#16a34a)" change={12}  delay={0.0} />
        )}
        {(user.role === 'ADMIN' || user.role === 'VET') && (
            <StatCard title="Upcoming Vaccines" value={2}  icon={<ShieldAlert size={20}/>} color="#f59e0b" gradient="linear-gradient(135deg,#f59e0b,#d97706)" change={0}   delay={0.08}/>
        )}
        <StatCard title="Appointments"      value={1}  icon={<Calendar size={20}/>}    color="#3b82f6" gradient="linear-gradient(135deg,#3b82f6,#2563eb)" change={-5}  delay={0.16}/>
        {user.role === 'ADMIN' && (
            <StatCard title="Active Alerts"     value={0}  icon={<Bell size={20}/>}        color="#ef4444" gradient="linear-gradient(135deg,#ef4444,#dc2626)" change={null} delay={0.24}/>
        )}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Activity Feed */}
          <div className="glass-panel animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--brand-400)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ChevronRight size={14}/>
              </button>
            </div>
            <ActivityItem text="Buddy's Rabies Vaccination completed successfully." time="2 days ago" type="vaccine" />
            <ActivityItem text="Consultation with Dr. Sharma for Luna — skin check." time="1 week ago" type="consult" />
            <ActivityItem text="New milk production record for Cow C-102 added." time="2 weeks ago" type="record" />
          </div>

          {/* Consultation Fee Chart */}
          {(user.role === 'ADMIN' || user.role === 'VET') && (
            <div className="glass-panel animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.25s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(168,85,247,0.3)',
                }}>
                  <DollarSign size={18} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Consultation Fee Chart</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard pricing guide</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {fees.map(f => <FeeRow key={f.disease} {...f} />)}
              </div>
              <p style={{ margin: '14px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={12}/> Fees may vary based on doctor and clinic location.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quick Actions */}
          <div className="glass-panel animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={16} color="var(--brand-400)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Actions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: action.bg,
                    border: `1px solid ${action.bg.replace('0.08', '0.2')}`,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${action.bg}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{action.icon}</span>
                    {action.label}
                  </span>
                  <ArrowUpRight size={14} style={{ color: action.color, opacity: 0.7 }} />
                </button>
              ))}
            </div>
          </div>

          {/* AI Tip Card */}
          {(user.role === 'ADMIN' || user.role === 'VET') && (
            <div className="animate-fade-in-up" style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(168,85,247,0.2)',
              animationDelay: '0.3s',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--purple-500)', filter: 'blur(40px)', opacity: 0.15 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Zap size={16} className="animate-float" style={{ color: 'var(--purple-400)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Tip of the Day</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Seasonal allergies peak in March–May. Schedule dermatology checkups now to reduce emergency visits by <strong style={{ color: 'var(--brand-400)' }}>40%</strong>.
              </p>
              <button
                onClick={() => navigate('/ai-checker')}
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', padding: '7px 14px', color: 'var(--purple-400)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Run AI Check <ArrowUpRight size={13}/>
              </button>
            </div>
          )}

          {/* System status */}
          {user.role === 'ADMIN' && (
            <div className="glass-panel animate-fade-in-up" style={{ padding: '18px', animationDelay: '0.35s' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System Status</h4>
              {[
                { label: 'API Server',    status: 'online' },
                { label: 'AI Engine',     status: 'online' },
                { label: 'Database',      status: 'online' },
                { label: 'Email Service', status: 'warning' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`status-dot ${s.status}`} />
                    <span style={{ fontSize: '0.75rem', color: s.status === 'online' ? 'var(--brand-400)' : 'var(--warning)', fontWeight: 500 }}>
                      {s.status === 'online' ? 'Operational' : 'Degraded'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

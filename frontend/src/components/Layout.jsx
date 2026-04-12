import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, Syringe, MapPin, Tractor,
  Image as ImageIcon, LogOut, HeartPulse, FileText,
  ChevronLeft, ChevronRight, Zap, Users
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const navItems = [
    { path: '/',              icon: <LayoutDashboard size={20}/>, label: 'Dashboard',      badge: null },
    { path: '/consultations', icon: <FileText size={20}/>,        label: 'Consultations',  badge: '3' },
    { path: '/doctors',       icon: <Stethoscope size={20}/>,     label: 'Find a Doctor',  badge: null },
    { path: '/ai-checker',    icon: <Zap size={20}/>,             label: 'AI Symptom Check', badge: 'AI', badgeVariant: 'purple' },
    { path: '/image-scan',    icon: <ImageIcon size={20}/>,       label: 'Image Scan',     badge: null },
    { path: '/vaccinations',  icon: <Syringe size={20}/>,         label: 'Vaccinations',   badge: null },
    { path: '/farm',          icon: <Tractor size={20}/>,         label: 'Farm Management',badge: null },
    { path: '/locator',       icon: <MapPin size={20}/>,          label: 'Emergency Vet',  badge: null },
    ...(user.role === 'ADMIN' ? [{ path: '/team', icon: <Users size={20}/>, label: 'Team Management', badge: null }] : []),
  ];

  const sidebarW = collapsed ? '72px' : '260px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-900)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
        background: 'linear-gradient(180deg, var(--bg-800) 0%, var(--bg-900) 100%)',
        borderRight: '1px solid var(--border-1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-1)',
          minHeight: '72px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {/* Icon with animated glow */}
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 20px var(--brand-glow)',
            }}>
              <HeartPulse size={20} color="white" />
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>VetSense AI</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--brand-400)', fontWeight: 600, letterSpacing: '0.06em' }}>VETERINARY SYSTEM</p>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: '8px', padding: '5px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{ margin: '8px auto', background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: '10px',
                padding: collapsed ? '12px' : '10px 14px',
                borderRadius: '10px',
                color: isActive ? 'var(--brand-400)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(34,197,94,0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textDecoration: 'none',
                position: 'relative',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <span style={{
                      color: isActive ? 'var(--brand-400)' : 'var(--text-muted)',
                      flexShrink: 0,
                      transition: 'color 0.2s',
                    }}>
                      {item.icon}
                    </span>
                    {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className={`badge badge-${item.badgeVariant || 'green'}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div style={{
          padding: collapsed ? '12px 8px' : '16px',
          borderTop: '1px solid var(--border-1)',
        }}>
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '10px', borderRadius: '10px', background: 'var(--surface-1)', border: '1px solid var(--border-1)' }}>
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-600), var(--accent-500))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.95rem', color: 'white', flexShrink: 0,
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name || 'User'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-400)', fontWeight: 500 }}>
                    {user.role || 'Member'}
                  </p>
                </div>
                <span className="status-dot online" style={{ flexShrink: 0 }}></span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.875rem' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-600), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'white',
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={handleLogout}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fca5a5', display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{
        marginLeft: sidebarW,
        flex: 1,
        padding: '32px',
        minHeight: '100vh',
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
      }}>
        {/* Ambient glow blobs */}
        <div className="glow-orb" style={{ width: '600px', height: '600px', background: 'var(--brand-500)', top: '-200px', right: '-100px', opacity: 0.06 }} />
        <div className="glow-orb" style={{ width: '400px', height: '400px', background: 'var(--accent-500)', bottom: '100px', left: '-50px', opacity: 0.04 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

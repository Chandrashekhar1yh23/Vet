import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, ShieldCheck, Mail, Lock, Trash2, Loader2, UserPlus, AlertCircle } from 'lucide-react';

export default function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF');
  const [addingUser, setAddingUser] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/users`, 
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('STAFF');
      
      // Refresh list
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add team member.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove team member.');
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', color: '#fca5a5', display: 'inline-block' }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: 0, fontWeight: 700 }}>Unauthorized Access</h2>
          <p style={{ marginTop: '0.5rem' }}>Only Clinic Administrators can manage the team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={32} color="var(--brand-400)" /> Team Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
          Manage your clinic's veterinarians and staff members.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '24px' }}>
        
        {/* Left Column - Team List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Current Team</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}><Loader2 className="animate-spin" /></div>
          ) : team.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No other team members found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {team.map(member => (
                <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {member.name}
                      {member.role === 'ADMIN' && <span style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '2px 8px', borderRadius: '999px' }}>ADMIN</span>}
                      {member.role === 'VET' && <span style={{ fontSize: '0.7rem', background: 'rgba(168,85,247,0.15)', color: 'var(--purple-400)', padding: '2px 8px', borderRadius: '999px' }}>VET</span>}
                      {member.role === 'STAFF' && <span style={{ fontSize: '0.7rem', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-400)', padding: '2px 8px', borderRadius: '999px' }}>STAFF</span>}
                    </p>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{member.email}</p>
                  </div>
                  
                  {member._id !== currentUser.id && (
                    <button 
                      onClick={() => handleDeleteMember(member._id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#fca5a5', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      title="Remove Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Add Member Form */}
        <div className="glass-panel" style={{ padding: '24px', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} color="white" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Invite Member</h3>
          </div>

          <form onSubmit={handleAddMember}>
            <div className="input-group">
              <label>Full Name</label>
              <input className="input-control" type="text" placeholder="Dr. Jane Doe or Staff" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div className="input-group">
              <label><Mail size={14}/> Email</label>
              <input className="input-control" type="email" placeholder="jane@clinic.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label><ShieldCheck size={14}/> Role</label>
              <select className="input-control" value={role} onChange={e => setRole(e.target.value)}>
                <option value="STAFF">Basic Staff (Appointments/Entry)</option>
                <option value="VET">Veterinarian (Consultations/Medical)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
            </div>

            <div className="input-group">
              <label><Lock size={14}/> Initial Password</label>
              <input className="input-control" type="text" placeholder="Will be temporary" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={addingUser}>
              {addingUser ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Add to Team</>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

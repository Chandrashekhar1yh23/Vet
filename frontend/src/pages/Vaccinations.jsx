import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Syringe, CalendarCheck, CalendarOff, Plus, CheckCircle2,
  Clock, AlertCircle, Loader2, X, ShieldAlert, TrendingUp
} from 'lucide-react';

const getStatusConfig = (status, date) => {
  const missed = new Date(date) < new Date() && status === 'Pending';
  if (status === 'Completed') return { cls:'badge-green',  color:'var(--brand-400)',  bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)',  icon:<CheckCircle2 size={14}/>,  label:'Completed', accent:'rgba(34,197,94,0.6)' };
  if (missed)                 return { cls:'badge-red',    color:'#fca5a5',           bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)',  icon:<CalendarOff size={14}/>,  label:'Missed',    accent:'rgba(239,68,68,0.6)' };
  return                             { cls:'badge-yellow', color:'#fbbf24',           bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.2)',icon:<Clock size={14}/>,        label:'Pending',   accent:'rgba(245,158,11,0.6)' };
};

const COMMON_VACCINES = ['Rabies','Parvovirus','Distemper','FMD','Brucellosis','Anthrax','HS','BQ','PPR'];
const ANIMAL_TYPES    = ['Dog','Cat','Cow','Sheep','Goat','Poultry','Horse','Other'];

export default function Vaccinations() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [toast, setToast]               = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({ animalName:'', animalType:'Dog', vaccineName:'', dueDate:'', status:'Pending' });

  useEffect(() => { fetchVaccinations(); }, []);

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(()=>setToast(null),4000); };

  const fetchVaccinations = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/api/vaccinations/${user.id || '64c67f4c5e3d7b0012c8a9f0'}`);
      setVaccinations(data);
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/vaccinations`, { ...formData, userId: user.id || '64c67f4c5e3d7b0012c8a9f0' });
      setShowForm(false);
      setFormData({ animalName:'',animalType:'Dog',vaccineName:'',dueDate:'',status:'Pending' });
      fetchVaccinations();
      showToast('Vaccination record saved successfully.');
    } catch { showToast('Error creating record.', 'error'); }
  };

  const markAsCompleted = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE}/api/vaccinations/${id}`);
      fetchVaccinations();
      showToast('Marked as completed! 💉');
    } catch { showToast('Failed to update status.', 'error'); }
  };

  // Stats
  const completed = vaccinations.filter(v => v.status === 'Completed').length;
  const pending   = vaccinations.filter(v => v.status === 'Pending' && new Date(v.dueDate) >= new Date()).length;
  const missed    = vaccinations.filter(v => v.status === 'Pending' && new Date(v.dueDate) < new Date()).length;

  return (
    <div className="animate-fade-in" style={{ maxWidth:'960px',margin:'0 auto' }}>

      {/* Toast */}
      {toast&&<div style={{ position:'fixed',top:'24px',right:'24px',zIndex:9999,display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',borderRadius:'12px',background:toast.type==='error'?'rgba(239,68,68,0.12)':'rgba(34,197,94,0.12)',border:`1px solid ${toast.type==='error'?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'}`,color:toast.type==='error'?'#fca5a5':'var(--brand-300)',backdropFilter:'blur(20px)',animation:'slide-in-right 0.4s ease',maxWidth:'380px' }}>
        {toast.type==='error'?<AlertCircle size={16}/>:<CheckCircle2 size={16}/>}<span style={{ fontSize:'0.875rem' }}>{toast.msg}</span>
      </div>}

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'12px' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom:'6px' }}>Vaccination Tracker</span>
          <h1 style={{ fontSize:'1.8rem',fontWeight:800,color:'var(--text-primary)',margin:'4px 0 4px' }}>Smart Vaccination Tracker</h1>
          <p style={{ color:'var(--text-secondary)',fontSize:'0.9rem',margin:0 }}>Manage and track upcoming vaccines for all your animals.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? <><X size={16}/> Cancel</> : <><Plus size={16}/> Add Record</>}
        </button>
      </div>

      {/* Stats row */}
      <div className="stagger-children" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'1.5rem' }}>
        {[
          { label:'Completed', value:completed, color:'var(--brand-400)', bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)',  icon:<CheckCircle2 size={18}/> },
          { label:'Upcoming',  value:pending,   color:'#fbbf24',          bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)', icon:<Clock size={18}/> },
          { label:'Missed',    value:missed,    color:'#fca5a5',          bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)',  icon:<ShieldAlert size={18}/> },
        ].map(s=>(
          <div key={s.label} className="glass-panel animate-fade-in-up" style={{ padding:'16px 20px',borderColor:s.border,display:'flex',alignItems:'center',gap:'12px' }}>
            <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',color:s.color,flexShrink:0 }}>{s.icon}</div>
            <div>
              <p style={{ margin:'0 0 1px',fontSize:'1.5rem',fontWeight:800,color:s.color }}>{s.value}</p>
              <p style={{ margin:0,fontSize:'0.78rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Record Form */}
      {showForm && (
        <div className="glass-panel animate-scale-in" style={{ padding:'24px',marginBottom:'1.5rem',borderColor:'var(--border-accent)' }}>
          <h2 style={{ margin:'0 0 18px',fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)' }}>📋 Log New Vaccination</h2>
          <form onSubmit={handleAddRecord} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
            <div className="input-group" style={{ marginBottom:0 }}>
              <label>Animal Name / Tag</label>
              <input name="animalName" className="input-control" placeholder="Buddy or Tag #102" value={formData.animalName} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})} required />
            </div>
            <div className="input-group" style={{ marginBottom:0 }}>
              <label>Animal Type</label>
              <select name="animalType" className="input-control" value={formData.animalType} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})}>
                {ANIMAL_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom:0 }}>
              <label>Vaccine Name</label>
              <select name="vaccineName" className="input-control" value={formData.vaccineName} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})} required>
                <option value="">Select or type vaccine...</option>
                {COMMON_VACCINES.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom:0 }}>
              <label>Due Date</label>
              <input name="dueDate" type="date" className="input-control" value={formData.dueDate} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})} required />
            </div>
            <div className="input-group" style={{ marginBottom:0 }}>
              <label>Status</label>
              <select name="status" className="input-control" value={formData.status} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})}>
                <option value="Pending">Pending (Upcoming)</option>
                <option value="Completed">Completed (Done)</option>
              </select>
            </div>
            <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding:'11px 24px' }}>Save Record</button>
            </div>
          </form>
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <div style={{ display:'flex',justifyContent:'center',padding:'4rem' }}>
          <Loader2 size={32} style={{ color:'var(--brand-400)',animation:'spin-slow 1s linear infinite' }}/>
        </div>
      ) : vaccinations.length === 0 ? (
        <div className="glass-panel" style={{ padding:'4rem',textAlign:'center' }}>
          <div style={{ width:'64px',height:'64px',borderRadius:'16px',background:'rgba(34,197,94,0.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem' }}>
            <Syringe size={28} style={{ color:'var(--brand-400)' }}/>
          </div>
          <h3 style={{ color:'var(--text-primary)',marginBottom:'8px' }}>No Records Yet</h3>
          <p style={{ color:'var(--text-muted)',marginBottom:'1.5rem',fontSize:'0.9rem' }}>Start tracking your animals' vaccination timeline.</p>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}><Plus size={16}/> Add First Record</button>
        </div>
      ) : (
        <div style={{ display:'grid',gap:'10px' }}>
          {vaccinations.map(v => {
            const cfg = getStatusConfig(v.status, v.dueDate);
            const daysLeft = Math.ceil((new Date(v.dueDate) - new Date()) / (1000*60*60*24));
            return (
              <div key={v._id} className="glass-panel card-hover" style={{ padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderLeft:`3px solid ${cfg.accent}`,gap:'16px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'14px',flex:1,minWidth:0 }}>
                  <div style={{ width:'44px',height:'44px',borderRadius:'12px',background:cfg.bg,color:cfg.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <Syringe size={20}/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap' }}>
                      <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:700,color:'var(--text-primary)' }}>{v.vaccineName}</h3>
                      <span className={`badge ${cfg.cls}`} style={{ fontSize:'0.7rem' }}>{cfg.icon} {cfg.label}</span>
                    </div>
                    <p style={{ margin:'3px 0 0',fontSize:'0.82rem',color:'var(--text-secondary)' }}>🐾 {v.animalName}</p>
                  </div>
                </div>

                <div style={{ display:'flex',alignItems:'center',gap:'16px',flexShrink:0 }}>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ margin:0,fontWeight:600,fontSize:'0.875rem',color:'var(--text-primary)',display:'flex',alignItems:'center',gap:'5px' }}>
                      {v.status==='Completed'?<CalendarCheck size={14} style={{ color:'var(--brand-400)' }}/>:<CalendarOff size={14} style={{ color:'var(--text-muted)' }}/>}
                      {new Date(v.dueDate).toLocaleDateString('en-IN',{ day:'numeric',month:'short',year:'numeric' })}
                    </p>
                    {v.status==='Pending' && daysLeft > 0 && (
                      <p style={{ margin:'2px 0 0',fontSize:'0.75rem',color:daysLeft<=7?'var(--warning)':'var(--text-muted)' }}>
                        {daysLeft<=7?'⚠️':''} {daysLeft} days left
                      </p>
                    )}
                  </div>
                  {v.status === 'Pending' && (
                    <button onClick={() => markAsCompleted(v._id)} className="btn" style={{ padding:'8px 14px',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',color:'var(--brand-400)',fontSize:'0.82rem',fontWeight:600,borderRadius:'8px',cursor:'pointer',whiteSpace:'nowrap' }}>
                      ✓ Mark Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

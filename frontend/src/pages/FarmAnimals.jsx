import React, { useState } from 'react';
import {
  Tractor, Droplets, Activity, Plus, Heart, ThermometerSun,
  Weight, ChevronRight, X, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';

const STATUS_CFG = {
  'Healthy':          { cls:'badge-green',  color:'var(--brand-400)',  bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)'  },
  'Under Observation':{ cls:'badge-yellow', color:'#fbbf24',           bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)' },
  'Sick':             { cls:'badge-red',    color:'#fca5a5',           bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)'  },
};

const SPECIES_ICONS = { Cow:'🐄', Sheep:'🐑', Goat:'🐐', Horse:'🐴', Pig:'🐷', Chicken:'🐔', Dog:'🐕', Other:'🐾' };

const INITIAL_LIVESTOCK = [
  { id:'C102', species:'Cow',   breed:'Holstein Friesian', status:'Healthy',           milk:18, temp:38.5, weight:520, lastCheck:'10 Apr 2026', age:'3 years' },
  { id:'S405', species:'Sheep', breed:'Merino',            status:'Under Observation', milk:0,  temp:39.5, weight:68,  lastCheck:'08 Apr 2026', age:'2 years' },
  { id:'C098', species:'Cow',   breed:'Jersey',            status:'Sick',              milk:5,  temp:40.2, weight:490, lastCheck:'14 Apr 2026', age:'4 years' },
  { id:'G301', species:'Goat',  breed:'Boer',              status:'Healthy',           milk:2,  temp:38.8, weight:45,  lastCheck:'09 Apr 2026', age:'1 year'  },
];

export default function FarmAnimals() {
  const [livestock, setLivestock] = useState(INITIAL_LIVESTOCK);
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [formData, setFormData]   = useState({ id:'',species:'Cow',breed:'',status:'Healthy',milk:0,temp:38.5,weight:0,age:'',lastCheck:'' });

  const showToast = (msg,type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const handleAdd = (e) => {
    e.preventDefault();
    setLivestock(prev => [...prev, { ...formData, id: formData.id || `A${Date.now().toString().slice(-3)}` }]);
    setShowForm(false);
    setFormData({ id:'',species:'Cow',breed:'',status:'Healthy',milk:0,temp:38.5,weight:0,age:'',lastCheck:'' });
    showToast('Livestock record added successfully!');
  };

  const healthy = livestock.filter(a=>a.status==='Healthy').length;
  const sick    = livestock.filter(a=>a.status==='Sick').length;
  const obs     = livestock.filter(a=>a.status==='Under Observation').length;

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1100px',margin:'0 auto' }}>

      {/* Toast */}
      {toast&&<div style={{ position:'fixed',top:'24px',right:'24px',zIndex:9999,display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',borderRadius:'12px',background:toast.type==='error'?'rgba(239,68,68,0.12)':'rgba(34,197,94,0.12)',border:`1px solid ${toast.type==='error'?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'}`,color:toast.type==='error'?'#fca5a5':'var(--brand-300)',backdropFilter:'blur(20px)',animation:'slide-in-right 0.4s ease' }}>
        {toast.type==='error'?<AlertCircle size={16}/>:<CheckCircle2 size={16}/>}<span style={{fontSize:'0.875rem'}}>{toast.msg}</span>
      </div>}

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'12px' }}>
        <div>
          <span className="badge badge-cyan" style={{ marginBottom:'6px' }}>Farm Management</span>
          <h1 style={{ fontSize:'1.8rem',fontWeight:800,color:'var(--text-primary)',margin:'4px 0 4px' }}>Livestock Management</h1>
          <p style={{ color:'var(--text-secondary)',fontSize:'0.9rem',margin:0 }}>Monitor herd health, milk production, and vitals.</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="btn btn-primary">
          {showForm?<><X size={16}/> Cancel</>:<><Plus size={16}/> Add Livestock</>}
        </button>
      </div>

      {/* Herd stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'1.5rem' }}>
        {[
          { l:'Total Herd', v:livestock.length, color:'var(--accent-400)', bg:'rgba(6,182,212,0.08)',   icon:'🐄' },
          { l:'Healthy',    v:healthy,          color:'var(--brand-400)',  bg:'rgba(34,197,94,0.08)',   icon:'✅' },
          { l:'Monitoring', v:obs,              color:'#fbbf24',           bg:'rgba(245,158,11,0.08)',  icon:'👁️' },
          { l:'Sick',       v:sick,             color:'#fca5a5',           bg:'rgba(239,68,68,0.08)',   icon:'🚨' },
        ].map(s=>(
          <div key={s.l} className="glass-panel animate-fade-in-up" style={{ padding:'14px 16px',display:'flex',alignItems:'center',gap:'10px' }}>
            <span style={{ fontSize:'1.5rem' }}>{s.icon}</span>
            <div><p style={{ margin:'0 0 1px',fontSize:'1.4rem',fontWeight:800,color:s.color }}>{s.v}</p><p style={{ margin:0,fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em' }}>{s.l}</p></div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-panel animate-scale-in" style={{ padding:'24px',marginBottom:'1.5rem',borderColor:'var(--border-accent)' }}>
          <h2 style={{ margin:'0 0 18px',fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)' }}>🐄 Add Livestock Record</h2>
          <form onSubmit={handleAdd} style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px' }}>
            <div className="input-group" style={{ marginBottom:0 }}><label>Tag ID</label><input className="input-control" placeholder="C103" value={formData.id} onChange={e=>setFormData({...formData,id:e.target.value})} /></div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Species</label>
              <select className="input-control" value={formData.species} onChange={e=>setFormData({...formData,species:e.target.value})}>
                {Object.keys(SPECIES_ICONS).map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Breed</label><input className="input-control" placeholder="Holstein Friesian" value={formData.breed} onChange={e=>setFormData({...formData,breed:e.target.value})} required /></div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Status</label>
              <select className="input-control" value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}>
                <option>Healthy</option><option>Under Observation</option><option>Sick</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Milk (L/day)</label><input type="number" className="input-control" min={0} value={formData.milk} onChange={e=>setFormData({...formData,milk:+e.target.value})} /></div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Weight (kg)</label><input type="number" className="input-control" min={0} value={formData.weight} onChange={e=>setFormData({...formData,weight:+e.target.value})} /></div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Temperature (°C)</label><input type="number" step="0.1" className="input-control" value={formData.temp} onChange={e=>setFormData({...formData,temp:+e.target.value})} /></div>
            <div className="input-group" style={{ marginBottom:0 }}><label>Age</label><input className="input-control" placeholder="2 years" value={formData.age} onChange={e=>setFormData({...formData,age:e.target.value})} /></div>
            <div style={{ display:'flex',alignItems:'flex-end' }}><button type="submit" className="btn btn-primary" style={{ width:'100%',padding:'11px' }}>Save Record</button></div>
          </form>
        </div>
      )}

      {/* Animal cards grid */}
      <div className="stagger-children" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'14px' }}>
        {livestock.map(animal => {
          const cfg = STATUS_CFG[animal.status] || STATUS_CFG['Healthy'];
          const emoji = SPECIES_ICONS[animal.species] || '🐾';
          const isFever = animal.temp > 39.5;
          return (
            <div key={animal.id} className="glass-panel card-hover animate-fade-in-up" style={{ padding:'18px',cursor:'pointer' }} onClick={()=>setSelected(selected===animal.id?null:animal.id)}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                  <div style={{ width:'44px',height:'44px',borderRadius:'12px',background:cfg.bg,border:`1px solid ${cfg.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem' }}>
                    {emoji}
                  </div>
                  <div>
                    <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:700,color:'var(--text-primary)' }}>Tag: {animal.id}</h3>
                    <p style={{ margin:'2px 0 0',fontSize:'0.8rem',color:'var(--text-secondary)' }}>{animal.species} • {animal.breed}</p>
                  </div>
                </div>
                <span className={`badge ${cfg.cls}`} style={{ fontSize:'0.7rem',flexShrink:0 }}>{animal.status}</span>
              </div>

              <div style={{ borderTop:'1px solid var(--border-1)',paddingTop:'12px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
                {animal.species === 'Cow' && (
                  <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                    <Droplets size={14} style={{ color:'var(--accent-400)' }}/>
                    <div><p style={{ margin:0,fontSize:'0.7rem',color:'var(--text-muted)' }}>Milk Yield</p><p style={{ margin:0,fontWeight:700,fontSize:'0.9rem',color:'var(--text-primary)' }}>{animal.milk} L/day</p></div>
                  </div>
                )}
                <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                  <ThermometerSun size={14} style={{ color:isFever?'#fca5a5':'var(--brand-400)' }}/>
                  <div><p style={{ margin:0,fontSize:'0.7rem',color:'var(--text-muted)' }}>Temp</p><p style={{ margin:0,fontWeight:700,fontSize:'0.9rem',color:isFever?'#fca5a5':'var(--text-primary)' }}>{animal.temp}°C {isFever?'⚠️':''}</p></div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                  <Weight size={14} style={{ color:'var(--text-muted)' }}/>
                  <div><p style={{ margin:0,fontSize:'0.7rem',color:'var(--text-muted)' }}>Weight</p><p style={{ margin:0,fontWeight:700,fontSize:'0.9rem',color:'var(--text-primary)' }}>{animal.weight} kg</p></div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                  <Activity size={14} style={{ color:'var(--text-muted)' }}/>
                  <div><p style={{ margin:0,fontSize:'0.7rem',color:'var(--text-muted)' }}>Last Check</p><p style={{ margin:0,fontWeight:600,fontSize:'0.82rem',color:'var(--text-secondary)' }}>{animal.lastCheck}</p></div>
                </div>
              </div>

              {selected === animal.id && (
                <div style={{ marginTop:'12px',paddingTop:'12px',borderTop:'1px solid var(--border-1)',display:'flex',gap:'8px' }} onClick={e=>e.stopPropagation()}>
                  <button className="btn" style={{ flex:1,padding:'8px',background:'rgba(6,182,212,0.08)',border:'1px solid rgba(6,182,212,0.2)',color:'var(--accent-400)',fontSize:'0.8rem',cursor:'pointer' }}>📋 View History</button>
                  <button className="btn" style={{ flex:1,padding:'8px',background:'var(--primary-light)',border:'1px solid var(--border-accent)',color:'var(--brand-400)',fontSize:'0.8rem',cursor:'pointer' }}>💉 Schedule Vaccine</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

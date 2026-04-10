import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Phone, Mail, MessageCircle, CalendarPlus, MapPin, Award,
  Clock, PlusCircle, Trash2, Search, Star, CheckCircle2,
  AlertCircle, Loader2, X, ChevronDown
} from 'lucide-react';

const SPECIALIZATIONS = [
  'All', 'Small Animal Surgery', 'Large Animal Surgery', 'Dermatology',
  'Orthopedic', 'Dental', 'Emergency Medicine', 'Internal Medicine'
];

export default function Doctors() {
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [toast, setToast]               = useState(null);
  const [search, setSearch]             = useState('');
  const [filterSpec, setFilterSpec]     = useState('All');
  const [bookingId, setBookingId]       = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    name:'', specialization:'', experience:'', qualification:'',
    clinicLocation:'', contactPhone:'', contactEmail:'', availableHours:''
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/api/doctors`);
      setDoctors(data);
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (!window.confirm(`Delete Dr. ${doctorName}?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/api/doctors/${doctorId}`);
      setDoctors(prev => prev.filter(d => d._id !== doctorId));
      showToast(`Dr. ${doctorName} removed successfully.`);
    } catch { showToast('Failed to delete doctor profile.', 'error'); }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('userId', user.id || '64c67f4c5e3d7b0012c8a9f0');
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (profilePhotoFile) fd.append('profilePhotoFile', profilePhotoFile);
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/doctors`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setFormData({ name:'',specialization:'',experience:'',qualification:'',clinicLocation:'',contactPhone:'',contactEmail:'',availableHours:'' });
      setProfilePhotoFile(null);
      fetchDoctors();
      showToast(`Dr. ${formData.name} added successfully!`);
    } catch { showToast('Error adding doctor profile.', 'error'); }
  };

  const handleBooking = async (doctorId, doctorName) => {
    setBookingId(doctorId);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/doctors/book`, {
        userId: user.id || '64c67f4c5e3d7b0012c8a9f0',
        doctorId,
        appointmentDate: new Date(Date.now() + 86400000).toLocaleDateString()
      });
      showToast(`✅ Appointment booked with ${doctorName}! Confirmation sent.`);
    } catch { showToast(`Failed to book appointment with ${doctorName}.`, 'error'); }
    finally { setBookingId(null); }
  };

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchSpec   = filterSpec === 'All' || d.specialization.includes(filterSpec);
    return matchSearch && matchSpec;
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed',top:'24px',right:'24px',zIndex:9999,display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',borderRadius:'12px',background:toast.type==='error'?'rgba(239,68,68,0.12)':'rgba(34,197,94,0.12)',border:`1px solid ${toast.type==='error'?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'}`,color:toast.type==='error'?'#fca5a5':'var(--brand-300)',backdropFilter:'blur(20px)',animation:'slide-in-right 0.4s ease',maxWidth:'380px' }}>
          {toast.type==='error'?<AlertCircle size={16}/>:<CheckCircle2 size={16}/>}
          <span style={{ fontSize:'0.875rem' }}>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'12px' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom:'6px' }}>Directory</span>
          <h1 style={{ fontSize:'1.8rem',fontWeight:800,color:'var(--text-primary)',margin:'4px 0 4px' }}>Find a Veterinarian</h1>
          <p style={{ color:'var(--text-secondary)',fontSize:'0.9rem',margin:0 }}>Connect with certified veterinary professionals.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ gap:'8px' }}>
          {showForm ? <X size={16}/> : <PlusCircle size={16}/>}
          {showForm ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {/* Search + filter bar */}
      <div style={{ display:'flex',gap:'12px',marginBottom:'1.5rem',flexWrap:'wrap' }}>
        <div style={{ position:'relative',flex:1,minWidth:'200px' }}>
          <Search size={16} style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)' }} />
          <input className="input-control" placeholder="Search by name or specialization..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'38px',marginBottom:0 }} />
        </div>
        <select className="input-control" value={filterSpec} onChange={e=>setFilterSpec(e.target.value)} style={{ width:'220px',marginBottom:0 }}>
          {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Add Doctor Form */}
      {showForm && (
        <div className="glass-panel animate-scale-in" style={{ padding:'24px',marginBottom:'1.5rem',borderColor:'var(--border-accent)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px' }}>
            <div style={{ width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg, var(--brand-500), var(--accent-500))',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <PlusCircle size={18} color="white"/>
            </div>
            <h2 style={{ margin:0,fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)' }}>Register New Professional</h2>
          </div>
          <form onSubmit={handleAddDoctor} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
            {[
              ['name','Full Name','Dr. John Doe','text'],['specialization','Specialization','Small Animal Surgery','text'],
              ['qualification','Qualification','DVM, MVSc','text'],['experience','Experience','10 Years','text'],
              ['clinicLocation','Clinic Location','123 Vet Street, City','text'],['availableHours','Available Hours','Mon-Fri (9AM-6PM)','text'],
              ['contactPhone','Phone','+91 98765 43210','text'],['contactEmail','Email','doc@vetsense.ai','email'],
            ].map(([n,label,ph,type]) => (
              <div key={n} className="input-group" style={{ marginBottom:0 }}>
                <label>{label}</label>
                <input name={n} type={type} className="input-control" placeholder={ph} value={formData[n]} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})} required />
              </div>
            ))}
            <div className="input-group" style={{ marginBottom:0 }}>
              <label>Profile Photo</label>
              <input type="file" accept="image/*" className="input-control" onChange={e=>setProfilePhotoFile(e.target.files[0])} style={{ padding:'8px' }} />
            </div>
            <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding:'11px 24px' }}>Save Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Doctor Cards */}
      {loading ? (
        <div style={{ display:'flex',justifyContent:'center',padding:'4rem' }}>
          <Loader2 size={32} style={{ color:'var(--brand-400)',animation:'spin-slow 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding:'4rem',textAlign:'center' }}>
          <p style={{ color:'var(--text-muted)' }}>No doctors found matching your search.</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'16px' }}>
          {filtered.map(doc => (
            <div key={doc._id} className="glass-panel card-hover animate-fade-in-up" style={{ padding:'20px',display:'flex',flexDirection:'column',position:'relative' }}>
              {/* Delete */}
              <button onClick={() => handleDeleteDoctor(doc._id, doc.name)} style={{ position:'absolute',top:'14px',right:'14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'8px',padding:'6px',cursor:'pointer',color:'#fca5a5',display:'flex',alignItems:'center',transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
              >
                <Trash2 size={14}/>
              </button>

              {/* Profile header */}
              <div style={{ display:'flex',gap:'14px',marginBottom:'16px',paddingRight:'40px' }}>
                <div style={{ position:'relative',flexShrink:0 }}>
                  <img src={doc.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=22c55e&color=fff&size=80`} alt={doc.name}
                    style={{ width:'64px',height:'64px',borderRadius:'16px',objectFit:'cover',border:'2px solid var(--brand-glow)' }}
                    onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=22c55e&color=fff&size=80`; }}
                  />
                  <span className="status-dot online" style={{ position:'absolute',bottom:'2px',right:'2px',border:'2px solid var(--bg-700)' }} />
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <h3 style={{ margin:'0 0 2px',fontSize:'1rem',fontWeight:700,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{doc.name}</h3>
                  <p style={{ margin:'0 0 4px',color:'var(--brand-400)',fontWeight:600,fontSize:'0.82rem' }}>{doc.specialization}</p>
                  <p style={{ margin:0,color:'var(--text-muted)',fontSize:'0.78rem' }}>{doc.qualification}</p>
                </div>
              </div>

              {/* Star rating mock */}
              <div style={{ display:'flex',gap:'2px',marginBottom:'12px' }}>
                {[...Array(5)].map((_,i)=><Star key={i} size={12} fill={i<4?'#f59e0b':'none'} color={i<4?'#f59e0b':'var(--border-2)'}/>)}
                <span style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginLeft:'4px' }}>4.0 (12 reviews)</span>
              </div>

              {/* Info items */}
              <div style={{ display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px',flex:1 }}>
                {[
                  [<Award size={13}/>, `${doc.experience} experience`],
                  [<MapPin size={13}/>, doc.clinicLocation],
                  [<Clock size={13}/>, doc.availableHours],
                ].map(([icon, text], i) => (
                  <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'0.82rem',color:'var(--text-secondary)' }}>
                    <span style={{ color:'var(--brand-400)',flexShrink:0,marginTop:'1px' }}>{icon}</span>
                    <span style={{ lineHeight:1.4 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px' }}>
                <button onClick={() => window.location.href=`tel:${doc.contactPhone}`} title="Call" style={{ padding:'9px',borderRadius:'8px',border:'1px solid rgba(59,130,246,0.2)',background:'rgba(59,130,246,0.08)',color:'#93c5fd',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.18)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(59,130,246,0.08)'}
                ><Phone size={15}/></button>
                <button onClick={() => window.location.href=`mailto:${doc.contactEmail}`} title="Email" style={{ padding:'9px',borderRadius:'8px',border:'1px solid rgba(236,72,153,0.2)',background:'rgba(236,72,153,0.08)',color:'#f9a8d4',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(236,72,153,0.18)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(236,72,153,0.08)'}
                ><Mail size={15}/></button>
                <button title="Chat (coming soon)" style={{ padding:'9px',borderRadius:'8px',border:'1px solid var(--border-1)',background:'var(--surface-1)',color:'var(--text-muted)',cursor:'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.6 }}>
                  <MessageCircle size={15}/>
                </button>
                <button onClick={() => handleBooking(doc._id, doc.name)} disabled={bookingId===doc._id} className="btn-primary btn" style={{ padding:'9px',borderRadius:'8px',fontSize:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px' }}>
                  {bookingId===doc._id ? <Loader2 size={13} style={{ animation:'spin-slow 1s linear infinite' }}/> : <CalendarPlus size={13}/>}
                  {bookingId===doc._id ? '' : 'Book'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      {!loading && (
        <p style={{ marginTop:'1rem',color:'var(--text-muted)',fontSize:'0.8rem' }}>
          Showing {filtered.length} of {doctors.length} registered professionals
        </p>
      )}
    </div>
  );
}

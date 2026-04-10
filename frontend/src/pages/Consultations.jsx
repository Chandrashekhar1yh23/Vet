import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, Camera, Send, Stethoscope, Clock,
  CheckCircle2, Plus, AlertCircle, Image as ImageIcon,
  Pill, ChevronRight, Loader2, X
} from 'lucide-react';

/* ─── Page header ─── */
const PageHeader = ({ title, subtitle, badge }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      {badge && <span className="badge badge-cyan">{badge}</span>}
    </div>
    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>{subtitle}</p>
  </div>
);

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const config = {
    'Pending Review': { cls: 'badge-yellow', icon: '⏳' },
    'Reviewed':       { cls: 'badge-green',  icon: '✅' },
    'Completed':      { cls: 'badge-green',  icon: '✅' },
  };
  const cfg = config[status] || { cls: 'badge-cyan', icon: '📋' };
  return <span className={`badge ${cfg.cls}`}>{cfg.icon} {status}</span>;
};

export default function Consultations() {
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [petName, setPetName]       = useState('');
  const [symptoms, setSymptoms]     = useState('');
  const [animalType, setAnimalType] = useState('Dog');
  const [urgency, setUrgency]       = useState('Normal');
  const [images, setImages]         = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHistory = async () => {
    if (!user.id) return setLoading(false);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/api/consultations/${user.id}`);
      setHistory(data);
    } catch { /* empty history */ }
    finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImages([file]); setPreviewURL(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('userId', user.id); fd.append('petName', petName);
      fd.append('symptoms', symptoms);
      if (images?.[0]) fd.append('images', images[0]);
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/consultations`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPetName(''); setSymptoms(''); setImages(null); setPreviewURL(null);
      setActiveTab('history'); fetchHistory();
      showToast('Consultation request submitted successfully! A vet will review it shortly.');
    } catch { showToast('Failed to submit consultation. Please try again.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const tabs = [
    { id: 'history', label: 'History', icon: <FileText size={15}/> },
    { id: 'new',     label: 'New Request', icon: <Plus size={15}/> },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', borderRadius: '12px',
          background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          color: toast.type === 'error' ? '#fca5a5' : 'var(--brand-300)',
          backdropFilter: 'blur(20px)', animation: 'slide-in-right 0.4s ease', maxWidth: '380px',
        }}>
          {toast.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
          <span style={{ fontSize: '0.875rem' }}>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <PageHeader
          title="Consultation Records"
          subtitle="Request vet consultations and view your medical history."
          badge="Medical"
        />
        <div style={{
          display: 'flex', background: 'var(--surface-1)', border: '1px solid var(--border-1)',
          borderRadius: '10px', padding: '4px', gap: '4px',
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: activeTab === t.id ? 'var(--surface-3)' : 'transparent',
              color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === t.id ? 600 : 500, fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} style={{ color: 'var(--brand-400)', animation: 'spin-slow 1s linear infinite' }} />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <FileText size={28} style={{ color: 'var(--accent-400)' }} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Consultations Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Submit your first consultation request to get started.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('new')}>
              <Plus size={16}/> New Consultation
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.map((record) => (
              <div key={record._id} className="glass-panel card-hover" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
                {/* Left icon */}
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={20} style={{ color: 'var(--accent-400)' }} />
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>{record.petName}</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11}/> {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={record.diagnosis === 'Pending Review' ? 'Pending Review' : 'Reviewed'} />
                  </div>

                  <div style={{ background: 'var(--surface-1)', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', borderLeft: '3px solid var(--accent-500)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Symptoms</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{record.symptoms}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: 'var(--surface-1)', borderRadius: '8px', padding: '10px 14px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Stethoscope size={10}/> Diagnosis
                      </p>
                      <p style={{ margin: 0, color: record.diagnosis === 'Pending Review' ? 'var(--warning)' : 'var(--brand-400)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {record.diagnosis || 'Pending Review'}
                      </p>
                    </div>
                    <div style={{ background: 'var(--surface-1)', borderRadius: '8px', padding: '10px 14px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Pill size={10}/> Prescription
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{record.prescription || 'Awaiting review'}</p>
                    </div>
                  </div>
                </div>
                {record.images?.length > 0 && (
                  <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', flexShrink: 0 }}>
                    <ImageIcon size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Image</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── NEW REQUEST TAB ── */}
      {activeTab === 'new' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-500), var(--brand-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Consultation Request</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>A certified vet will review it within 24 hours</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>🐾 Patient / Animal Name</label>
                <input className="input-control" type="text" placeholder="e.g. Buddy, Luna, Cow #102" value={petName} onChange={e => setPetName(e.target.value)} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>🦮 Animal Type</label>
                <select className="input-control" value={animalType} onChange={e => setAnimalType(e.target.value)}>
                  {['Dog','Cat','Cow','Sheep','Goat','Horse','Bird','Other'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>📋 Detailed Symptoms</label>
              <textarea
                className="input-control" rows={5} required
                placeholder="Describe what the animal is experiencing in detail (e.g., vomiting since morning, lethargic, not eating, visible rash on skin)..."
                value={symptoms} onChange={e => setSymptoms(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>🚨 Urgency Level</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Normal', 'Moderate', 'Emergency'].map(u => (
                  <button key={u} type="button" onClick={() => setUrgency(u)} style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid',
                    borderColor: urgency === u ? (u === 'Emergency' ? '#ef4444' : u === 'Moderate' ? '#f59e0b' : 'var(--brand-500)') : 'var(--border-1)',
                    background: urgency === u ? (u === 'Emergency' ? 'rgba(239,68,68,0.1)' : u === 'Moderate' ? 'rgba(245,158,11,0.1)' : 'var(--primary-light)') : 'var(--surface-1)',
                    color: urgency === u ? (u === 'Emergency' ? '#fca5a5' : u === 'Moderate' ? '#fbbf24' : 'var(--brand-400)') : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                  }}>
                    {u === 'Normal' ? '🟢' : u === 'Moderate' ? '🟡' : '🔴'} {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Image upload */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label><Camera size={14}/> Photo (Optional)</label>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <label htmlFor="cameraUpload" style={{
                  flex: 1, padding: '20px', border: '2px dashed var(--border-2)', borderRadius: '12px',
                  textAlign: 'center', cursor: 'pointer', background: 'var(--surface-1)',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-500)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--surface-1)'; }}
                >
                  <Camera size={24} style={{ color: 'var(--brand-400)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tap to upload / capture photo</span>
                  <input type="file" id="cameraUpload" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
                {previewURL && (
                  <div style={{ position: 'relative', width: '100px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-2)', flexShrink: 0 }}>
                    <img src={previewURL} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => { setPreviewURL(null); setImages(null); }} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                      <X size={12}/>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ alignSelf: 'flex-end', padding: '12px 28px', fontSize: '0.95rem' }}>
              {isSubmitting ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }}/> Submitting...</> : <><Send size={16}/> Submit Consultation</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

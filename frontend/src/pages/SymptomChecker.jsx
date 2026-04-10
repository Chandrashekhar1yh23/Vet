import React, { useState } from 'react';
import axios from 'axios';
import { Zap, AlertTriangle, Send, Loader2, RefreshCw, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  'My dog has been vomiting and seems lethargic since yesterday morning.',
  'My cow has stopped eating and has a high temperature. Seems dull.',
  'My cat has a skin rash and is scratching continuously.',
  'My goat is having difficulty breathing and is coughing.',
];

const URGENCY_CONFIG = {
  High:   { color:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.3)',   label:'⚠️ High — Visit vet immediately' },
  Medium: { color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  label:'🟡 Moderate — Schedule appointment soon' },
  Low:    { color:'#22c55e', bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)',   label:'🟢 Low — Monitor at home' },
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [charCount, setCharCount] = useState(0);

  const checkSymptoms = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setResult(null);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/api/ai/symptom-checker`, { symptoms });
      setResult(data);
    } catch { setResult({ condition:'Unable to analyze', recommendation:'Please check your connection and try again.', urgency:'Low' }); }
    finally { setLoading(false); }
  };

  const urgCfg = result ? (URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.Low) : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth:'760px',margin:'0 auto',width:'100%' }}>

      {/* Hero header */}
      <div style={{ textAlign:'center',marginBottom:'2.5rem' }}>
        <div style={{ width:'72px',height:'72px',borderRadius:'20px',background:'linear-gradient(135deg,var(--purple-500),var(--accent-500))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.2rem',boxShadow:'0 0 30px var(--purple-glow)',animation:'float 4s ease-in-out infinite' }}>
          <Zap size={32} color="white"/>
        </div>
        <h1 style={{ fontSize:'2rem',fontWeight:800,color:'var(--text-primary)',margin:'0 0 8px' }}>AI Symptom Checker</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:'0.95rem',maxWidth:'500px',margin:'0 auto' }}>
          Describe your animal's symptoms in plain language. Our AI will analyze and suggest possible conditions.
        </p>
        <div style={{ display:'flex',justifyContent:'center',gap:'8px',marginTop:'12px' }}>
          <span className="badge badge-purple"><Sparkles size={10}/> Powered by AI</span>
          <span className="badge badge-cyan">Instant Analysis</span>
        </div>
      </div>

      {/* Input card */}
      <div className="glass-panel" style={{ padding:'28px',marginBottom:'1.5rem' }}>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block',fontWeight:600,fontSize:'0.85rem',color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'8px' }}>
            Describe Symptoms
          </label>
          <textarea
            className="input-control"
            rows={5}
            placeholder="e.g. My dog has been vomiting and has a slight fever since yesterday. Not eating and seems lethargic..."
            value={symptoms}
            onChange={e => { setSymptoms(e.target.value); setCharCount(e.target.value.length); }}
            style={{ resize:'vertical',fontSize:'0.95rem',lineHeight:1.6 }}
          />
          <div style={{ display:'flex',justifyContent:'space-between',marginTop:'6px' }}>
            <span style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>Be as descriptive as possible for better accuracy</span>
            <span style={{ fontSize:'0.75rem',color:charCount>20?'var(--brand-400)':'var(--text-muted)' }}>{charCount} chars</span>
          </div>
        </div>

        {/* Example prompts */}
        <div style={{ marginBottom:'20px' }}>
          <p style={{ fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'8px',fontWeight:600 }}>EXAMPLE PROMPTS — click to try:</p>
          <div style={{ display:'flex',flexWrap:'wrap',gap:'6px' }}>
            {EXAMPLE_PROMPTS.map((p,i) => (
              <button key={i} onClick={() => { setSymptoms(p); setCharCount(p.length); }} style={{ padding:'5px 10px',borderRadius:'999px',border:'1px solid var(--border-2)',background:'var(--surface-1)',color:'var(--text-muted)',fontSize:'0.75rem',cursor:'pointer',transition:'all 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--purple-400)'; e.currentTarget.style.color='var(--purple-400)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-muted)'; }}
              >
                {p.length > 50 ? p.substring(0, 50) + '...' : p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex',gap:'10px' }}>
          <button
            className="btn btn-primary"
            style={{ flex:1,padding:'13px',fontSize:'0.95rem' }}
            onClick={checkSymptoms}
            disabled={loading || !symptoms.trim() || symptoms.trim().length < 10}
          >
            {loading ? <><Loader2 size={18} style={{ animation:'spin-slow 1s linear infinite' }}/> Analyzing...</> : <><Send size={16}/> Analyze Symptoms</>}
          </button>
          {result && (
            <button onClick={() => { setResult(null); setSymptoms(''); setCharCount(0); }} className="btn btn-ghost" style={{ padding:'13px 16px' }}>
              <RefreshCw size={16}/>
            </button>
          )}
        </div>
      </div>

      {/* Result card */}
      {result && urgCfg && (
        <div className="glass-panel animate-scale-in" style={{ padding:'28px',borderColor:urgCfg.border }}>
          {/* Urgency banner */}
          <div style={{ padding:'10px 16px',borderRadius:'10px',background:urgCfg.bg,border:`1px solid ${urgCfg.border}`,marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px' }}>
            <AlertTriangle size={16} style={{ color:urgCfg.color,flexShrink:0 }}/>
            <span style={{ color:urgCfg.color,fontWeight:700,fontSize:'0.9rem' }}>{urgCfg.label}</span>
          </div>

          <h2 style={{ color:'var(--text-primary)',fontSize:'1.1rem',fontWeight:700,margin:'0 0 18px',display:'flex',alignItems:'center',gap:'8px' }}>
            <Sparkles size={18} style={{ color:'var(--purple-400)' }}/> AI Diagnosis Result
          </h2>

          <div style={{ display:'grid',gap:'14px' }}>
            {[
              { label:'Possible Condition', value:result.condition, color:'var(--text-primary)', big:true },
              { label:'Recommendation',     value:result.recommendation, color:'var(--text-secondary)' },
            ].map(item => (
              <div key={item.label} style={{ background:'var(--surface-1)',borderRadius:'10px',padding:'14px 16px' }}>
                <p style={{ margin:'0 0 4px',fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em' }}>{item.label}</p>
                <p style={{ margin:0,color:item.color,fontWeight:item.big?700:400,fontSize:item.big?'1.05rem':'0.9rem',lineHeight:1.5 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div style={{ marginTop:'20px',borderTop:'1px solid var(--border-1)',paddingTop:'16px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <p style={{ margin:0,fontSize:'0.8rem',color:'var(--text-muted)' }}>Was this helpful?</p>
            <div style={{ display:'flex',gap:'8px' }}>
              <button style={{ padding:'6px 14px',borderRadius:'8px',border:'1px solid var(--border-1)',background:'var(--surface-1)',color:'var(--brand-400)',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',fontSize:'0.8rem',fontWeight:600 }}>
                <ThumbsUp size={13}/> Yes
              </button>
              <button style={{ padding:'6px 14px',borderRadius:'8px',border:'1px solid var(--border-1)',background:'var(--surface-1)',color:'var(--text-muted)',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',fontSize:'0.8rem',fontWeight:600 }}>
                <ThumbsDown size={13}/> No
              </button>
            </div>
          </div>

          <p style={{ margin:'12px 0 0',fontSize:'0.75rem',color:'var(--text-muted)',background:'var(--surface-1)',padding:'8px 12px',borderRadius:'8px',borderLeft:'3px solid var(--border-2)' }}>
            ⚠️ <strong>Disclaimer:</strong> AI results are informational only. Always consult a certified veterinarian for official diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}

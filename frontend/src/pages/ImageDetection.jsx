import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  UploadCloud, Image as ImageIcon, Loader2, CheckCircle2,
  X, RefreshCw, Sparkles, AlertTriangle, Camera, ZoomIn
} from 'lucide-react';

const SUPPORTED_TYPES = ['skin rash', 'eye infection', 'wound', 'ear condition', 'swelling', 'dental issue'];

const SCAN_STEPS = [
  'Preprocessing image...',
  'Running computer vision model...',
  'Analyzing disease patterns...',
  'Generating diagnosis...',
];

export default function ImageDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingStep, setLoadingStep]   = useState(0);
  const [result, setResult]             = useState(null);
  const [isDragging, setIsDragging]     = useState(false);
  const dropRef = useRef(null);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file); setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true); setResult(null); setLoadingStep(0);

    // Animate steps
    SCAN_STEPS.forEach((_,i) => setTimeout(()=>setLoadingStep(i), i*900));

    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE}/api/ai/image-detection`, formData, { headers:{'Content-Type':'multipart/form-data'} });
      setResult(data.result);
    } catch { setResult({ detection:'Analysis unavailable', recommendation:'Please ensure the image is clear and try again.' }); }
    finally { setLoading(false); }
  };

  const reset = () => { setPreview(''); setSelectedFile(null); setResult(null); setLoadingStep(0); };

  return (
    <div className="animate-fade-in" style={{ maxWidth:'800px',margin:'0 auto',width:'100%' }}>

      {/* Header */}
      <div style={{ textAlign:'center',marginBottom:'2.5rem' }}>
        <div style={{ width:'72px',height:'72px',borderRadius:'20px',background:'linear-gradient(135deg,var(--accent-500),var(--purple-500))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.2rem',boxShadow:'0 0 30px var(--accent-glow)',animation:'float 4s ease-in-out infinite' }}>
          <ImageIcon size={32} color="white"/>
        </div>
        <h1 style={{ fontSize:'2rem',fontWeight:800,color:'var(--text-primary)',margin:'0 0 8px' }}>AI Image Disease Detection</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:'0.95rem',maxWidth:'480px',margin:'0 auto' }}>
          Upload a clear photo of your animal's skin, eye, ear, or wound. Our computer vision AI analyzes it instantly.
        </p>
        <div style={{ display:'flex',justifyContent:'center',gap:'8px',marginTop:'12px',flexWrap:'wrap' }}>
          {SUPPORTED_TYPES.map(t=><span key={t} className="badge badge-cyan" style={{ fontSize:'0.7rem' }}>{t}</span>)}
        </div>
      </div>

      {/* Upload area */}
      <div className="glass-panel" style={{ padding:'28px',marginBottom:'1.5rem' }}>
        {!preview ? (
          <div ref={dropRef}
            onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
            onDragLeave={()=>setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border:`2px dashed ${isDragging?'var(--brand-500)':'var(--border-2)'}`,
              borderRadius:'16px',
              padding:'4rem 2rem',
              textAlign:'center',
              cursor:'pointer',
              background:isDragging?'var(--primary-light)':'var(--surface-1)',
              transition:'all 0.3s ease',
            }}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display:'none' }} id="file-upload" />
            <label htmlFor="file-upload" style={{ cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
              <div style={{ width:'60px',height:'60px',borderRadius:'16px',background:'rgba(6,182,212,0.1)',border:'1px solid rgba(6,182,212,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <UploadCloud size={28} style={{ color:'var(--accent-400)' }}/>
              </div>
              <div>
                <h3 style={{ margin:'0 0 4px',fontSize:'1rem',fontWeight:700,color:'var(--text-primary)' }}>
                  {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
                </h3>
                <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-muted)' }}>Supports JPG, PNG, WEBP — Max 5MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div>
            {/* Image preview */}
            <div style={{ position:'relative',marginBottom:'20px',borderRadius:'14px',overflow:'hidden',maxHeight:'320px' }}>
              <img src={preview} alt="Preview" style={{ width:'100%',maxHeight:'320px',objectFit:'contain',background:'var(--surface-1)',display:'block' }} />
              <button onClick={reset} style={{ position:'absolute',top:'10px',right:'10px',background:'rgba(0,0,0,0.7)',border:'none',borderRadius:'50%',width:'30px',height:'30px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',backdropFilter:'blur(4px)' }}>
                <X size={14}/>
              </button>
              <div style={{ position:'absolute',bottom:'10px',left:'10px',background:'rgba(0,0,0,0.6)',borderRadius:'8px',padding:'4px 10px',fontSize:'0.75rem',color:'white',backdropFilter:'blur(4px)' }}>
                {selectedFile?.name}
              </div>
            </div>

            {/* Loading steps while scanning */}
            {loading && (
              <div style={{ marginBottom:'20px',background:'var(--surface-1)',borderRadius:'12px',padding:'16px' }}>
                {SCAN_STEPS.map((step,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:i<SCAN_STEPS.length-1?'10px':0 }}>
                    <div style={{ width:'20px',height:'20px',borderRadius:'50%',background:i<=loadingStep?'var(--brand-500)':'var(--surface-3)',border:`1px solid ${i<=loadingStep?'var(--brand-500)':'var(--border-2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.3s' }}>
                      {i<=loadingStep?<CheckCircle2 size={12} color="white"/>:null}
                    </div>
                    <span style={{ fontSize:'0.82rem',color:i<=loadingStep?'var(--brand-400)':'var(--text-muted)',fontWeight:i<=loadingStep?600:400,transition:'all 0.3s' }}>{step}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex',gap:'10px' }}>
              <button onClick={reset} className="btn btn-ghost" style={{ flex:1,padding:'12px' }}><RefreshCw size={15}/> Select Another</button>
              <button onClick={handleUpload} className="btn btn-primary" disabled={loading} style={{ flex:2,padding:'12px' }}>
                {loading ? <><Loader2 size={16} style={{ animation:'spin-slow 1s linear infinite' }}/> Scanning...</> : <><Sparkles size={16}/> Run AI Analysis</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="glass-panel animate-scale-in" style={{ padding:'28px',borderColor:'rgba(34,197,94,0.3)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px' }}>
            <div style={{ width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,var(--brand-500),var(--accent-500))',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <CheckCircle2 size={18} color="white"/>
            </div>
            <div>
              <h2 style={{ margin:0,fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)' }}>Analysis Complete</h2>
              <p style={{ margin:0,fontSize:'0.78rem',color:'var(--text-muted)' }}>Powered by computer vision AI</p>
            </div>
          </div>

          <div style={{ display:'grid',gap:'12px' }}>
            <div style={{ background:'var(--surface-1)',borderRadius:'10px',padding:'14px 16px',borderLeft:'3px solid var(--brand-500)' }}>
              <p style={{ margin:'0 0 4px',fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em' }}>AI Detection</p>
              <p style={{ margin:0,fontWeight:700,fontSize:'1.05rem',color:'var(--text-primary)' }}>{result.detection}</p>
            </div>
            <div style={{ background:'var(--surface-1)',borderRadius:'10px',padding:'14px 16px',borderLeft:'3px solid var(--accent-500)' }}>
              <p style={{ margin:'0 0 4px',fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em' }}>Recommended Action</p>
              <p style={{ margin:0,color:'var(--text-secondary)',fontSize:'0.9rem',lineHeight:1.5 }}>{result.recommendation}</p>
            </div>
          </div>

          <div style={{ marginTop:'16px',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'8px',padding:'10px 14px',display:'flex',alignItems:'flex-start',gap:'8px' }}>
            <AlertTriangle size={14} style={{ color:'#fbbf24',flexShrink:0,marginTop:'1px' }}/>
            <p style={{ margin:0,fontSize:'0.76rem',color:'var(--text-muted)',lineHeight:1.5 }}>
              <strong style={{ color:'#fbbf24' }}>Disclaimer:</strong> AI image analysis is not a substitute for professional veterinary diagnosis. Consult a vet before treatment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

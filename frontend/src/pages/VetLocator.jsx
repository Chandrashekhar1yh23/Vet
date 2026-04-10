import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Navigation, Clock, Star, AlertTriangle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const FALLBACK_CLINICS = [
  { id:1, name:'CityVet Emergency Hospital',    address:'14 Station Road, Andheri West, Mumbai', distance:'0.8 km', phone:'+91 22 2632 1100', hours:'24/7 Emergency', rating:4.8, emergency:true  },
  { id:2, name:'PetCare Animal Clinic',         address:'56 MG Road, Bangalore',                 distance:'1.2 km', phone:'+91 80 2225 6789', hours:'Mon-Sat 8AM-10PM', rating:4.6, emergency:false },
  { id:3, name:'Dr. Mehta Veterinary Centre',   address:'22 Gandhi Nagar, Pune',                  distance:'2.1 km', phone:'+91 20 2440 8877', hours:'Mon-Sun 9AM-8PM',  rating:4.5, emergency:false },
  { id:4, name:'Royal Animal Hospital',         address:'88 Park Street, Kolkata',               distance:'3.4 km', phone:'+91 33 2282 3344', hours:'24/7 Emergency',   rating:4.9, emergency:true  },
];

export default function VetLocator() {
  const [clinics, setClinics]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [userLocation, setUserLocation]   = useState(null);
  const [geoError, setGeoError]           = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchClinics(pos.coords.latitude, pos.coords.longitude);
        },
        () => { setGeoError(true); setLoading(false); setClinics(FALLBACK_CLINICS); }
      );
    } else {
      setGeoError(true); setLoading(false); setClinics(FALLBACK_CLINICS);
    }
  }, []);

  const fetchClinics = async (lat, lng) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/api/clinics/nearest?lat=${lat}&lng=${lng}`);
      setClinics(data.length ? data : FALLBACK_CLINICS);
    } catch { setClinics(FALLBACK_CLINICS); }
    finally { setLoading(false); }
  };

  const openMaps = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1100px',margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:'1.5rem' }}>
        <span className="badge badge-red" style={{ marginBottom:'6px' }}>🚨 Emergency</span>
        <h1 style={{ fontSize:'1.8rem',fontWeight:800,color:'var(--text-primary)',margin:'4px 0 4px' }}>Emergency Vet Locator</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:'0.9rem',margin:0 }}>Find the nearest emergency veterinary clinics based on your GPS location.</p>
      </div>

      {/* GPS status bar */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderRadius:'10px',background:geoError?'rgba(239,68,68,0.06)':'rgba(34,197,94,0.06)',border:`1px solid ${geoError?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)'}`,marginBottom:'1.5rem',flexWrap:'wrap',gap:'8px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          {geoError?<WifiOff size={16} style={{ color:'#fca5a5' }}/>:<Wifi size={16} style={{ color:'var(--brand-400)' }}/>}
          <span style={{ fontSize:'0.85rem',fontWeight:500,color:geoError?'#fca5a5':'var(--brand-400)' }}>
            {geoError ? 'Location access denied — showing sample clinics' : `GPS Active — ${userLocation?.lat.toFixed(3)}, ${userLocation?.lng.toFixed(3)}`}
          </span>
        </div>
        <button onClick={()=>{ setLoading(true); if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>fetchClinics(p.coords.latitude,p.coords.longitude)); }}
          style={{ display:'flex',alignItems:'center',gap:'5px',padding:'5px 12px',borderRadius:'8px',background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text-secondary)',cursor:'pointer',fontSize:'0.78rem',fontWeight:600 }}>
          <RefreshCw size={12}/> Refresh
        </button>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'380px 1fr',gap:'18px',alignItems:'start' }}>

        {/* Clinic list */}
        <div style={{ display:'flex',flexDirection:'column',gap:'12px',maxHeight:'calc(100vh - 280px)',overflowY:'auto',paddingRight:'4px' }}>
          {loading ? (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'4rem',gap:'12px' }}>
              <Loader2 size={28} style={{ color:'var(--brand-400)',animation:'spin-slow 1s linear infinite' }}/>
              <p style={{ color:'var(--text-muted)',fontSize:'0.875rem',margin:0 }}>Finding nearest clinics...</p>
            </div>
          ) : clinics.map(clinic => (
            <div key={clinic.id}
              className="glass-panel card-hover"
              onClick={() => setSelectedClinic(selectedClinic===clinic.id?null:clinic.id)}
              style={{ padding:'16px',cursor:'pointer',borderColor:selectedClinic===clinic.id?'var(--border-accent)':undefined,transition:'all 0.2s' }}
            >
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',gap:'8px' }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap',marginBottom:'2px' }}>
                    <h3 style={{ margin:0,fontSize:'0.9rem',fontWeight:700,color:'var(--text-primary)' }}>{clinic.name}</h3>
                    {clinic.emergency && <span className="badge badge-red" style={{ fontSize:'0.65rem',padding:'2px 6px' }}>24/7 ER</span>}
                  </div>
                  <p style={{ margin:0,fontSize:'0.78rem',color:'var(--text-muted)',display:'flex',alignItems:'flex-start',gap:'4px' }}>
                    <MapPin size={11} style={{ flexShrink:0,marginTop:'2px' }}/> {clinic.address}
                  </p>
                </div>
                <span style={{ background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',color:'var(--brand-400)',padding:'3px 8px',borderRadius:'999px',fontSize:'0.75rem',fontWeight:700,flexShrink:0 }}>
                  {clinic.distance}
                </span>
              </div>

              <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'3px' }}>
                  {[...Array(5)].map((_,i)=><Star key={i} size={11} fill={i<Math.floor(clinic.rating)?'#f59e0b':'none'} color={i<Math.floor(clinic.rating)?'#f59e0b':'var(--border-2)'}/>)}
                  <span style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginLeft:'3px' }}>{clinic.rating}</span>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:'4px',fontSize:'0.75rem',color:'var(--text-muted)' }}>
                  <Clock size={11}/> {clinic.hours}
                </div>
              </div>

              {/* Action buttons — always visible */}
              <div style={{ display:'flex',gap:'8px' }}>
                <button onClick={(e)=>{e.stopPropagation();openMaps(clinic.address);}} className="btn btn-primary" style={{ flex:1,padding:'8px',fontSize:'0.8rem',gap:'5px' }}>
                  <Navigation size={13}/> Directions
                </button>
                <button onClick={(e)=>{e.stopPropagation();window.location.href=`tel:${clinic.phone}`;}} style={{ flex:1,padding:'8px',borderRadius:'8px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#fca5a5',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                >
                  <Phone size={13}/> Call
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Map panel */}
        <div className="glass-panel" style={{ height:'calc(100vh - 280px)',minHeight:'420px',borderRadius:'16px',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-800)' }}>

          {/* Grid/map background pattern */}
          <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(34,197,94,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px' }}/>

          {/* Animated pings for clinics */}
          {clinics.slice(0,4).map((c,i)=>(
            <div key={c.id} style={{ position:'absolute',left:`${20+i*18}%`,top:`${25+i*12}%` }}>
              <div style={{ width:'16px',height:'16px',borderRadius:'50%',background:c.emergency?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)',border:`2px solid ${c.emergency?'#ef4444':'var(--brand-500)'}`,animation:'pulse-glow 2s ease infinite',animationDelay:`${i*0.5}s` }}/>
            </div>
          ))}

          {/* Center user dot */}
          {userLocation && (
            <div style={{ position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)' }}>
              <div style={{ width:'20px',height:'20px',borderRadius:'50%',background:'var(--accent-500)',border:'3px solid white',boxShadow:'0 0 20px var(--accent-glow)',zIndex:10,position:'relative' }}>
                <div style={{ position:'absolute',inset:'-8px',borderRadius:'50%',border:'2px solid rgba(6,182,212,0.3)',animation:'spin-slow 3s linear infinite' }}/>
              </div>
            </div>
          )}

          {/* Map overlay content */}
          <div style={{ position:'relative',textAlign:'center',zIndex:5,padding:'2rem' }}>
            <div style={{ width:'56px',height:'56px',borderRadius:'16px',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem' }}>
              <MapPin size={24} style={{ color:'var(--brand-400)' }}/>
            </div>
            <h3 style={{ color:'var(--text-primary)',marginBottom:'8px',fontWeight:700 }}>Interactive Map</h3>
            <p style={{ color:'var(--text-muted)',fontSize:'0.85rem',maxWidth:'240px',margin:'0 auto 16px' }}>
              {userLocation ? `Centered at your location (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)})` : 'Enable location access for precise clinic mapping'}
            </p>
            <button onClick={()=>window.open('https://www.google.com/maps/search/veterinary+clinic+near+me','_blank')}
              style={{ padding:'9px 18px',borderRadius:'10px',background:'linear-gradient(135deg,var(--brand-500),var(--accent-500))',border:'none',color:'white',cursor:'pointer',fontWeight:600,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'6px',margin:'0 auto',boxShadow:'0 4px 16px var(--brand-glow)' }}>
              <Navigation size={15}/> Open in Google Maps
            </button>
            <p style={{ color:'var(--text-muted)',fontSize:'0.72rem',marginTop:'12px' }}>
              Tip: Add Mapbox or Google Maps SDK key for full interactive map
            </p>
          </div>
        </div>

      </div>

      {/* Emergency banner */}
      <div style={{ marginTop:'18px',display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',borderRadius:'12px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={18} style={{ color:'#fca5a5',flexShrink:0 }}/>
        <div>
          <p style={{ margin:'0 0 2px',fontWeight:700,color:'#fca5a5',fontSize:'0.875rem' }}>In a life-threatening emergency?</p>
          <p style={{ margin:0,color:'var(--text-muted)',fontSize:'0.8rem' }}>Call the nearest 24/7 ER clinic directly or the national animal emergency helpline: <strong style={{ color:'var(--text-secondary)' }}>+91 1800-123-4567</strong></p>
        </div>
      </div>
    </div>
  );
}

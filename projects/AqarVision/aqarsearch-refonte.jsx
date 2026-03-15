import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AQARSEARCH — REFONTE COMPLÈTE
// Zinc Design System · Heatherwick Editorial · Zillow Search
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/* ── Theme tokens ─────────────────────────────────────────── */
const light = {
  bg:"#FAFAFA",s:"#FFFFFF",m:"#F4F4F5",el:"#FFFFFF",
  t1:"#09090B",t2:"#71717A",t3:"#A1A1AA",ti:"#FAFAFA",
  b:"#E4E4E7",bs:"#D4D4D8",
  ac:"#F59E0B",ach:"#D97706",acg:"rgba(245,158,11,0.08)",acgl:"rgba(245,158,11,0.15)",
  ok:"#22C55E",warn:"#F59E0B",err:"#EF4444",info:"#3B82F6",
  sale:"#3B82F6",rent:"#8B5CF6",vac:"#F59E0B",
  sh:"0 1px 3px rgba(0,0,0,0.04)",shh:"0 8px 25px rgba(0,0,0,0.08),0 4px 10px rgba(0,0,0,0.04)",shx:"0 20px 40px rgba(0,0,0,0.12)",
};
const dark = {
  bg:"#09090B",s:"#18181B",m:"#27272A",el:"#1F1F23",
  t1:"#FAFAFA",t2:"#A1A1AA",t3:"#71717A",ti:"#09090B",
  b:"#27272A",bs:"#3F3F46",
  ac:"#FBBF24",ach:"#F59E0B",acg:"rgba(251,191,36,0.08)",acgl:"rgba(251,191,36,0.12)",
  ok:"#22C55E",warn:"#FBBF24",err:"#EF4444",info:"#60A5FA",
  sale:"#60A5FA",rent:"#A78BFA",vac:"#FBBF24",
  sh:"0 1px 3px rgba(0,0,0,0.2)",shh:"0 8px 25px rgba(0,0,0,0.3),0 4px 10px rgba(0,0,0,0.2)",shx:"0 20px 40px rgba(0,0,0,0.4)",
};

/* ── Data ─────────────────────────────────────────────────── */
const WILAYAS = [
  {name:"Alger",count:3200,img:"https://images.unsplash.com/photo-1590059390104-0eaa0c381bcc?w=400&h=300&fit=crop"},
  {name:"Oran",count:2100,img:"https://images.unsplash.com/photo-1569074187119-c87815b476da?w=400&h=300&fit=crop"},
  {name:"Constantine",count:1800,img:"https://images.unsplash.com/photo-1553522991-71439aa58e61?w=400&h=300&fit=crop"},
  {name:"Annaba",count:900,img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"},
  {name:"Tizi Ouzou",count:750,img:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop"},
  {name:"Tipaza",count:620,img:"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop"},
  {name:"Béjaïa",count:580,img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"},
  {name:"Blida",count:540,img:"https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop"},
];

const LISTINGS = [
  {id:1,title:"F3 standing, vue panoramique",type:"Vente",prop:"Appartement",w:"Alger, Hydra",price:4500000,surface:120,rooms:3,baths:2,floor:3,img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",photos:12,featured:true},
  {id:2,title:"Villa contemporaine avec piscine",type:"Vente",prop:"Villa",w:"Alger, Chéraga",price:18000000,surface:280,rooms:5,baths:3,floor:null,img:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",photos:24,featured:true},
  {id:3,title:"F4 rénové, lumineux, centre-ville",type:"Vente",prop:"Appartement",w:"Oran, Centre",price:6200000,surface:140,rooms:4,baths:2,floor:5,img:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",photos:8,featured:true},
  {id:4,title:"Studio meublé, proche campus",type:"Location",prop:"Appartement",w:"Constantine",price:45000,surface:35,rooms:1,baths:1,floor:2,img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",photos:6,featured:false},
  {id:5,title:"Terrain constructible, vue mer",type:"Vente",prop:"Terrain",w:"Tipaza, Chenoua",price:8500000,surface:500,rooms:null,baths:null,floor:null,img:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",photos:4,featured:false},
  {id:6,title:"Local commercial, avenue principale",type:"Location",prop:"Commercial",w:"Annaba, Centre",price:120000,surface:85,rooms:null,baths:1,floor:0,img:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",photos:9,featured:false},
  {id:7,title:"F2 cosy avec terrasse",type:"Location",prop:"Appartement",w:"Alger, Bab Ezzouar",price:55000,surface:65,rooms:2,baths:1,floor:4,img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",photos:7,featured:false},
  {id:8,title:"Duplex F5 haut standing",type:"Vente",prop:"Appartement",w:"Alger, El Biar",price:14500000,surface:210,rooms:5,baths:3,floor:6,img:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",photos:18,featured:true},
];

const TYPES = [{label:"Acheter",val:"sale",icon:"🏠"},{label:"Louer",val:"rent",icon:"🔑"},{label:"Vacances",val:"vac",icon:"☀️"}];
const PROPS = ["Appartement","Villa","Terrain","Commercial","Bureau","Immeuble","Ferme","Entrepôt"];

const AGENTS = [
  {id:1,name:"Immobilière Plus",slug:"immo-plus",wilaya:"Alger",speciality:"Résidentiel haut standing",listings:124,sales:58,since:2015,verified:true,rating:4.8,reviews:86,logo:"I",color:"#F59E0B",agents:12,desc:"Spécialiste du résidentiel premium à Alger. Accompagnement personnalisé de A à Z."},
  {id:2,name:"Oran Immobilier",slug:"oran-immo",wilaya:"Oran",speciality:"Vente & Location",listings:89,sales:42,since:2018,verified:true,rating:4.6,reviews:54,logo:"O",color:"#3B82F6",agents:8,desc:"L'agence de référence à Oran pour la vente et la location de biens résidentiels et commerciaux."},
  {id:3,name:"Constantine Habitat",slug:"constantine-habitat",wilaya:"Constantine",speciality:"Neufs & VEFA",listings:67,sales:31,since:2020,verified:true,rating:4.7,reviews:38,logo:"C",color:"#8B5CF6",agents:6,desc:"Expert des programmes neufs et VEFA dans la région de Constantine."},
  {id:4,name:"Sahel Properties",slug:"sahel-props",wilaya:"Tipaza",speciality:"Bord de mer & Vacances",listings:45,sales:22,since:2019,verified:true,rating:4.9,reviews:29,logo:"S",color:"#22C55E",agents:4,desc:"Spécialiste des biens bord de mer à Tipaza, Cherchell et Chenoua."},
  {id:5,name:"DZ Invest",slug:"dz-invest",wilaya:"Alger",speciality:"Commercial & Investissement",listings:38,sales:15,since:2021,verified:false,rating:4.3,reviews:18,logo:"D",color:"#EF4444",agents:5,desc:"Conseil en investissement immobilier commercial et terrains constructibles."},
  {id:6,name:"Annaba Immo",slug:"annaba-immo",wilaya:"Annaba",speciality:"Résidentiel",listings:56,sales:28,since:2017,verified:true,rating:4.5,reviews:41,logo:"A",color:"#F59E0B",agents:7,desc:"Votre partenaire immobilier de confiance à Annaba et ses environs."},
  {id:7,name:"Kabylie Homes",slug:"kabylie-homes",wilaya:"Tizi Ouzou",speciality:"Villas & Terrains",listings:34,sales:19,since:2019,verified:true,rating:4.7,reviews:23,logo:"K",color:"#06B6D4",agents:3,desc:"Maisons traditionnelles et villas modernes en Kabylie."},
  {id:8,name:"Blida Résidence",slug:"blida-res",wilaya:"Blida",speciality:"Appartements neufs",listings:41,sales:20,since:2020,verified:false,rating:4.2,reviews:15,logo:"B",color:"#EC4899",agents:4,desc:"Programmes neufs et appartements de qualité dans la ville des Roses."},
];

/* ── Hooks ─────────────────────────────────────────────────── */
function useReveal(threshold=0.12){
  const ref=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el);}},{threshold});
    o.observe(el);return()=>o.disconnect();},[threshold]);
  return[ref,v];
}
function Reveal({children,delay=0,className="",style={}}){
  const[ref,v]=useReveal();
  return <div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:`opacity 0.7s cubic-bezier(.4,0,.2,1) ${delay}s, transform 0.7s cubic-bezier(.4,0,.2,1) ${delay}s`}} className={className}>{children}</div>;
}
function Counter({value,suffix=""}){
  const[c,setC]=useState(0);const[ref,v]=useReveal(0.5);
  useEffect(()=>{if(!v)return;let s=null;const d=1400;
    const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/d,1);setC(Math.floor((1-Math.pow(1-p,3))*value));if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);},[v,value]);
  return <span ref={ref}>{c.toLocaleString("fr-DZ")}{suffix}</span>;
}

function fmt(n){if(n>=1e6)return (n/1e6).toFixed(1).replace(".0","")+"M";if(n>=1e3)return Math.round(n/1e3)+"K";return n.toString();}
function fmtFull(n){return n.toLocaleString("fr-DZ");}

/* ── Icons (inline SVG) ──────────────────────────────────── */
const IC={
  search:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  heart:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  camera:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  x:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  chevDown:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>,
  arrowRight:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  sparkle:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  map:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  bed:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  bath:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3"/></svg>,
  ruler:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/></svg>,
  moon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  check:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>,
  alert:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>,
  phone:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  msg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  share:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>,
  plus:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  globe:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN APP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function AqarSearch(){
  const[dk,setDk]=useState(false);
  const[page,setPage]=useState("home"); // home | search | detail | agents | agent-detail
  const[detailId,setDetailId]=useState(1);
  const[agentId,setAgentId]=useState(1);
  const c=dk?dark:light;

  const goDetail=(id)=>{setDetailId(id);setPage("detail");window.scrollTo(0,0);};
  const goSearch=()=>{setPage("search");window.scrollTo(0,0);};
  const goHome=()=>{setPage("home");window.scrollTo(0,0);};
  const goAgents=()=>{setPage("agents");window.scrollTo(0,0);};
  const goAgentDetail=(id)=>{setAgentId(id);setPage("agent-detail");window.scrollTo(0,0);};

  return(
    <div style={{fontFamily:"'Geist','SF Pro Display',-apple-system,system-ui,sans-serif",background:c.bg,color:c.t1,minHeight:"100vh",fontSize:14,lineHeight:1.5,overflowX:"hidden"}}>

      {/* ── Header ── */}
      {page!=="home"&&(
        <header style={{position:"sticky",top:0,zIndex:100,background:dk?"rgba(9,9,11,0.88)":"rgba(255,255,255,0.88)",backdropFilter:"blur(16px) saturate(180%)",borderBottom:`1px solid ${c.b}`,height:56}}>
          <div style={{maxWidth:1320,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",height:"100%",gap:16}}>
            <button onClick={goHome} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:c.t1}}>
              <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${c.ac},${c.ach})`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#FFF",fontWeight:800,fontSize:13}}>A</span></div>
              <span style={{fontWeight:700,fontSize:16,letterSpacing:-0.5}}>AqarVision</span>
            </button>
            <nav style={{display:"flex",gap:4,marginLeft:24}}>
              {[{l:"Acheter",go:goSearch},{l:"Louer",go:goSearch},{l:"Agences",go:goAgents},{l:"Estimer",go:null}].map(n=><button key={n.l} onClick={n.go} style={{padding:"6px 14px",borderRadius:6,fontSize:13,fontWeight:(page==="agents"&&n.l==="Agences")||(page==="search"&&(n.l==="Acheter"||n.l==="Louer"))?600:500,background:(page==="agents"&&n.l==="Agences")?c.acg:"none",border:"none",color:(page==="agents"&&n.l==="Agences")?c.ac:c.t2,cursor:"pointer",transition:"all 0.15s"}}>{n.l}</button>)}
            </nav>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setDk(!dk)} style={{background:"none",border:"none",cursor:"pointer",color:c.t3,display:"flex"}}>{dk?IC.sun:IC.moon}</button>
              <span style={{fontSize:12,color:c.t3,display:"flex",alignItems:"center",gap:4}}>{IC.globe} FR</span>
              <div style={{width:32,height:32,borderRadius:"50%",background:c.acg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:c.ac}}>L</div>
            </div>
          </div>
        </header>
      )}

      {/* ── Pages ── */}
      <div key={page+detailId+agentId} style={{animation:"pageIn 0.35s ease"}}>
        {page==="home"&&<HomePage c={c} dk={dk} setDk={setDk} goSearch={goSearch} goDetail={goDetail} goAgents={goAgents}/>}
        {page==="search"&&<SearchPage c={c} dk={dk} goDetail={goDetail}/>}
        {page==="detail"&&<DetailPage c={c} dk={dk} listing={LISTINGS.find(l=>l.id===detailId)||LISTINGS[0]} goSearch={goSearch} goAgentDetail={goAgentDetail}/>}
        {page==="agents"&&<AgentsPage c={c} dk={dk} goAgentDetail={goAgentDetail}/>}
        {page==="agent-detail"&&<AgentDetailPage c={c} dk={dk} agent={AGENTS.find(a=>a.id===agentId)||AGENTS[0]} goAgents={goAgents} goDetail={goDetail}/>}
      </div>

      {/* ── Footer ── */}
      {page!=="search"&&page!=="agent-detail"&&(
        <footer style={{borderTop:`1px solid ${c.b}`,padding:"48px 24px",marginTop:page==="home"?0:48}}>
          <div style={{maxWidth:1320,margin:"0 auto",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:32}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:24,height:24,borderRadius:6,background:`linear-gradient(135deg,${c.ac},${c.ach})`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#FFF",fontWeight:800,fontSize:11}}>A</span></div>
                <span style={{fontWeight:700,fontSize:14}}>AqarVision</span>
              </div>
              <p style={{fontSize:12,color:c.t3,maxWidth:260}}>La plateforme immobilière de référence en Algérie. 58 wilayas, des milliers de biens.</p>
            </div>
            {[{t:"Explorer",links:["Acheter","Louer","Vacances","Agences","Estimer"]},{t:"Entreprise",links:["AqarPro","Tarifs","API","À propos"]},{t:"Support",links:["Centre d'aide","Contact","Conditions","Confidentialité"]}].map(col=>(
              <div key={col.t}>
                <p style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,color:c.t3,marginBottom:12}}>{col.t}</p>
                {col.links.map(l=><p key={l} style={{fontSize:13,color:c.t2,marginBottom:8,cursor:"pointer"}}>{l}</p>)}
              </div>
            ))}
          </div>
          <div style={{maxWidth:1320,margin:"32px auto 0",paddingTop:24,borderTop:`1px solid ${c.b}`,display:"flex",justifyContent:"space-between",fontSize:12,color:c.t3}}>
            <span>© 2026 AqarVision. Tous droits réservés.</span>
            <div style={{display:"flex",gap:16}}>{["🇩🇿 العربية","🇫🇷 Français","🇬🇧 English"].map(l=><span key={l} style={{cursor:"pointer"}}>{l}</span>)}</div>
          </div>
        </footer>
      )}

      <style>{`
        @keyframes pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}img{display:block}button{font-family:inherit}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:${c.bs};border-radius:3px}
        ::selection{background:${c.acg};color:${c.t1}}
      `}</style>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HOMEPAGE — Heatherwick Editorial
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HomePage({c,dk,setDk,goSearch,goDetail,goAgents}){
  const[sf,setSf]=useState(false);
  const[activeType,setActiveType]=useState("sale");
  const[headerSolid,setHeaderSolid]=useState(false);

  useEffect(()=>{
    const h=()=>setHeaderSolid(window.scrollY>80);
    window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);
  },[]);

  return(
    <>
      {/* Floating header */}
      <header style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:56,transition:"all 0.3s",
        background:headerSolid?(dk?"rgba(9,9,11,0.92)":"rgba(255,255,255,0.92)"):"transparent",
        backdropFilter:headerSolid?"blur(16px) saturate(180%)":"none",
        borderBottom:headerSolid?`1px solid ${dk?"rgba(39,39,42,0.5)":"rgba(228,228,231,0.5)"}`:undefined}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",height:"100%"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${c.ac},${c.ach})`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#FFF",fontWeight:800,fontSize:13}}>A</span></div>
            <span style={{fontWeight:700,fontSize:16,letterSpacing:-0.5,color:headerSolid?c.t1:"#FFF"}}>AqarVision</span>
          </div>
          <nav style={{display:"flex",gap:4,marginLeft:32}}>
            {[{l:"Acheter",go:goSearch},{l:"Louer",go:goSearch},{l:"Agences",go:goAgents}].map(n=><button key={n.l} onClick={n.go} style={{padding:"6px 14px",borderRadius:6,fontSize:13,fontWeight:500,background:"none",border:"none",color:headerSolid?c.t2:"rgba(255,255,255,0.7)",cursor:"pointer"}}>{n.l}</button>)}
          </nav>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setDk(!dk)} style={{background:"none",border:"none",cursor:"pointer",color:headerSolid?c.t3:"rgba(255,255,255,0.6)",display:"flex"}}>{dk?IC.sun:IC.moon}</button>
            <button style={{height:34,padding:"0 16px",borderRadius:7,fontSize:13,fontWeight:600,border:"none",cursor:"pointer",
              background:headerSolid?c.acg:"rgba(255,255,255,0.12)",color:headerSolid?c.ac:"#FFF",backdropFilter:"blur(4px)"}}>Se connecter</button>
          </div>
        </div>
      </header>

      {/* ── HERO 100vh ── */}
      <section style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        background:`linear-gradient(180deg,rgba(9,9,11,0.65) 0%,rgba(9,9,11,0.25) 40%,rgba(9,9,11,0.7) 100%),url('https://images.unsplash.com/photo-1590059390104-0eaa0c381bcc?w=1600&h=1000&fit=crop') center/cover`,
        padding:"80px 24px 60px"}}>
        <Reveal><h1 style={{color:"#FAFAFA",fontSize:"clamp(40px,8vw,80px)",fontWeight:700,lineHeight:1.05,textAlign:"center",letterSpacing:-3,maxWidth:750}}>Trouvez votre<br/><span style={{color:"#FBBF24"}}>chez-vous</span><br/>en Algérie</h1></Reveal>
        <Reveal delay={0.15}><p style={{color:"rgba(250,250,250,0.55)",fontSize:16,marginTop:16,textAlign:"center",fontWeight:400}}>Des milliers de biens à explorer dans les 58 wilayas</p></Reveal>

        {/* Transaction type pills */}
        <Reveal delay={0.25}>
          <div style={{display:"flex",gap:6,marginTop:28}}>
            {TYPES.map(tp=>(
              <button key={tp.val} onClick={()=>setActiveType(tp.val)} style={{
                padding:"8px 20px",borderRadius:50,fontSize:13,fontWeight:activeType===tp.val?600:400,border:"none",cursor:"pointer",
                background:activeType===tp.val?"#F59E0B":"rgba(255,255,255,0.1)",
                color:activeType===tp.val?"#FFF":"rgba(255,255,255,0.65)",
                backdropFilter:"blur(8px)",transition:"all 0.2s"
              }}>{tp.icon} {tp.label}</button>
            ))}
          </div>
        </Reveal>

        {/* Search bar */}
        <Reveal delay={0.4}>
          <div style={{marginTop:24,display:"flex",alignItems:"center",borderRadius:16,overflow:"hidden",width:"min(640px,92vw)",
            background:"rgba(255,255,255,0.97)",
            boxShadow:sf?"0 0 0 3px rgba(245,158,11,0.35),0 24px 48px rgba(0,0,0,0.2)":"0 24px 48px rgba(0,0,0,0.15)",transition:"box-shadow 0.3s"}}>
            <div style={{padding:"0 16px",display:"flex",alignItems:"center",color:"#A1A1AA"}}>{IC.search}</div>
            <input onFocus={()=>setSf(true)} onBlur={()=>setSf(false)} placeholder="Wilaya, quartier, ou décrivez votre recherche..." style={{flex:1,height:56,border:"none",outline:"none",fontSize:15,background:"transparent",color:"#09090B"}}/>
            <button onClick={goSearch} style={{height:56,padding:"0 28px",background:"#F59E0B",border:"none",color:"#FFF",fontWeight:600,fontSize:14,cursor:"pointer",transition:"background 0.15s"}}
              onMouseEnter={e=>e.target.style.background="#D97706"} onMouseLeave={e=>e.target.style.background="#F59E0B"}>Rechercher</button>
          </div>
        </Reveal>

        <Reveal delay={0.55}>
          <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:16}}>Essayez : "F3 lumineux Alger &lt; 5M" · "Villa avec piscine Oran" · "Proche école, calme"</p>
        </Reveal>

        <div style={{position:"absolute",bottom:28,animation:"bounce 2.5s ease infinite"}}>
          {IC.chevDown}
        </div>
      </section>

      {/* ── SPLIT EDITORIAL ── */}
      <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:"70vh"}}>
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"64px clamp(32px,5vw,80px)"}}>
          <Reveal>
            <p style={{fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:2,color:c.ac,marginBottom:16}}>Explorer</p>
            <h2 style={{fontSize:"clamp(28px,4vw,52px)",fontWeight:700,lineHeight:1.08,letterSpacing:-1.5}}>Plus de 15 000 biens<br/>dans <span style={{color:c.ac}}>58 wilayas</span></h2>
          </Reveal>
          <Reveal delay={0.15}><p style={{marginTop:20,color:c.t2,fontSize:16,lineHeight:1.7,maxWidth:420}}>Des appartements au cœur d'Alger aux villas de bord de mer à Tipaza, trouvez le bien qui correspond à votre projet de vie.</p></Reveal>
          <Reveal delay={0.25}><button onClick={goSearch} style={{marginTop:28,display:"inline-flex",alignItems:"center",gap:8,background:"none",border:"none",color:c.ac,fontWeight:600,fontSize:14,cursor:"pointer"}}>Explorer les annonces {IC.arrowRight}</button></Reveal>
        </div>
        <div style={{position:"relative",minHeight:400,overflow:"hidden"}}>
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=700&fit=crop" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
      </section>

      {/* ── WILAYAS SCROLL ── */}
      <section style={{padding:"64px 0"}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 24px"}}>
          <Reveal><h2 style={{fontSize:28,fontWeight:700,letterSpacing:-0.5,marginBottom:8}}>Explorez par région</h2></Reveal>
          <Reveal delay={0.1}><p style={{color:c.t3,fontSize:14,marginBottom:28}}>Les wilayas les plus recherchées</p></Reveal>
        </div>
        <div style={{display:"flex",gap:12,overflowX:"auto",padding:"0 24px 16px",scrollSnapType:"x mandatory",scrollbarWidth:"none"}}>
          {WILAYAS.map((w,i)=>(
            <Reveal key={w.name} delay={i*0.05} style={{flexShrink:0,scrollSnapAlign:"start"}}>
              <div onClick={goSearch} style={{width:200,borderRadius:12,overflow:"hidden",cursor:"pointer",position:"relative",border:`1px solid ${c.b}`,background:c.s,transition:"all 0.25s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=c.shh}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
                <div style={{height:130,overflow:"hidden"}}>
                  <img src={w.img} alt={w.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <p style={{fontWeight:600,fontSize:14}}>{w.name}</p>
                  <p style={{fontSize:12,color:c.t3,marginTop:2}}>{w.count.toLocaleString()} annonces</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section style={{padding:"32px 24px 64px",maxWidth:1320,margin:"0 auto"}}>
        <Reveal>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
            <div><h2 style={{fontSize:28,fontWeight:700,letterSpacing:-0.5}}>Les plus consultés</h2><p style={{color:c.t3,fontSize:14,marginTop:4}}>Cette semaine sur AqarVision</p></div>
            <button onClick={goSearch} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:`1px solid ${c.b}`,background:"none",color:c.t2,fontSize:13,fontWeight:500,cursor:"pointer"}}>Voir tout {IC.arrowRight}</button>
          </div>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {LISTINGS.filter(l=>l.featured).map((l,i)=>(<Reveal key={l.id} delay={i*0.08}><ListingCard l={l} c={c} dk={dk} onClick={()=>goDetail(l.id)}/></Reveal>))}
        </div>
      </section>

      {/* ── FULL-BLEED PHOTO + STATEMENT ── */}
      <section style={{position:"relative",height:"60vh",overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 30%,rgba(9,9,11,0.8))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,padding:"clamp(24px,4vw,64px)"}}>
          <Reveal><h2 style={{fontSize:"clamp(24px,4vw,48px)",fontWeight:700,color:"#FAFAFA",lineHeight:1.1,letterSpacing:-1,maxWidth:550}}>Chaque quartier<br/>a son <span style={{color:"#FBBF24"}}>caractère</span></h2></Reveal>
          <Reveal delay={0.15}><button onClick={goSearch} style={{marginTop:16,display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:"#FBBF24",fontWeight:600,fontSize:14,cursor:"pointer"}}>Rechercher par quartier {IC.arrowRight}</button></Reveal>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{background:dk?"#18181B":"#09090B",padding:"80px 24px"}}>
        <Reveal><h2 style={{textAlign:"center",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:"#FAFAFA",lineHeight:1.12,marginBottom:48}}>La confiance de milliers<br/>de familles algériennes</h2></Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,maxWidth:800,margin:"0 auto"}}>
          {[{v:15000,l:"annonces",s:"+"},{v:58,l:"wilayas",s:""},{v:2500,l:"agences vérifiées",s:"+"},{v:98,l:"satisfaction",s:"%"}].map((s,i)=>(
            <Reveal key={s.l} delay={i*0.1}><div style={{textAlign:"center"}}>
              <div style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:700,color:"#FBBF24",fontVariantNumeric:"tabular-nums"}}><Counter value={s.v} suffix={s.s}/></div>
              <div style={{fontSize:13,color:"#A1A1AA",marginTop:4}}>{s.l}</div>
            </div></Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA PRO ── */}
      <section style={{padding:"80px 24px",textAlign:"center"}}>
        <Reveal>
          <p style={{fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:2,color:c.ac,marginBottom:16}}>Pour les professionnels</p>
          <h2 style={{fontSize:"clamp(24px,4vw,44px)",fontWeight:700,lineHeight:1.1,letterSpacing:-1}}>Gérez votre agence<br/>avec <span style={{color:c.ac}}>AqarPro</span></h2>
          <p style={{color:c.t2,marginTop:16,fontSize:15,maxWidth:480,margin:"16px auto 0"}}>Dashboard, CRM, analytics, vitrine personnalisée, IA intégrée. Tout ce dont votre agence a besoin.</p>
          <button style={{marginTop:32,height:48,padding:"0 36px",borderRadius:10,background:c.ac,border:"none",color:"#FFF",fontWeight:600,fontSize:15,cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>e.target.style.transform="translateY(-2px)"} onMouseLeave={e=>e.target.style.transform="translateY(0)"}>Découvrir AqarPro →</button>
        </Reveal>
      </section>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SEARCH PAGE — Listings-first, carte en toggle
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SearchPage({c,dk,goDetail}){
  const filters=["Alger","Vente","< 10M DA","F3+"];
  const[view,setView]=useState("list"); // "list" | "map"
  const[mapTool,setMapTool]=useState(0);
  const[hoveredId,setHoveredId]=useState(null);
  const[sort,setSort]=useState("recent");
  const pins=[{id:1,top:"22%",left:"28%",price:"4.5M"},{id:2,top:"38%",left:"52%",price:"18M"},{id:3,top:"55%",left:"34%",price:"6.2M"},{id:4,top:"30%",left:"68%",price:"45K"},{id:7,top:"48%",left:"72%",price:"55K"},{id:8,top:"65%",left:"55%",price:"14.5M"}];

  const listIcon=<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  const mapIcon=IC.map;

  return(
    <div style={{minHeight:"calc(100vh - 57px)"}}>
      {/* ── Search bar + filters + view toggle ── */}
      <div style={{borderBottom:`1px solid ${c.b}`,padding:"12px 24px",background:c.s}}>
        <div style={{maxWidth:1320,margin:"0 auto"}}>
          {/* Row 1: Search input */}
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1,padding:"9px 14px",borderRadius:10,border:`1px solid ${c.b}`,background:c.bg,transition:"border-color 0.2s"}}
              onFocus={e=>e.currentTarget.style.borderColor=c.ac} onBlur={e=>e.currentTarget.style.borderColor=c.b}>
              <span style={{color:c.t3,display:"flex"}}>{IC.search}</span>
              <input placeholder="Wilaya, quartier, ou décrivez votre recherche..." style={{flex:1,border:"none",outline:"none",fontSize:13,background:"transparent",color:c.t1}}/>
              <span style={{color:c.ac,display:"flex",cursor:"pointer"}} title="Recherche IA">{IC.sparkle}</span>
            </div>
            {/* View toggle */}
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${c.b}`,flexShrink:0}}>
              <button onClick={()=>setView("list")} style={{
                padding:"8px 14px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500,
                background:view==="list"?c.acg:"transparent",color:view==="list"?c.ac:c.t3,transition:"all 0.15s",
              }}>{listIcon} Annonces</button>
              <button onClick={()=>setView("map")} style={{
                padding:"8px 14px",border:"none",borderLeft:`1px solid ${c.b}`,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500,
                background:view==="map"?c.acg:"transparent",color:view==="map"?c.ac:c.t3,transition:"all 0.15s",
              }}>{mapIcon} Carte</button>
            </div>
          </div>
          {/* Row 2: Active filters + count */}
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {filters.map(f=>(
              <span key={f} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:50,fontSize:12,fontWeight:500,background:c.acg,color:c.ac,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=c.acgl} onMouseLeave={e=>e.currentTarget.style.background=c.acg}>
                {f} <span style={{opacity:0.5}}>{IC.x}</span>
              </span>
            ))}
            <button style={{padding:"4px 12px",borderRadius:50,fontSize:12,fontWeight:500,border:`1px dashed ${c.bs}`,background:"transparent",color:c.t3,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              {IC.plus} Filtres
            </button>
            <span style={{fontSize:12,color:c.t3,marginLeft:"auto",fontVariantNumeric:"tabular-nums",fontWeight:500}}>247 résultats</span>
          </div>
        </div>
      </div>

      {/* ── VIEW: LIST (full width, focus on listings) ── */}
      {view==="list"&&(
        <div style={{maxWidth:1320,margin:"0 auto",padding:"20px 24px",animation:"pageIn 0.3s ease"}}>
          {/* Sort bar */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",gap:4}}>
              {[{k:"recent",l:"Plus récents"},{k:"price_asc",l:"Prix ↑"},{k:"price_desc",l:"Prix ↓"},{k:"surface",l:"Surface ↓"}].map(s=>(
                <button key={s.k} onClick={()=>setSort(s.k)} style={{
                  padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:sort===s.k?600:400,border:"none",cursor:"pointer",
                  background:sort===s.k?c.acg:"transparent",color:sort===s.k?c.ac:c.t3,transition:"all 0.15s",
                }}>{s.l}</button>
              ))}
            </div>
            <button onClick={()=>setView("map")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${c.b}`,background:"transparent",color:c.t2,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=c.ac;e.currentTarget.style.color=c.ac}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.b;e.currentTarget.style.color=c.t2}}>
              {mapIcon} Voir sur la carte
            </button>
          </div>
          {/* Listings grid — 3 columns full width */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {LISTINGS.map((l,i)=>(
              <div key={l.id} style={{animation:`slideUp 0.35s ease ${i*0.04}s both`}}>
                <ListingCard l={l} c={c} dk={dk} onClick={()=>goDetail(l.id)}/>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div style={{display:"flex",justifyContent:"center",gap:4,padding:"32px 0 16px"}}>
            {[1,2,3,"...",12].map((p,i)=>(
              <button key={i} style={{width:38,height:38,borderRadius:8,border:`1px solid ${p===1?c.ac:c.b}`,background:p===1?c.acg:"transparent",color:p===1?c.ac:c.t2,fontSize:13,fontWeight:p===1?600:400,cursor:"pointer",transition:"all 0.15s"}}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW: MAP (full screen carte with floating cards) ── */}
      {view==="map"&&(
        <div style={{position:"relative",height:"calc(100vh - 145px)",background:dk?"#1A1A1E":"#E8E8EC",animation:"pageIn 0.3s ease"}}>
          {/* Draw toolbar */}
          <div style={{position:"absolute",top:12,left:12,zIndex:20,display:"flex",borderRadius:10,background:dk?"rgba(24,24,27,0.94)":"rgba(255,255,255,0.96)",border:`1px solid ${c.b}`,overflow:"hidden",backdropFilter:"blur(12px)",boxShadow:c.sh}}>
            {["Déplacer","Dessiner","Heatmap","Reset"].map((tool,i)=>(
              <button key={tool} onClick={()=>setMapTool(i)} style={{padding:"9px 14px",fontSize:11,fontWeight:mapTool===i?600:400,border:"none",cursor:"pointer",
                background:mapTool===i?c.acg:"transparent",color:mapTool===i?c.ac:c.t3,transition:"all 0.15s"}}>{tool}</button>
            ))}
          </div>

          {/* Back to list button */}
          <div style={{position:"absolute",top:12,right:12,zIndex:20}}>
            <button onClick={()=>setView("list")} style={{
              display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",
              background:dk?"rgba(24,24,27,0.94)":"rgba(255,255,255,0.96)",border:`1px solid ${c.b}`,color:c.t1,backdropFilter:"blur(12px)",boxShadow:c.sh,transition:"all 0.15s",
            }} onMouseEnter={e=>e.currentTarget.style.borderColor=c.ac} onMouseLeave={e=>e.currentTarget.style.borderColor=c.b}>
              {listIcon} Voir les annonces
            </button>
          </div>

          {/* Zoom controls */}
          <div style={{position:"absolute",bottom:16,right:16,zIndex:20,display:"flex",flexDirection:"column",borderRadius:8,overflow:"hidden",border:`1px solid ${c.b}`,background:dk?"rgba(24,24,27,0.94)":"rgba(255,255,255,0.96)",backdropFilter:"blur(8px)"}}>
            <button style={{width:38,height:38,border:"none",borderBottom:`1px solid ${c.b}`,background:"transparent",color:c.t2,fontSize:18,cursor:"pointer"}}>+</button>
            <button style={{width:38,height:38,border:"none",background:"transparent",color:c.t2,fontSize:18,cursor:"pointer"}}>−</button>
          </div>

          {/* Map background */}
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:14,color:c.t3,display:"flex",alignItems:"center",gap:8}}>{IC.map} MapLibre GL</span>
          </div>

          {/* Price pins */}
          {pins.map(pin=>{
            const active=hoveredId===pin.id;
            return(
              <div key={pin.id} onClick={()=>goDetail(pin.id)} style={{
                position:"absolute",top:pin.top,left:pin.left,zIndex:active?30:10,
                padding:"5px 12px",borderRadius:8,cursor:"pointer",
                background:active?c.ac:"#09090B",color:active?"#FFF":"#FBBF24",
                fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",
                boxShadow:"0 2px 12px rgba(0,0,0,0.35)",
                transform:active?"scale(1.25)":"scale(1)",transition:"all 0.2s cubic-bezier(.34,1.56,.64,1)",
              }} onMouseEnter={()=>setHoveredId(pin.id)} onMouseLeave={()=>setHoveredId(null)}>
                {pin.price}
                <div style={{position:"absolute",bottom:-5,left:"50%",marginLeft:-5,width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`5px solid ${active?c.ac:"#09090B"}`}}/>
              </div>
            );
          })}

          {/* Floating listing cards at bottom — horizontal scroll */}
          <div style={{position:"absolute",bottom:16,left:0,right:60,zIndex:20,display:"flex",gap:12,overflowX:"auto",padding:"0 16px",scrollSnapType:"x mandatory",scrollbarWidth:"none"}}>
            {LISTINGS.slice(0,5).map(l=>(
              <div key={l.id} onClick={()=>goDetail(l.id)} onMouseEnter={()=>setHoveredId(l.id)} onMouseLeave={()=>setHoveredId(null)}
                style={{
                  flexShrink:0,scrollSnapAlign:"start",width:280,borderRadius:12,overflow:"hidden",cursor:"pointer",
                  background:dk?"rgba(24,24,27,0.96)":"rgba(255,255,255,0.97)",
                  border:`1px solid ${hoveredId===l.id?c.ac:c.b}`,backdropFilter:"blur(12px)",
                  boxShadow:"0 8px 32px rgba(0,0,0,0.15)",
                  transform:hoveredId===l.id?"translateY(-4px)":"translateY(0)",transition:"all 0.25s",
                }}>
                <div style={{height:110,overflow:"hidden",position:"relative"}}>
                  <img src={l.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <span style={{position:"absolute",top:6,right:6,padding:"2px 7px",borderRadius:50,fontSize:10,fontWeight:600,background:l.type==="Vente"?c.sale:c.rent,color:"#FFF"}}>{l.type}</span>
                </div>
                <div style={{padding:"10px 12px"}}>
                  <p style={{fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:c.t1}}>{l.title}</p>
                  <p style={{fontSize:11,color:c.t3,marginTop:2}}>{l.w}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:15,fontWeight:700,fontVariantNumeric:"tabular-nums",color:c.t1}}>{fmt(l.price)} DA</span>
                    {l.surface&&<span style={{fontSize:11,color:c.t3}}>{l.surface} m²</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DETAIL PAGE — Zillow + Bayut + AI Augmented
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DetailPage({c,dk,listing:l,goSearch,goAgentDetail}){
  const[aiOpen,setAiOpen]=useState(true);
  const[favd,setFavd]=useState(false);
  const[activePhoto,setActivePhoto]=useState(0);
  const photos=[l.img,
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop",
  ];
  const equips=["Ascenseur","Parking","Balcon","Climatisation","Interphone","Gardien","Chauffage"];
  const typeColor=l.type==="Vente"?c.sale:l.type==="Location"?c.rent:c.vac;

  return(
    <>
      {/* Photo hero full-bleed */}
      <section style={{position:"relative",height:"55vh",overflow:"hidden",background:c.m}}>
        <img src={photos[activePhoto]} alt={l.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity 0.3s"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%,rgba(0,0,0,0.5))"}}/>
        {/* Actions top-right */}
        <div style={{position:"absolute",top:16,right:16,display:"flex",gap:8}}>
          <button onClick={()=>setFavd(!favd)} style={{width:40,height:40,borderRadius:10,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            background:favd?"#EF4444":"rgba(0,0,0,0.35)",color:"#FFF",backdropFilter:"blur(8px)",transition:"all 0.2s",transform:favd?"scale(1.1)":"scale(1)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={favd?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button style={{width:40,height:40,borderRadius:10,background:"rgba(0,0,0,0.35)",border:"none",cursor:"pointer",color:"#FFF",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>{IC.share}</button>
        </div>
        {/* Thumbnail strip */}
        <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
          {photos.map((p,i)=>(
            <button key={i} onClick={()=>setActivePhoto(i)} style={{width:64,height:44,borderRadius:8,overflow:"hidden",border:activePhoto===i?"2px solid #FBBF24":"2px solid rgba(255,255,255,0.25)",cursor:"pointer",opacity:activePhoto===i?1:0.7,transition:"all 0.2s"}}>
              <img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </button>
          ))}
          <button style={{width:64,height:44,borderRadius:8,background:"rgba(0,0,0,0.5)",border:"2px solid rgba(255,255,255,0.15)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:12,fontWeight:600,cursor:"pointer",gap:4}}>
            {IC.camera} {l.photos}
          </button>
        </div>
      </section>

      {/* Content */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px 64px",display:"grid",gridTemplateColumns:"1fr 360px",gap:36}}>
        {/* Main column */}
        <div>
          {/* Breadcrumb */}
          <div style={{fontSize:12,color:c.t3,marginBottom:14,display:"flex",gap:6,alignItems:"center"}}>
            <span style={{cursor:"pointer"}} onClick={goSearch}>Annonces</span><span>›</span><span>{l.w.split(",")[0]}</span><span>›</span><span style={{color:c.t2}}>{l.title.substring(0,30)}...</span>
          </div>
          {/* Badges */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <span style={{padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:600,background:typeColor,color:"#FFF"}}>{l.type}</span>
            <span style={{padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:500,background:c.m,color:c.t2}}>{l.prop}</span>
          </div>
          {/* Title */}
          <h1 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:700,letterSpacing:-0.5,lineHeight:1.2}}>{l.title}</h1>
          <p style={{fontSize:13,color:c.t3,marginTop:4,display:"flex",alignItems:"center",gap:4}}><span style={{color:c.t2}}>{IC.map}</span> {l.w} · Réf: AQR-00{l.id}47</p>

          {/* Price */}
          <div style={{marginTop:20,display:"flex",alignItems:"baseline",gap:12}}>
            <span style={{fontSize:34,fontWeight:700,fontVariantNumeric:"tabular-nums",letterSpacing:-1}}>{fmtFull(l.price)} DA</span>
            {l.surface&&<span style={{fontSize:14,color:c.t3,fontVariantNumeric:"tabular-nums"}}>{fmtFull(Math.round(l.price/l.surface))} DA/m²</span>}
          </div>

          {/* Key facts */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,marginTop:24,borderRadius:12,overflow:"hidden",border:`1px solid ${c.b}`}}>
            {[
              {icon:"⊞",label:"Surface",val:`${l.surface} m²`},
              {icon:"🛏",label:"Pièces",val:l.rooms||"—"},
              {icon:"🚿",label:"SDB",val:l.baths||"—"},
              {icon:"↕",label:"Étage",val:l.floor!==null?`${l.floor}e`:"—"},
            ].map((f,i)=>(
              <div key={f.label} style={{textAlign:"center",padding:"18px 12px",background:c.s,borderRight:i<3?`1px solid ${c.b}`:undefined}}>
                <div style={{fontSize:22,marginBottom:4}}>{f.icon}</div>
                <div style={{fontSize:11,color:c.t3,marginBottom:2}}>{f.label}</div>
                <div style={{fontSize:16,fontWeight:600}}>{f.val}</div>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div style={{marginTop:24,borderRadius:14,overflow:"hidden",border:`1px solid ${dk?"rgba(251,191,36,0.12)":"rgba(245,158,11,0.18)"}`,background:dk?"rgba(251,191,36,0.03)":"rgba(245,158,11,0.02)"}}>
            <button onClick={()=>setAiOpen(!aiOpen)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",border:"none",background:"transparent",cursor:"pointer",color:c.t1}}>
              <span style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:600}}>
                <span style={{color:c.ac}}>{IC.sparkle}</span> Résumé IA
              </span>
              <span style={{color:c.t3,transform:aiOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>{IC.chevDown}</span>
            </button>
            {aiOpen&&(
              <div style={{padding:"0 20px 20px",borderTop:`1px solid ${dk?"rgba(251,191,36,0.08)":"rgba(245,158,11,0.08)"}`,animation:"slideUp 0.3s ease"}}>
                <p style={{fontSize:13,lineHeight:1.75,color:c.t2,marginTop:16}}>
                  {l.prop} {l.rooms&&`F${l.rooms}`} bien situé à {l.w} avec vue panoramique dégagée. Surface correcte pour le quartier. Prix légèrement au-dessus de la médiane du secteur (+8%). Idéal pour une famille — deux écoles à moins de 500m.
                </p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:20}}>
                  <div>
                    <p style={{fontSize:11,fontWeight:600,color:c.ok,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Points forts</p>
                    {["Vue dégagée panoramique","2 écoles à < 500m","Parking inclus","Quartier calme"].map(p=>(
                      <div key={p} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:c.t2,padding:"4px 0"}}><span style={{color:c.ok}}>{IC.check}</span> {p}</div>
                    ))}
                  </div>
                  <div>
                    <p style={{fontSize:11,fontWeight:600,color:c.warn,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Points d'attention</p>
                    {["Prix > médiane quartier (+8%)","Pas d'ascenseur","4ème étage sans ascenseur"].map(p=>(
                      <div key={p} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:c.t2,padding:"4px 0"}}><span style={{color:c.warn}}>{IC.alert}</span> {p}</div>
                    ))}
                  </div>
                </div>
                <div style={{marginTop:20,padding:"14px 16px",borderRadius:10,background:dk?c.m:c.m}}>
                  <p style={{fontSize:11,fontWeight:600,color:c.t2,marginBottom:8}}>💬 Questions à poser à l'agence</p>
                  {["Charges mensuelles de copropriété ?","Date de disponibilité exacte ?","Possibilité de négociation sur le prix ?"].map(q=>(
                    <p key={q} style={{fontSize:12,color:c.t2,padding:"3px 0"}}>• {q}</p>
                  ))}
                </div>
                <p style={{fontSize:10,color:c.t3,marginTop:14}}>Généré par IA · Peut contenir des approximations</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{marginTop:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:10}}>Description</h3>
            <p style={{fontSize:14,lineHeight:1.8,color:c.t2}}>
              Magnifique {l.prop.toLowerCase()} {l.rooms&&`F${l.rooms}`} situé dans un quartier résidentiel prisé de {l.w}. 
              L'appartement offre de beaux volumes, une luminosité exceptionnelle grâce à sa double exposition, et une vue panoramique dégagée. 
              Il comprend un séjour spacieux, {l.rooms} chambres, {l.baths} salles de bain, une cuisine équipée et un balcon. 
              Place de parking en sous-sol incluse. Résidence sécurisée avec gardien.
            </p>
          </div>

          {/* Equipments */}
          <div style={{marginTop:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Équipements</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {equips.map(e=>(
                <span key={e} style={{padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:500,background:c.acg,color:c.ac,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:c.ok}}>{IC.check}</span> {e}
                </span>
              ))}
            </div>
          </div>

          {/* Proximity map placeholder */}
          <div style={{marginTop:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>📍 Autour de ce bien</h3>
            <div style={{height:220,borderRadius:12,overflow:"hidden",border:`1px solid ${c.b}`,background:dk?"#1A1A1E":"#E8E8EC",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:13,color:c.t3}}>{IC.map} Carte de proximité</span>
              <div style={{position:"absolute",bottom:12,left:12,display:"flex",gap:6}}>
                {["🏫 Écoles (3)","🕌 Mosquées (2)","🛒 Commerces (5)","🚌 Transport (2)"].map(cat=>(
                  <span key={cat} style={{padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:500,background:dk?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.9)",color:c.t2,backdropFilter:"blur(4px)"}}>{cat}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Similar */}
          <div style={{marginTop:32}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Biens similaires</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {LISTINGS.filter(x=>x.id!==l.id).slice(0,3).map(sl=>(<ListingCard key={sl.id} l={sl} c={c} dk={dk} onClick={()=>{}} compact/>))}
            </div>
          </div>
        </div>

        {/* Sidebar sticky */}
        <div style={{position:"sticky",top:72,alignSelf:"start",display:"flex",flexDirection:"column",gap:12}}>
          {/* Agency card */}
          <div style={{padding:20,borderRadius:14,border:`1px solid ${c.b}`,background:c.s}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:48,height:48,borderRadius:12,background:`linear-gradient(135deg,${c.ac},${c.ach})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontWeight:700,fontSize:20}}>I</div>
              <div>
                <p style={{fontWeight:600,fontSize:14}}>Immobilière Plus</p>
                <p style={{fontSize:12,color:c.ac,display:"flex",alignItems:"center",gap:4}}>{IC.check} Agence vérifiée</p>
              </div>
            </div>
            <button style={{width:"100%",height:44,borderRadius:10,background:dk?"#FAFAFA":"#09090B",color:dk?"#09090B":"#FAFAFA",border:"none",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8,transition:"all 0.15s"}}
              onMouseEnter={e=>e.target.style.opacity="0.85"} onMouseLeave={e=>e.target.style.opacity="1"}>
              {IC.phone} Appeler
            </button>
            <button style={{width:"100%",height:44,borderRadius:10,background:c.m,color:c.t1,border:`1px solid ${c.b}`,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12,transition:"all 0.15s"}}>
              {IC.msg} Envoyer un message
            </button>
            <button onClick={()=>goAgentDetail(1)} style={{width:"100%",fontSize:12,color:c.t2,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Voir la vitrine →</button>
          </div>

          {/* Add to project */}
          <button style={{width:"100%",height:44,borderRadius:10,border:`1px dashed ${c.bs}`,background:"transparent",color:c.t3,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=c.ac;e.currentTarget.style.color=c.ac;e.currentTarget.style.background=c.acg}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=c.bs;e.currentTarget.style.color=c.t3;e.currentTarget.style.background="transparent"}}>
            {IC.plus} Ajouter à un projet
          </button>

          {/* Mortgage calculator mini */}
          <div style={{padding:16,borderRadius:14,border:`1px solid ${c.b}`,background:c.s}}>
            <p style={{fontSize:13,fontWeight:600,marginBottom:12}}>💰 Simulation rapide</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
              <div><span style={{color:c.t3}}>Apport 20%</span><p style={{fontWeight:600,marginTop:2}}>{fmtFull(Math.round(l.price*0.2))} DA</p></div>
              <div><span style={{color:c.t3}}>Emprunt</span><p style={{fontWeight:600,marginTop:2}}>{fmtFull(Math.round(l.price*0.8))} DA</p></div>
              <div style={{gridColumn:"span 2",marginTop:4,padding:"10px 14px",borderRadius:8,background:c.acg,textAlign:"center"}}>
                <span style={{color:c.t3,fontSize:11}}>Mensualité estimée (20 ans, 6.5%)</span>
                <p style={{fontSize:20,fontWeight:700,color:c.ac,marginTop:4}}>{fmtFull(Math.round(l.price*0.8*0.00746))} DA/mois</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AGENTS PAGE — Simple, clean, filterable
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AgentsPage({c,dk,goAgentDetail}){
  const[search,setSearch]=useState("");
  const[wilayaFilter,setWilayaFilter]=useState("all");
  const[verifiedOnly,setVerifiedOnly]=useState(false);

  const wilayas=["all",...[...new Set(AGENTS.map(a=>a.wilaya))]];
  const filtered=AGENTS.filter(a=>{
    if(wilayaFilter!=="all"&&a.wilaya!==wilayaFilter)return false;
    if(verifiedOnly&&!a.verified)return false;
    if(search&&!a.name.toLowerCase().includes(search.toLowerCase())&&!a.speciality.toLowerCase().includes(search.toLowerCase())&&!a.wilaya.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>
      {/* Title */}
      <Reveal>
        <h1 style={{fontSize:28,fontWeight:700,letterSpacing:-0.5}}>Trouver une agence</h1>
        <p style={{color:c.t3,fontSize:14,marginTop:6}}>2 500+ agences immobilières vérifiées à travers l'Algérie</p>
      </Reveal>

      {/* Search + filters */}
      <Reveal delay={0.1}>
        <div style={{marginTop:24,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          {/* Search */}
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:260,padding:"10px 14px",borderRadius:10,border:`1px solid ${c.b}`,background:c.s,transition:"border-color 0.2s"}}
            onFocus={e=>e.currentTarget.style.borderColor=c.ac} onBlur={e=>e.currentTarget.style.borderColor=c.b}>
            <span style={{color:c.t3,display:"flex"}}>{IC.search}</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, spécialité ou ville..." style={{flex:1,border:"none",outline:"none",fontSize:13,background:"transparent",color:c.t1}}/>
            {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:c.t3,cursor:"pointer",display:"flex"}}>{IC.x}</button>}
          </div>
          {/* Wilaya filter */}
          <select value={wilayaFilter} onChange={e=>setWilayaFilter(e.target.value)} style={{
            height:42,padding:"0 32px 0 14px",borderRadius:10,border:`1px solid ${c.b}`,background:c.s,color:c.t1,fontSize:13,cursor:"pointer",
            appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",
          }}>
            {wilayas.map(w=><option key={w} value={w}>{w==="all"?"Toutes les wilayas":w}</option>)}
          </select>
          {/* Verified toggle */}
          <button onClick={()=>setVerifiedOnly(!verifiedOnly)} style={{
            display:"flex",alignItems:"center",gap:6,height:42,padding:"0 16px",borderRadius:10,fontSize:13,fontWeight:500,cursor:"pointer",border:`1px solid ${verifiedOnly?c.ac:c.b}`,
            background:verifiedOnly?c.acg:"transparent",color:verifiedOnly?c.ac:c.t2,transition:"all 0.15s",
          }}>
            {verifiedOnly&&<span style={{color:c.ac}}>{IC.check}</span>}
            Vérifiées uniquement
          </button>
        </div>
      </Reveal>

      {/* Results count */}
      <div style={{marginTop:20,marginBottom:16,fontSize:13,color:c.t3}}>
        {filtered.length} agence{filtered.length>1?"s":""} trouvée{filtered.length>1?"s":""}
      </div>

      {/* Agent cards */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map((agent,i)=>(
          <Reveal key={agent.id} delay={i*0.04}>
            <div onClick={()=>goAgentDetail(agent.id)} style={{
              display:"flex",gap:20,padding:20,borderRadius:14,border:`1px solid ${c.b}`,background:c.s,cursor:"pointer",
              transition:"all 0.2s",
            }} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.bs;e.currentTarget.style.boxShadow=c.shh;e.currentTarget.style.transform="translateY(-2px)"}}
               onMouseLeave={e=>{e.currentTarget.style.borderColor=c.b;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)"}}>

              {/* Logo */}
              <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${agent.color},${agent.color}CC)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontWeight:800,fontSize:22,flexShrink:0}}>
                {agent.logo}
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <h3 style={{fontSize:16,fontWeight:600}}>{agent.name}</h3>
                  {agent.verified&&<span style={{padding:"2px 8px",borderRadius:50,fontSize:10,fontWeight:600,background:c.acg,color:c.ac}}>✓ Vérifiée</span>}
                </div>
                <p style={{fontSize:13,color:c.t2}}>{agent.speciality} · {agent.wilaya}</p>
                <p style={{fontSize:12,color:c.t3,marginTop:6,lineHeight:1.5}}>{agent.desc}</p>
                {/* Stats row */}
                <div style={{display:"flex",gap:16,marginTop:10}}>
                  {[
                    {v:agent.listings,l:"annonces"},
                    {v:agent.sales,l:"ventes"},
                    {v:agent.agents,l:"agents"},
                  ].map(s=>(
                    <span key={s.l} style={{fontSize:12,color:c.t3}}>
                      <strong style={{color:c.t1,fontWeight:600}}>{s.v}</strong> {s.l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rating + arrow */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"space-between",flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:14,fontWeight:700}}>{agent.rating}</span>
                  <span style={{color:"#FBBF24",fontSize:14}}>★</span>
                  <span style={{fontSize:11,color:c.t3}}>({agent.reviews})</span>
                </div>
                <span style={{color:c.t3,transition:"color 0.15s"}}>{IC.arrowRight}</span>
              </div>
            </div>
          </Reveal>
        ))}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{width:48,height:48,borderRadius:12,background:c.m,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
              <span style={{fontSize:20}}>🔍</span>
            </div>
            <p style={{fontSize:14,fontWeight:600}}>Aucune agence trouvée</p>
            <p style={{fontSize:13,color:c.t3,marginTop:4}}>Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AGENT DETAIL PAGE — Vitrine Heatherwick
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AgentDetailPage({c,dk,agent,goAgents,goDetail}){
  const agentListings=LISTINGS.slice(0,4);
  return(
    <>
      {/* Hero */}
      <section style={{
        position:"relative",height:"50vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        background:`linear-gradient(180deg,rgba(9,9,11,0.5) 0%,rgba(9,9,11,0.75) 100%),url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop') center/cover`,
      }}>
        {/* Back button */}
        <button onClick={goAgents} style={{position:"absolute",top:16,left:16,display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:500,cursor:"pointer",backdropFilter:"blur(8px)"}}>
          ← Toutes les agences
        </button>
        <Reveal>
          <div style={{width:72,height:72,borderRadius:18,background:`linear-gradient(135deg,${agent.color},${agent.color}CC)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontWeight:800,fontSize:32,marginBottom:16,boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
            {agent.logo}
          </div>
        </Reveal>
        <Reveal delay={0.1}><h1 style={{color:"#FAFAFA",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,textAlign:"center",letterSpacing:-1}}>{agent.name}</h1></Reveal>
        <Reveal delay={0.15}><p style={{color:"rgba(255,255,255,0.55)",fontSize:14,marginTop:8}}>{agent.speciality} · {agent.wilaya} · Depuis {agent.since}</p></Reveal>
        <Reveal delay={0.2}>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            {agent.verified&&<span style={{padding:"5px 14px",borderRadius:50,fontSize:12,fontWeight:600,background:"rgba(251,191,36,0.2)",color:"#FBBF24"}}>✓ Agence vérifiée</span>}
            <span style={{padding:"5px 14px",borderRadius:50,fontSize:12,fontWeight:500,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)"}}>{agent.rating} ★ ({agent.reviews} avis)</span>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{display:"flex",gap:10,marginTop:24}}>
            <button style={{height:44,padding:"0 28px",borderRadius:10,background:"#F59E0B",border:"none",color:"#FFF",fontWeight:600,fontSize:14,cursor:"pointer"}}>{IC.phone} Appeler</button>
            <button style={{height:44,padding:"0 28px",borderRadius:10,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#FFF",fontWeight:500,fontSize:14,cursor:"pointer",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:8}}>{IC.msg} Message</button>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <section style={{padding:"40px 24px",borderBottom:`1px solid ${c.b}`}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,maxWidth:600,margin:"0 auto"}}>
          {[{v:agent.listings,l:"annonces"},{v:agent.sales,l:"ventes"},{v:agent.agents,l:"agents"},{v:agent.rating,l:"note / 5"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:700,color:c.ac,fontVariantNumeric:"tabular-nums"}}>{s.v}</div>
              <div style={{fontSize:12,color:c.t3,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"40px 24px"}}>
        <Reveal>
          <h2 style={{fontSize:20,fontWeight:600,marginBottom:12}}>À propos</h2>
          <p style={{fontSize:14,lineHeight:1.8,color:c.t2}}>{agent.desc} Notre équipe de {agent.agents} agents expérimentés est à votre disposition pour vous accompagner dans tous vos projets immobiliers, que ce soit l'achat, la vente, ou la location. Nous intervenons principalement dans la wilaya de {agent.wilaya} et ses environs.</p>
        </Reveal>
      </section>

      {/* Listings */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"16px 24px 64px"}}>
        <Reveal>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:600}}>Nos biens ({agent.listings})</h2>
            <div style={{display:"flex",gap:4}}>
              {["Tous","Vente","Location"].map((f,i)=>(
                <button key={f} style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:i===0?600:400,border:"none",cursor:"pointer",background:i===0?c.acg:"transparent",color:i===0?c.ac:c.t3}}>{f}</button>
              ))}
            </div>
          </div>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {agentListings.map((l,i)=>(
            <Reveal key={l.id} delay={i*0.06}><ListingCard l={l} c={c} dk={dk} onClick={()=>goDetail(l.id)}/></Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LISTING CARD COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ListingCard({l,c,dk,onClick,compact,highlighted}){
  const[h,setH]=useState(false);
  const active=h||highlighted;
  const typeColor=l.type==="Vente"?c.sale:l.type==="Location"?c.rent:c.vac;
  return(
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      borderRadius:12,overflow:"hidden",cursor:"pointer",
      border:`1px solid ${active?c.bs:c.b}`,background:c.s,
      boxShadow:active?c.shh:c.sh,
      transform:active?"translateY(-3px)":"translateY(0)",
      transition:"all 0.25s cubic-bezier(.4,0,.2,1)",
    }}>
      <div style={{position:"relative",aspectRatio:"16/10",overflow:"hidden",background:c.m}}>
        <img src={l.img} alt={l.title} style={{width:"100%",height:"100%",objectFit:"cover",transform:active?"scale(1.06)":"scale(1)",transition:"transform 0.5s ease"}}/>
        <div style={{position:"absolute",top:8,right:8}}>
          <span style={{padding:"3px 8px",borderRadius:50,fontSize:10,fontWeight:600,background:"rgba(34,197,94,0.9)",color:"#FFF",backdropFilter:"blur(4px)"}}>En ligne</span>
        </div>
        <button onClick={e=>{e.stopPropagation()}} style={{position:"absolute",top:8,left:8,width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.3)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",color:"#FFF"}}>
          {IC.heart}
        </button>
        <span style={{position:"absolute",bottom:8,right:8,display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:50,fontSize:10,fontWeight:600,background:"rgba(0,0,0,0.5)",color:"#FFF",backdropFilter:"blur(4px)"}}>
          {IC.camera} {l.photos}
        </span>
      </div>
      <div style={{padding:compact?12:14}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <span style={{fontSize:11,fontWeight:600,color:typeColor}}>{l.type}</span>
          <span style={{fontSize:10,color:c.t3}}>·</span>
          <span style={{fontSize:11,color:c.t3}}>{l.w}</span>
        </div>
        <p style={{fontSize:13,fontWeight:600,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</p>
        <p style={{fontSize:compact?16:18,fontWeight:700,marginTop:5,fontVariantNumeric:"tabular-nums"}}>{fmtFull(l.price)} DA</p>
        {l.rooms!==null&&(
          <div style={{display:"flex",gap:12,marginTop:8,fontSize:12,color:c.t3}}>
            <span style={{display:"flex",alignItems:"center",gap:4}}>{IC.bed} {l.rooms}</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}>{IC.bath} {l.baths}</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}>{IC.ruler} {l.surface} m²</span>
          </div>
        )}
      </div>
    </div>
  );
}

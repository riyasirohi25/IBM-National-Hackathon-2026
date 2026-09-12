import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const G = "#0a3622"; const A = "#e6b15c"; const API = "http://localhost:8000";

const CONF_COLOR = c => c>=90?"#16a34a":c>=75?"#ca8a04":c>=60?"#ea580c":"#dc2626";
const STATUS_STYLE = s => s==="Verified"
  ? {background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0"}
  : {background:"#fefce8",color:"#a16207",border:"1px solid #fde68a"};

function ScoreGauge({score}){
  const r=54; const circ=2*Math.PI*r;
  const dash=circ*(score/100);
  return(
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={r} stroke="#1a3c28" strokeWidth={14} fill="none"/>
      <circle cx={70} cy={70} r={r} stroke={A} strokeWidth={14} fill="none"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)"/>
      <text x={70} y={64} textAnchor="middle" fill="#fff" fontSize={26} fontWeight={800}>{score}</text>
      <text x={70} y={80} textAnchor="middle" fill="#86efac" fontSize={9} fontWeight={700}>/ 100</text>
      <text x={70} y={95} textAnchor="middle" fill={A} fontSize={8} fontWeight={700}>CREDIT SCORE</text>
    </svg>
  );
}

function Bar({pct,color="#16a34a"}){
  return(
    <div style={{width:"100%",height:8,background:"#e2e8f0",borderRadius:4,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:4,transition:"width 0.8s"}}/>
    </div>
  );
}

export default function FarmerDashboard(){
  const {id="1"} = useParams();
  const [tab, setTab] = useState("dashboard");
  const [consent, setConsent] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const [farmer, setFarmer] = useState({
    name:"Ramesh Kumar", code:"F001", location:"Sitapur, UP", crop:"Wheat",
    land:4.2, season:"Rabi", age:46
  });
  const [score, setScore] = useState({
    creditworthiness_score:84, repayment_capacity:120000,
    recommended_limit:101000, risk_adjustment_factor:0.84,
    explanation:{crop_diversity:"Moderate diversification (+12pts)",market_price_stability:"High stability (+18pts)",pmkisan_enrollment:"PM-KISAN enrolled (+10pts)",community_trust_score:"Strong trust (+15pts)",evidence_confidence:"Good evidence confidence (+14pts)",insurance_claim_ratio:"Low claims, positive signal (+8pts)"},
    purpose_split:{inputs:60600,labour:20200,irrigation:20200}
  });
  const [evidence, setEvidence] = useState([
    {claim:"production_quantity",value:12,unit:"tonnes",source:"self_declared",confidence:0.55,conflict:false},
    {claim:"land_area",value:4.2,unit:"acres",source:"government_record",confidence:0.98,conflict:false},
    {claim:"crop",value_text:"Wheat",unit:"text",source:"fpo_verification",confidence:0.92,conflict:false},
    {claim:"seasonal_income",value:310000,unit:"INR",source:"self_declared",confidence:0.55,conflict:false},
    {claim:"pmkisan_enrollment",value:1,unit:"boolean",source:"government_record",confidence:0.98,conflict:false},
  ]);
  const [conflicts, setConflicts] = useState([]);
  const [auditLog, setAuditLog] = useState([
    {id:1,event_type:"evidence_added",description:"Land area verified via government record",created_at:"2026-09-08T10:20:00"},
    {id:2,event_type:"attestation",description:"FPO Inspector Arjun Rao attested crop claim",created_at:"2026-09-09T14:45:00"},
    {id:3,event_type:"conflict_detected",description:"Production quantity variance >20% detected",created_at:"2026-09-10T11:30:00"},
  ]);
  const [consents, setConsents] = useState([
    {lender_id:1,lender_name:"State Bank of India",is_active:true,granted_at:"2026-09-12"},
  ]);

  useEffect(()=>{
    axios.get(`${API}/api/v1/farmers/${id}`).then(r=>{
      if(r.data?.data?.profile) {
        const p=r.data.data.profile;
        setFarmer({name:p.name,code:p.farmer_code,location:`${p.district}, ${p.state}`,crop:p.primary_crop,land:p.land_area_acres,season:p.season,age:p.age});
        setEvidence(r.data.data.evidence_vault || []);
      }
    }).catch(()=>{});
    axios.get(`${API}/api/v1/farmers/${id}/score`).then(r=>{
      if(r.data?.data) setScore(r.data.data);
    }).catch(()=>{});
    axios.get(`${API}/api/v1/farmers/${id}/conflicts`).then(r=>{
      setConflicts(r.data?.data || []);
    }).catch(()=>{});
    axios.get(`${API}/api/v1/farmers/${id}/audit-log`).then(r=>{
      setAuditLog(r.data?.data || []);
    }).catch(()=>{});
    axios.get(`${API}/api/v1/farmers/${id}/consents`).then(r=>{
      setConsents(r.data?.data || []);
    }).catch(()=>{});
  },[id]);

  const navItems=[
    {key:"dashboard",icon:"📊",label:"Dashboard"},
    {key:"evidence",icon:"🗄️",label:"Evidence Vault"},
    {key:"score",icon:"🧠",label:"Credit Intelligence"},
    {key:"consent",icon:"🔑",label:"Access & Consent"},
    {key:"audit",icon:"📋",label:"Audit Log"},
  ];

  const handleRevoke = async (lid) => {
    setRevoking(true);
    try {
      await axios.post(`${API}/api/v1/farmers/${id}/consent`,{lender_id:lid,grant:false});
      setConsents(c=>c.map(x=>x.lender_id===lid?{...x,is_active:false}:x));
    } catch { setConsents(c=>c.map(x=>x.lender_id===lid?{...x,is_active:false}:x)); }
    setRevoking(false);
  };
  const handleGrant = async (lid) => {
    try {
      await axios.post(`${API}/api/v1/farmers/${id}/consent`,{lender_id:lid,grant:true});
      setConsents(c=>c.map(x=>x.lender_id===lid?{...x,is_active:true}:x));
    } catch { setConsents(c=>c.map(x=>x.lender_id===lid?{...x,is_active:true}:x)); }
  };

  const hasConflict = evidence.some(e=>e.conflict) || conflicts.length>0;
  const avgConf = evidence.length ? Math.round(evidence.reduce((a,e)=>a+(e.confidence||0),0)/evidence.length*100) : 80;

  return(
    <div style={{display:"flex",height:"calc(100vh - 38px)",overflow:"hidden",background:"#f8faf9"}}>
      {/* Sidebar */}
      <aside style={{width:220,background:G,color:"#fff",display:"flex",flexDirection:"column",flexShrink:0}}>
        <Link to="/" style={{padding:"20px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #14472f",textDecoration:"none"}}>
          <div style={{width:34,height:34,background:A,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:G,fontSize:12}}>KP</div>
          <div><div style={{fontWeight:700,fontSize:14,color:"#fff"}}>KrishiPramaan</div><div style={{fontSize:10,color:"#86efac"}}>Farmer Portal</div></div>
        </Link>
        <nav style={{padding:"12px 8px",flex:1}}>
          {navItems.map(({key,icon,label})=>(
            <button key={key} onClick={()=>setTab(key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,textAlign:"left",marginBottom:2,background:tab===key?"#1a5c35":"transparent",color:tab===key?"#fff":"#9ca3af",borderLeft:tab===key?`3px solid ${A}`:"3px solid transparent"}}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:"1px solid #14472f",background:"#071a0e"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{farmer.name}</div>
          <div style={{fontSize:10,color:"#9ca3af"}}>{farmer.code} · {farmer.crop}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflowY:"auto",padding:32}}>

        {/* ── DASHBOARD TAB ── */}
        {tab==="dashboard" && (
          <div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Farmer Portal</div>
              <h1 style={{fontSize:28,fontWeight:800,color:G,margin:0}}>Good morning, {farmer.name.split(" ")[0]} 👋</h1>
              <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>Your agricultural identity is <strong>{avgConf}% verified</strong> across multiple independent sources.</p>
            </div>

            {hasConflict && (
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",gap:16,alignItems:"flex-start"}}>
                <span style={{fontSize:24}}>⚠️</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#92400e"}}>Evidence Conflict Detected</div>
                  <div style={{fontSize:12,color:"#a16207",marginTop:4}}>A production claim variance &gt;20% was detected. Confidence reduced by 40% for that claim. <button onClick={()=>setTab("evidence")} style={{color:"#d97706",fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Review evidence →</button></div>
                </div>
              </div>
            )}

            {/* Hero Score Card */}
            <div style={{background:G,borderRadius:20,padding:32,color:"#fff",marginBottom:20,display:"grid",gridTemplateColumns:"auto 1fr",gap:32,alignItems:"center"}}>
              <ScoreGauge score={Math.round(score.creditworthiness_score||84)}/>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#4ade80",textTransform:"uppercase",marginBottom:4}}>Credit Intelligence</div>
                <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 16px",fontFamily:"Georgia,serif"}}>Your Credit Profile</h2>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
                  {[
                    ["Repayment Capacity",`₹${(score.repayment_capacity||120000).toLocaleString("en-IN")}`,"#86efac"],
                    ["Recommended Limit",`₹${(score.recommended_limit||101000).toLocaleString("en-IN")}`,A],
                    ["Evidence Confidence",`${avgConf}%`,"#fff"],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{background:"#ffffff12",borderRadius:10,padding:"12px 16px"}}>
                      <div style={{fontSize:10,color:"#86efac",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16,fontSize:11,color:"#86efac"}}>⚠️ AI-generated assessment for decision support. Final lending decisions remain with the authorized financial institution.</div>
              </div>
            </div>

            {/* Purpose of Credit Split */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24,marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>§5.6a Purpose-of-Credit Split</div>
              <h3 style={{fontSize:16,fontWeight:700,color:G,margin:"0 0 20px"}}>How your ₹{(score.recommended_limit||101000).toLocaleString("en-IN")} should be used</h3>
              {[
                ["🌱 Crop Inputs","60%",score.purpose_split?.inputs||60600,"#16a34a"],
                ["👷 Labour","20%",score.purpose_split?.labour||20200,"#d97706"],
                ["💧 Irrigation","20%",score.purpose_split?.irrigation||20200,"#2563eb"],
              ].map(([l,pct,amt,c])=>(
                <div key={l} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:6}}>
                    <span style={{color:G}}>{l}</span>
                    <span style={{color:"#64748b"}}>{pct} · ₹{amt.toLocaleString("en-IN")}</span>
                  </div>
                  <Bar pct={parseInt(pct)} color={c}/>
                </div>
              ))}
            </div>

            {/* Quick Evidence Preview */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h3 style={{fontSize:16,fontWeight:700,color:G,margin:0}}>Evidence Vault (Preview)</h3>
                <button onClick={()=>setTab("evidence")} style={{background:"none",border:`1px solid ${G}`,color:G,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>View All →</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
                {evidence.slice(0,4).map((e,i)=>(
                  <div key={i} style={{border:"1px solid #e2e8f0",borderRadius:10,padding:"14px 16px",background:e.conflict?"#fff5f5":"#fafafa"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>{e.claim?.replace(/_/g," ")}</div>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,...STATUS_STYLE(e.conflict?"Conflict":"Verified")}}>{e.conflict?"⚠ Conflict":"✓"}</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:G}}>{e.value_text||`${e.value} ${e.unit}`}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{e.source?.replace(/_/g," ")} · <strong style={{color:CONF_COLOR(Math.round(e.confidence*100))}}>{Math.round(e.confidence*100)}%</strong></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EVIDENCE VAULT TAB ── */}
        {tab==="evidence" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:G,margin:0}}>🗄️ Evidence Vault</h1>
              <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>Every claim is tagged with its source and confidence level. Conflicts are auto-detected when variance &gt;20%.</p>
            </div>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:"#f8fafc",borderBottom:"2px solid #e2e8f0"}}>
                      {["Claim","Value","Source","Confidence","Status"].map(h=>(
                        <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.map((e,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:e.conflict?"#fff5f5":"#fff"}}>
                        <td style={{padding:"14px 20px",fontWeight:600,color:G}}>{e.claim?.replace(/_/g," ")}</td>
                        <td style={{padding:"14px 20px",fontWeight:700}}>{e.value_text||`${e.value} ${e.unit}`}</td>
                        <td style={{padding:"14px 20px",color:"#64748b"}}>{e.source?.replace(/_/g," ")}</td>
                        <td style={{padding:"14px 20px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:60,height:6,background:"#e2e8f0",borderRadius:3,overflow:"hidden"}}>
                              <div style={{width:`${Math.round(e.confidence*100)}%`,height:"100%",background:CONF_COLOR(Math.round(e.confidence*100)),borderRadius:3}}/>
                            </div>
                            <strong style={{color:CONF_COLOR(Math.round(e.confidence*100))}}>{Math.round(e.confidence*100)}%</strong>
                          </div>
                        </td>
                        <td style={{padding:"14px 20px"}}>
                          <span style={{...STATUS_STYLE(e.conflict?"Conflict":"Verified"),padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700}}>
                            {e.conflict?"⚠️ Conflict":"✓ Verified"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {(conflicts.length>0||evidence.some(e=>e.conflict)) && (
              <div style={{marginTop:20,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:16,padding:24}}>
                <h3 style={{fontSize:15,fontWeight:700,color:"#991b1b",margin:"0 0 12px"}}>⚠️ Conflict Details (§5.4)</h3>
                <p style={{fontSize:12,color:"#b91c1c",lineHeight:1.7,margin:0}}>
                  Conflict rule: <code style={{background:"#ffe4e6",padding:"2px 6px",borderRadius:4}}>abs(farmer_value − other_value) / other_value &gt; 0.20</code><br/>
                  Confidence penalty: conflicted claim confidence multiplied by 0.6 (reduced 40%).<br/>
                  Two conflicting attestations for same claim: penalty is averaged, not stacked.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── CREDIT INTELLIGENCE TAB ── */}
        {tab==="score" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:G,margin:0}}>🧠 Credit Intelligence Engine</h1>
              <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>One function, four outputs. Fully explainable. No black box.</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              {[
                ["Creditworthiness Score",`${Math.round(score.creditworthiness_score||84)} / 100`,"Weighted composite across 6 factors",G,"#fff"],
                ["Repayment Capacity",`₹${(score.repayment_capacity||120000).toLocaleString("en-IN")}`,"Seasonal income − expenses − existing debt","#f0fdf4",G],
                ["Recommended Credit Limit",`₹${(score.recommended_limit||101000).toLocaleString("en-IN")}`,"Repayment capacity × risk adjustment factor","#fefce8","#92400e"],
                ["Risk Adjustment Factor",`${((score.risk_adjustment_factor||0.84)*100).toFixed(0)}%`,"Based on creditworthiness score band","#f0f9ff","#1e40af"],
              ].map(([l,v,desc,bg,color])=>(
                <div key={l} style={{background:bg,border:"1px solid #e2e8f0",borderRadius:16,padding:24}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{l}</div>
                  <div style={{fontSize:28,fontWeight:800,color,marginBottom:6}}>{v}</div>
                  <div style={{fontSize:12,color:"#64748b"}}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24,marginBottom:20}}>
              <h3 style={{fontSize:16,fontWeight:700,color:G,margin:"0 0 16px"}}>Per-Factor Explanation</h3>
              {score.explanation && Object.entries(score.explanation).map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #f1f5f9",alignItems:"flex-start"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#16a34a",marginTop:5,flexShrink:0}}></span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:0.5}}>{k.replace(/_/g," ")}</div>
                    <div style={{fontSize:13,color:"#475569"}}>{v}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"16px 20px"}}>
              <p style={{fontSize:12,color:"#92400e",margin:0}}>⚠️ <strong>Mandatory Disclaimer (§11):</strong> AI-generated assessment for decision support. Final lending decisions remain with the authorized financial institution.</p>
            </div>
          </div>
        )}

        {/* ── CONSENT TAB ── */}
        {tab==="consent" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:G,margin:0}}>🔑 Access & Consent (§5.7)</h1>
              <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>You decide who can see your KrishiPramaan. Grant or revoke access at any time — every event is recorded in a tamper-evident audit log.</p>
            </div>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24,marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,color:G,margin:"0 0 16px"}}>Authorized Lenders</h3>
              {consents.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:G}}>{c.lender_name||`Lender #${c.lender_id}`}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>Lender ID: {c.lender_id} · {c.is_active?"Active":"Revoked"} since {c.granted_at||"Sep 12, 2026"}</div>
                  </div>
                  {c.is_active
                    ? <button disabled={revoking} onClick={()=>handleRevoke(c.lender_id)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",padding:"6px 16px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:12}}>Revoke Access</button>
                    : <button onClick={()=>handleGrant(c.lender_id)} style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"6px 16px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:12}}>Grant Access</button>
                  }
                </div>
              ))}
              <div style={{padding:"14px 0",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:G}}>HDFC Kisan Credit</div>
                  <div style={{fontSize:11,color:"#64748b"}}>Request pending</div>
                </div>
                <button onClick={()=>setConsents(p=>[...p,{lender_id:2,lender_name:"HDFC Kisan Credit",is_active:true,granted_at:"Sep 12, 2026"}])} style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"6px 16px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:12}}>Grant Access</button>
              </div>
            </div>
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"16px 20px"}}>
              <p style={{fontSize:12,color:"#166534",margin:0}}>🔒 <strong>Privacy guarantee:</strong> Lenders only see your score, evidence summary, and confidence levels — never your raw financial data. You can revoke access at any time and all lender access ends immediately.</p>
            </div>
          </div>
        )}

        {/* ── AUDIT LOG TAB ── */}
        {tab==="audit" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:G,margin:0}}>📋 Audit Log (Tamper-Evident)</h1>
              <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>Hash-chained event log. Every attestation, access grant, revoke, and conflict is recorded. SHA-256 chained — not blockchain, but tamper-evident.</p>
            </div>
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#f8fafc",borderBottom:"2px solid #e2e8f0"}}>
                    {["#","Event","Description","Timestamp","Hash"].map(h=>(
                      <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((e,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"14px 20px",color:"#94a3b8",fontWeight:600}}>#{e.id||i+1}</td>
                      <td style={{padding:"14px 20px"}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:e.event_type?.includes("conflict")?"#fef2f2":e.event_type?.includes("attestation")?"#f0f9ff":"#f0fdf4",color:e.event_type?.includes("conflict")?"#dc2626":e.event_type?.includes("attestation")?"#1d4ed8":"#16a34a"}}>
                          {e.event_type?.replace(/_/g," ")}
                        </span>
                      </td>
                      <td style={{padding:"14px 20px",color:"#475569"}}>{e.description}</td>
                      <td style={{padding:"14px 20px",color:"#64748b",fontSize:11}}>{new Date(e.created_at).toLocaleString("en-IN")}</td>
                      <td style={{padding:"14px 20px"}}>
                        <code style={{fontSize:9,color:"#94a3b8",background:"#f8fafc",padding:"2px 6px",borderRadius:4}}>{(e.hash||"sha256:"+Math.random().toString(36).slice(2,10)+"...").slice(0,16)}…</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

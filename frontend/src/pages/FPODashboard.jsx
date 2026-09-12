import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const G = "#0a3622"; const A = "#e6b15c"; const API = "http://localhost:8000";

function Bar({pct,color="#16a34a"}){
  return(
    <div style={{width:"100%",height:8,background:"#e2e8f0",borderRadius:4,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:4,transition:"width 0.8s"}}/>
    </div>
  );
}

function ScoreGauge({score,label}){
  const r=44; const circ=2*Math.PI*r;
  return(
    <svg width={110} height={110} viewBox="0 0 110 110">
      <circle cx={55} cy={55} r={r} stroke="#1a3c28" strokeWidth={12} fill="none"/>
      <circle cx={55} cy={55} r={r} stroke={A} strokeWidth={12} fill="none"
        strokeDasharray={`${circ*(score/100)} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 55 55)"/>
      <text x={55} y={52} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={800}>{score}%</text>
      <text x={55} y={66} textAnchor="middle" fill="#86efac" fontSize={8} fontWeight={700}>{label}</text>
    </svg>
  );
}

export default function FPODashboard(){
  const { id = "1" } = useParams();
  const [filter, setFilter] = useState("All");
  const [attestModal, setAttestModal] = useState(null);
  const [attestValue, setAttestValue] = useState("");

  const [data, setData] = useState({
    fpo_name:"", location:"",
    trust_score:0, evidence_verification:0, attestation_coverage:0,
    claim_consistency:0, total_farmers:0, verified:0, conflict_flags:0, awaiting_verification:0,
    farmers:[]
  });

  const fetchData = () => {
    axios.get(`${API}/api/v1/fpo/${id}/aggregate-risk`).then(r=>{
      if(r.data?.data) setData(r.data.data);
    }).catch(()=>{});
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAttest = async () => {
    try {
      await axios.post(`${API}/api/v1/farmers/${attestModal.id}/attestations`,{
        fpo_member_id: parseInt(id),
        value: attestValue ? parseFloat(attestValue) : null,
        claim: "production_quantity"
      });
      alert(`✅ Attestation recorded! Audit trail updated.${attestValue?" Conflict check will run automatically.":""}`);
      fetchData(); // Refresh UI dynamically!
    } catch { 
      alert("❌ Failed to record attestation."); 
    }
    setAttestModal(null); setAttestValue("");
  };

  const farmers = data.farmers || [];
  const filtered = farmers.filter(f=>{
    if(filter==="All") return true;
    if(filter==="Conflict") return f.has_conflict||f.status==="Conflict";
    if(filter==="Verified") return f.status==="Verified";
    if(filter==="Needs Verification") return f.status==="Needs Verification";
    if(filter==="Attested") return f.status==="Attested";
    return true;
  });

  const statusStyle = (s) => ({
    background: s==="Conflict"?"#fef2f2":s==="Verified"?"#f0fdf4":"#fff7ed",
    color: s==="Conflict"?"#dc2626":s==="Verified"?"#16a34a":"#d97706",
    border: `1px solid ${s==="Conflict"?"#fecaca":s==="Verified"?"#bbf7d0":"#fed7aa"}`
  });

  const verifiedPct = Math.round((data.verified/(data.total_farmers||1))*100);
  const conflictPct = Math.round((data.conflict_flags/(data.total_farmers||1))*100);
  const pendingPct = Math.round((data.awaiting_verification/(data.total_farmers||1))*100);

  return (
    <div style={{display:"flex",height:"calc(100vh - 38px)"}}>
      <aside style={{width:240,background:G,color:"#fff",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <div style={{padding:"24px 20px",borderBottom:"1px solid #1a3c28",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,background:A,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤝</div>
            <div>
              <div style={{fontWeight:800,fontSize:16,letterSpacing:0.5}}>FarmPassport</div>
              <div style={{fontSize:11,color:"#86efac",fontWeight:600}}>FPO Portal</div>
            </div>
          </div>
          <nav style={{padding:20,display:"flex",flexDirection:"column",gap:8}}>
            {[{icon:"📊",l:"Overview"},{icon:"👥",l:"Farmers"},{icon:"🔥",l:"Attestations"},{icon:"⚠️",l:"Evidence Conflicts"},{icon:"🛡️",l:"Community Trust"}].map((n,i)=>(
              <button key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:i===0?"#1a3c28":"transparent",color:i===0?A:"#94a3b8",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:16}}>{n.icon}</span> {n.l}
              </button>
            ))}
          </nav>
        </div>
        <div style={{padding:20,borderTop:"1px solid #1a3c28"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{data.fpo_name}</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>{data.location}</div>
        </div>
      </aside>

      <main style={{flex:1,overflowY:"auto",padding:"32px 48px",background:"#f8faf9"}}>
        <header style={{marginBottom:32}}>
          <div style={{fontSize:12,fontWeight:800,color:"#16a34a",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>FPO Verification Center</div>
          <h1 style={{fontSize:32,fontWeight:800,color:G,margin:"0 0 8px"}}>Community Evidence & Trust Operations</h1>
          <p style={{fontSize:14,color:"#64748b",margin:0}}>§5.3 FPO Attestation + §5.6b Aggregate Risk View</p>
        </header>

        {/* Top Widget */}
        <div style={{background:G,borderRadius:20,padding:32,display:"flex",gap:48,marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",gap:32,flex:1}}>
            <ScoreGauge score={data.trust_score} label="TRUST" />
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:800,color:"#86efac",letterSpacing:1,marginBottom:4}}>COMMUNITY TRUST HEALTH (§5.6B)</div>
              <h2 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 24px"}}>Strong, lender-ready evidence portfolio</h2>
              <div style={{display:"flex",gap:32}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,color:"#fff",marginBottom:8}}>
                    <span>Evidence Verification</span><span>{data.evidence_verification}%</span>
                  </div>
                  <Bar pct={data.evidence_verification} />
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,color:"#fff",marginBottom:8}}>
                    <span>Attestation Coverage</span><span>{data.attestation_coverage}%</span>
                  </div>
                  <Bar pct={data.attestation_coverage} color={A} />
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,color:"#fff",marginBottom:8}}>
                    <span>Claim Consistency</span><span>{data.claim_consistency}%</span>
                  </div>
                  <Bar pct={data.claim_consistency} color={A} />
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,minWidth:240}}>
            {[["Total Farmers",data.total_farmers,"#1a3c28"],["Verified",data.verified,"#1a3c28"],["Conflicts",data.conflict_flags,"#1a3c28"],["Awaiting",data.awaiting_verification,"#1a3c28"]].map(([l,v,c],i)=>(
              <div key={l} style={{background:c,borderRadius:12,padding:"16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>{v}</div>
                <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:0.5}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Farmer Verification Table */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,marginBottom:32,overflow:"hidden"}}>
          <div style={{padding:"24px 24px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:800,color:G,margin:"0 0 4px"}}>Farmer Verification</h3>
              <p style={{fontSize:13,color:"#64748b",margin:0}}>Review claims and corroborating evidence. Click "Attest {'>'}" to add a community vouch.</p>
            </div>
            <input type="text" placeholder="Search farmer..." style={{padding:"8px 16px",borderRadius:20,border:"1px solid #e2e8f0",fontSize:13,outline:"none"}}/>
          </div>
          
          <div style={{padding:"0 24px",display:"flex",gap:24,borderBottom:"1px solid #e2e8f0",marginBottom:16}}>
            {["All","Verified","Needs Verification","Conflict","Attested"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{background:"none",border:"none",padding:"0 0 12px",fontSize:13,fontWeight:700,color:filter===f?G:"#94a3b8",borderBottom:filter===f?`2px solid ${G}`:"2px solid transparent",cursor:"pointer"}}>{f}</button>
            ))}
          </div>

          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
              <thead>
                <tr style={{fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1}}>
                  <th style={{padding:"0 20px 16px"}}>Farmer</th>
                  <th style={{padding:"0 20px 16px"}}>Crop & Land</th>
                  <th style={{padding:"0 20px 16px"}}>Claim</th>
                  <th style={{padding:"0 20px 16px"}}>Status</th>
                  <th style={{padding:"0 20px 16px"}}>Confidence</th>
                  <th style={{padding:"0 20px 16px"}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f,i)=>(
                  <tr key={i} style={{borderTop:"1px solid #f1f5f9",background:f.has_conflict?"#fff5f5":"#fff"}}>
                    <td style={{padding:"14px 20px"}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{f.name?.split(" ").map(n=>n[0]).join("")}</div>
                        <div>
                          <div style={{fontWeight:700,color:G}}>{f.name}</div>
                          <div style={{fontSize:11,color:"#94a3b8"}}>{f.farmer_code} · {f.location}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"14px 20px"}}>
                      <div style={{fontWeight:600,color:G}}>{f.crop}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{f.land_area}</div>
                    </td>
                    <td style={{padding:"14px 20px",fontWeight:600,color:"#475569"}}>{f.original_claim}</td>
                    <td style={{padding:"14px 20px"}}>
                      <span style={{...statusStyle(f.status),padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700}}>
                        {f.status==="Conflict"?"⚠️ ":f.status==="Verified"?"✅ ":""}{f.status}
                      </span>
                    </td>
                    <td style={{padding:"14px 20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:60,height:6,background:"#e2e8f0",borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${f.confidence||80}%`,height:"100%",background:f.confidence>=85?"#16a34a":f.confidence>=70?"#d97706":"#dc2626",borderRadius:3}}/>
                        </div>
                        <strong style={{fontSize:12}}>{f.confidence||80}%</strong>
                      </div>
                    </td>
                    <td style={{padding:"14px 20px"}}>
                      <button onClick={()=>setAttestModal(f)} style={{background:G,color:"#86efac",border:"none",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        ✍️ Attest
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{padding:20, textAlign:"center", color:"#94a3b8"}}>No farmers found in this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evidence Conflicts */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24,marginBottom:20}}>
          <h3 style={{fontSize:16,fontWeight:700,color:G,margin:"0 0 4px"}}>Evidence Conflicts (A 5.4)</h3>
          <p style={{fontSize:12,color:"#64748b",margin:"0 0 16px"}}>Auto-detected: variance &gt;20% between farmer claim and external data.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {farmers.filter(f => f.has_conflict).length > 0 ? farmers.filter(f => f.has_conflict).map((c,i)=>(
              <div key={i} style={{border:"1px solid #fecaca",background:"#fff5f5",borderRadius:12,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:"#dc2626",textTransform:"uppercase",letterSpacing:1}}>High Variance</div>
                    <div style={{fontSize:14,fontWeight:700,color:G}}>{c.name} - {c.crop}</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:800,color:"#dc2626"}}>20%+</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,background:"#fff",borderRadius:8,padding:12,marginBottom:14,border:"1px solid #e2e8f0"}}>
                  {[["Farmer Claim",c.original_claim],["Confidence Level",`${c.confidence}%`]].map(([l,v])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                      <div style={{fontSize:14,fontWeight:700,color:G}}>{v}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setAttestModal(c)} style={{width:"100%",background:G,color:"#86efac",border:"none",padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  ✍️ Add Community Attestation
                </button>
              </div>
            )) : <div style={{color:"#16a34a", fontSize:14, fontWeight:700}}>✅ No conflicts detected in your FPO.</div>}
          </div>
        </div>

        {/* Community Risk Overview */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24}}>
          <h3 style={{fontSize:16,fontWeight:700,color:G,margin:"0 0 4px"}}>Community Risk Overview</h3>
          <p style={{fontSize:12,color:"#64748b",margin:"0 0 16px"}}>Evidence distribution across active farmer records in {data.fpo_name}</p>
          <div style={{width:"100%",height:16,borderRadius:8,overflow:"hidden",display:"flex",marginBottom:16, background: "#e2e8f0"}}>
            <div style={{width:`${verifiedPct}%`,background:"#16a34a"}}/>
            <div style={{width:`${conflictPct}%`,background:"#dc2626"}}/>
            <div style={{width:`${pendingPct}%`,background:"#d97706"}}/>
          </div>
          <div style={{display:"flex",gap:24}}>
            {[["Conflict-free",`${verifiedPct}%`,"#16a34a"],["Conflicts",`${conflictPct}%`,"#dc2626"],["Pending",`${pendingPct}%`,"#d97706"]].map(([l,p,c])=>(
              <div key={l}>
                <div style={{fontSize:20,fontWeight:800,color:G}}>{p}</div>
                <div style={{fontSize:11,fontWeight:700,color:c}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Attest Modal */}
      {attestModal && (
        <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div style={{background:"#fff",borderRadius:20,padding:32,maxWidth:440,width:"100%",margin:16}}>
            <h3 style={{fontSize:18,fontWeight:800,color:G,margin:"0 0 8px"}}>✍️ Add Attestation</h3>
            <p style={{fontSize:13,color:"#64748b",margin:"0 0 20px"}}>You are vouching for <strong>{attestModal.name}</strong>. Optionally enter a value – if it differs &gt;20% from farmer claim, conflict check fires automatically.</p>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,fontWeight:700,color:G,display:"block",marginBottom:6}}>Your observed value for production quantity (tonnes) – optional</label>
              <input value={attestValue} onChange={e=>setAttestValue(e.target.value)} type="number" placeholder="Leave empty to attest as-is" style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={handleAttest} style={{flex:1,background:G,color:"#86efac",border:"none",padding:"12px 0",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>✍️ Record Attestation</button>
              <button onClick={()=>setAttestModal(null)} style={{flex:1,background:"#f1f5f9",color:"#64748b",border:"none",padding:"12px 0",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const G = "#0a3622"; const A = "#e6b15c"; const API = "http://localhost:8000";

function ScoreRing({score}){
  const r=30; const circ=2*Math.PI*r;
  const color = score>=80?"#16a34a":score>=65?"#d97706":"#dc2626";
  return(
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle cx={36} cy={36} r={r} stroke="#e2e8f0" strokeWidth={8} fill="none"/>
      <circle cx={36} cy={36} r={r} stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={`${circ*(score/100)} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"/>
      <text x={36} y={40} textAnchor="middle" fill={color} fontSize={14} fontWeight={800}>{score}</text>
    </svg>
  );
}

export default function LenderDashboard(){
  const { id = "1" } = useParams();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [stats, setStats] = useState({consentedCount:20,avgScore:79,avgConf:85,conflicts:3});
  const [farmers, setFarmers] = useState([
    {id:1,name:"Ramesh Kumar",code:"F001",location:"Sitapur, UP",crop:"Wheat",credit_score:84,repayment_capacity:120000,recommended_limit:101000,evidence_confidence:80,risk_status:"Good",has_conflicts:false,conflicts_count:0},
    {id:2,name:"Sunita Devi",code:"F002",location:"Raipur, CG",crop:"Rice",credit_score:91,repayment_capacity:168000,recommended_limit:143000,evidence_confidence:93,risk_status:"Strong",has_conflicts:false,conflicts_count:0},
    {id:3,name:"Mohan Verma",code:"F003",location:"Varanasi, UP",crop:"Wheat",credit_score:62,repayment_capacity:54000,recommended_limit:41000,evidence_confidence:61,risk_status:"Needs Review",has_conflicts:true,conflicts_count:1},
    {id:4,name:"Priya Singh",code:"F004",location:"Lucknow, UP",crop:"Sugarcane",credit_score:78,repayment_capacity:131000,recommended_limit:109000,evidence_confidence:86,risk_status:"Good",has_conflicts:false,conflicts_count:0},
    {id:5,name:"Ravi Patel",code:"F005",location:"Nashik, MH",crop:"Grapes",credit_score:88,repayment_capacity:195000,recommended_limit:164000,evidence_confidence:92,risk_status:"Strong",has_conflicts:false,conflicts_count:0},
  ]);

  useEffect(()=>{
    axios.get(`${API}/api/v1/lender/${id}/farmers`).then(r=>{
      const list = r.data?.data || [];
      setFarmers(list);
      setStats({
        consentedCount:list.length,
        avgScore:list.length ? Math.round(list.reduce((a,f)=>a+(f.credit_score||0),0)/list.length) : 0,
        avgConf:list.length ? Math.round(list.reduce((a,f)=>a+(f.evidence_confidence||0),0)/list.length) : 0,
        conflicts:list.filter(f=>f.has_conflicts).length
      });
    }).catch(()=>{});
  },[id]);

  const filtered = farmers.filter(f=>{
    if(filter==="All") return true;
    if(filter==="High Confidence") return f.evidence_confidence>=85;
    if(filter==="Needs Review") return f.risk_status==="Needs Review";
    if(filter==="Conflict") return f.has_conflicts;
    return true;
  });

  const scoreColor = s => s>=80?"#16a34a":s>=65?"#d97706":"#dc2626";
  const statusStyle = s => {
    if(s==="Strong") return {background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0"};
    if(s==="Good") return {background:"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe"};
    if(s==="Needs Review") return {background:"#fefce8",color:"#a16207",border:"1px solid #fde68a"};
    return {background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca"};
  };

  const accessHistory = [
    {event:"Profile viewed",time:"Today 09:42 AM",farmer:"Ramesh Kumar"},
    {event:"Evidence vault accessed",time:"Today 09:43 AM",farmer:"Ramesh Kumar"},
    {event:"Score explanation viewed",time:"Yesterday 3:11 PM",farmer:"Sunita Devi"},
    {event:"Conflict flag reviewed",time:"Sep 11, 2026 11:05 AM",farmer:"Mohan Verma"},
  ];

  return(
    <div style={{display:"flex",height:"calc(100vh - 38px)",overflow:"hidden",background:"#f8faf9"}}>
      {/* Sidebar */}
      <aside style={{width:220,background:G,color:"#fff",display:"flex",flexDirection:"column",flexShrink:0}}>
        <Link to="/" style={{padding:"20px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #14472f",textDecoration:"none"}}>
          <div style={{width:34,height:34,background:"#16a34a",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏛️</div>
          <div><div style={{fontWeight:700,fontSize:14,color:"#fff"}}>Lender View</div><div style={{fontSize:10,color:"#86efac"}}>Intelligence Portal</div></div>
        </Link>
        <nav style={{padding:"12px 8px",flex:1}}>
          {[
            ["🏛️","Overview",()=>setSelected(null)],
            ["👥","Shared Farmers",()=>setSelected(null)],
            ["📈","Credit Intelligence",()=>{}],
            ["📋","Access Log",()=>setShowHistory(true)],
          ].map(([ic,lb,fn])=>(
            <button key={lb} onClick={fn} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,textAlign:"left",marginBottom:2,background:"transparent",color:"#9ca3af",cursor:"pointer"}}>
              <span>{ic}</span>{lb}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:"1px solid #14472f",background:"#071a0e"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>State Bank of India</div>
          <div style={{fontSize:10,color:"#9ca3af"}}>Lender ID: 1</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflowY:"auto",padding:32}}>

        {!selected ? (
          <>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Lender Intelligence Dashboard</div>
              <h1 style={{fontSize:26,fontWeight:800,color:G,margin:0}}>Consented Farmer Portfolio</h1>
              <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>§5.8 — You only see farmers who have explicitly granted access. No raw financial data is exposed.</p>
            </div>

            {/* Portfolio Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
              {[
                {label:"Consented Farmers",value:stats.consentedCount,icon:"👥",note:"Granted access"},
                {label:"Average Score",value:stats.avgScore,icon:"📊",note:"Portfolio avg (0-100)"},
                {label:"Avg Confidence",value:`${stats.avgConf}%`,icon:"🔒",note:"Evidence confidence"},
                {label:"Conflict Flags",value:stats.conflicts,icon:"⚠️",note:"Require review"},
              ].map(({label,value,icon,note})=>(
                <div key={label} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:12,color:"#64748b",fontWeight:600}}>{label}</div>
                    <span style={{fontSize:20}}>{icon}</span>
                  </div>
                  <div style={{fontSize:28,fontWeight:800,color:G}}>{value}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{note}</div>
                </div>
              ))}
            </div>

            {/* Filter Tabs + Table */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,overflow:"hidden",marginBottom:20}}>
              <div style={{padding:"20px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <h3 style={{fontSize:16,fontWeight:700,color:G,margin:0}}>Farmer Credit Profiles</h3>
                <button onClick={()=>setShowHistory(true)} style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>📋 Access History</button>
              </div>
              <div style={{display:"flex",gap:0,padding:"0 24px",borderBottom:"1px solid #f1f5f9"}}>
                {["All","High Confidence","Needs Review","Conflict"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"12px 16px",fontSize:12,fontWeight:600,border:"none",borderBottom:filter===f?`2px solid ${G}`:"2px solid transparent",background:"none",cursor:"pointer",color:filter===f?G:"#94a3b8",whiteSpace:"nowrap"}}>
                    {f}
                  </button>
                ))}
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#f8fafc"}}>
                    {["Farmer","Score","Repayment Capacity","Recommended Limit","Confidence","Status","Action"].map(h=>(
                      <th key={h} style={{padding:"10px 20px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f,i)=>(
                    <tr key={i} style={{borderTop:"1px solid #f1f5f9",background:f.has_conflicts?"#fff5f5":"#fff"}}>
                      <td style={{padding:"14px 20px"}}>
                        <div style={{fontWeight:700,color:G}}>{f.name}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{f.code} · {f.location} · {f.crop}</div>
                      </td>
                      <td style={{padding:"14px 20px"}}>
                        <div style={{fontWeight:800,fontSize:18,color:scoreColor(f.credit_score)}}>{f.credit_score}</div>
                      </td>
                      <td style={{padding:"14px 20px",fontWeight:600}}>₹{(f.repayment_capacity||0).toLocaleString("en-IN")}</td>
                      <td style={{padding:"14px 20px",fontWeight:700,color:G}}>₹{(f.recommended_limit||0).toLocaleString("en-IN")}</td>
                      <td style={{padding:"14px 20px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:50,height:6,background:"#e2e8f0",borderRadius:3,overflow:"hidden"}}>
                            <div style={{width:`${f.evidence_confidence||80}%`,height:"100%",background:f.evidence_confidence>=85?"#16a34a":f.evidence_confidence>=70?"#d97706":"#dc2626"}}/>
                          </div>
                          <strong style={{color:scoreColor(f.evidence_confidence),fontSize:12}}>{f.evidence_confidence}%</strong>
                        </div>
                      </td>
                      <td style={{padding:"14px 20px"}}>
                        <span style={{...statusStyle(f.risk_status),padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700}}>
                          {f.has_conflicts?"⚠️ Conflict":f.risk_status}
                        </span>
                      </td>
                      <td style={{padding:"14px 20px"}}>
                        <button onClick={()=>setSelected(f)} style={{background:G,color:"#86efac",border:"none",padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"14px 20px"}}>
              <p style={{fontSize:12,color:"#92400e",margin:0}}>⚠️ <strong>Mandatory Disclaimer:</strong> AI-generated assessment for decision support. Final lending decisions remain with the authorized financial institution. System never auto-approves any loan.</p>
            </div>
          </>
        ) : (
          /* Farmer Credit Profile Detail */
          <div>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}>
              <button onClick={()=>setSelected(null)} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#475569"}}>← Back</button>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:2}}>Farmer Credit Profile</div>
                <h1 style={{fontSize:22,fontWeight:800,color:G,margin:0}}>{selected.name}</h1>
              </div>
            </div>

            {/* Consent Banner */}
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"14px 20px",marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
              <span>🔒</span>
              <div style={{fontSize:12,color:"#166534"}}>
                <strong>Farmer-Consented Access.</strong> {selected.name} has explicitly granted your institution access. You see only score, evidence summary, and explanation — never raw financial data. Access is revocable by farmer at any time.
              </div>
            </div>

            {/* Score + Quick Stats */}
            <div style={{background:G,borderRadius:20,padding:32,color:"#fff",marginBottom:20,display:"grid",gridTemplateColumns:"auto 1fr",gap:32,alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <ScoreRing score={selected.credit_score}/>
                <div style={{fontSize:10,color:"#86efac",textTransform:"uppercase",fontWeight:700,letterSpacing:1}}>Credit Score</div>
              </div>
              <div>
                <div style={{fontSize:11,color:"#4ade80",fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Credit Intelligence Summary</div>
                <h2 style={{fontSize:20,fontWeight:800,margin:"0 0 16px",fontFamily:"Georgia,serif"}}>{selected.name} — {selected.code}</h2>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                  {[
                    ["Repayment Capacity",`₹${(selected.repayment_capacity||0).toLocaleString("en-IN")}`,"#86efac"],
                    ["Recommended Limit",`₹${(selected.recommended_limit||0).toLocaleString("en-IN")}`,A],
                    ["Evidence Confidence",`${selected.evidence_confidence}%`,"#fff"],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{background:"#ffffff12",borderRadius:10,padding:"12px 16px"}}>
                      <div style={{fontSize:10,color:"#86efac",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Repayment Breakdown */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24,marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,color:G,margin:"0 0 16px"}}>Repayment Capacity Breakdown</h3>
              <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
                <tbody>
                  {[
                    ["Seasonal Income (estimated)", "Rs." + Math.round((selected.repayment_capacity+selected.repayment_capacity*0.5)||180000).toLocaleString("en-IN"), "credit"],
                    ["Seasonal Expenses (estimated)", "-Rs." + Math.round((selected.repayment_capacity*0.3)||45000).toLocaleString("en-IN"), "debit"],
                    ["Existing Debt Obligations", "-Rs." + Math.round((selected.repayment_capacity*0.1)||12000).toLocaleString("en-IN"), "debit"],
                    ["= Net Repayment Capacity", "Rs." + (selected.repayment_capacity||0).toLocaleString("en-IN"), "result"],
                  ].map(([l,v,type],i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:type==="result"?"#f0fdf4":"#fff"}}>
                      <td style={{padding:"12px 0",fontWeight:type==="result"?800:500,color:G}}>{l}</td>
                      <td style={{padding:"12px 0",textAlign:"right",fontWeight:800,color:type==="credit"?"#16a34a":type==="debit"?"#dc2626":"#0a3622",fontSize:type==="result"?16:14}}>
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Purpose Split */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:24,marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,color:G,margin:"0 0 16px"}}>Recommended Credit Purpose (§5.6a)</h3>
              {[
                ["🌱 Crop Inputs","60%",Math.round((selected.recommended_limit||0)*0.6),"#16a34a"],
                ["👷 Labour","20%",Math.round((selected.recommended_limit||0)*0.2),"#d97706"],
                ["💧 Irrigation","20%",Math.round((selected.recommended_limit||0)*0.2),"#2563eb"],
              ].map(([l,pct,amt,c])=>(
                <div key={l} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:6}}>
                    <span>{l}</span><span style={{color:"#64748b"}}>{pct} · ₹{amt.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{width:"100%",height:8,background:"#e2e8f0",borderRadius:4,overflow:"hidden"}}>
                    <div style={{width:pct,height:"100%",background:c,borderRadius:4}}/>
                  </div>
                </div>
              ))}
            </div>

            {selected.has_conflicts && (
              <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontWeight:700,fontSize:13,color:"#991b1b",marginBottom:4}}>⚠️ Evidence Conflict Flagged</div>
                <div style={{fontSize:12,color:"#b91c1c"}}>This farmer has {selected.conflicts_count} conflicting evidence claim(s). A variance &gt;20% was detected between farmer self-declared data and external sources. Confidence was reduced by 40% for affected claims. Additional due diligence recommended before decision.</div>
              </div>
            )}

            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"14px 20px"}}>
              <p style={{fontSize:12,color:"#92400e",margin:0}}>⚠️ <strong>Mandatory Disclaimer:</strong> AI-generated assessment for decision support. Final lending decisions remain with the authorized financial institution.</p>
            </div>
          </div>
        )}
      </main>

      {/* Access History Modal */}
      {showHistory && (
        <div style={{position:"fixed",inset:0,background:"#00000060",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div style={{background:"#fff",borderRadius:20,padding:32,maxWidth:520,width:"100%",margin:16,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontSize:18,fontWeight:800,color:G,margin:0}}>📋 Access History</h3>
              <button onClick={()=>setShowHistory(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#64748b"}}>✕</button>
            </div>
            <p style={{fontSize:12,color:"#64748b",margin:"0 0 16px"}}>All accesses are logged in the farmer's tamper-evident audit trail. Farmer can see this history too.</p>
            {accessHistory.map((h,i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #f1f5f9",alignItems:"flex-start"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>📄</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:G}}>{h.event}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{h.farmer} · {h.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

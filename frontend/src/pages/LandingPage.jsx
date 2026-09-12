import { Link } from "react-router-dom";

const G = "#0a3622"; const A = "#e6b15c"; const L = "#f0fdf4";

function Card({icon,title,desc}){
  return(
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"28px 24px",flex:1,minWidth:200}}>
      <div style={{fontSize:32,marginBottom:12}}>{icon}</div>
      <div style={{fontWeight:700,fontSize:14,color:G,marginBottom:6}}>{title}</div>
      <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>{desc}</div>
    </div>
  );
}

function Step({n,title,desc}){
  return(
    <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:G,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{n}</div>
      <div>
        <div style={{fontWeight:700,fontSize:14,color:G,marginBottom:4}}>{title}</div>
        <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>{desc}</div>
      </div>
    </div>
  );
}

export default function LandingPage(){
  return(
    <div>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${G} 0%,#124d32 100%)`,color:"#fff",padding:"80px 40px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#ffffff15",border:"1px solid #ffffff30",borderRadius:100,padding:"6px 16px",fontSize:12,marginBottom:24,fontWeight:600}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}></span>
          IBM National Hackathon 2026 · Problem Statement 2
        </div>
        <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.15,marginBottom:16,fontFamily:"Georgia,serif"}}>
          Saboot Se Score,<br/><span style={{color:A}}>Kisan Ka Control.</span>
        </h1>
        <p style={{fontSize:18,color:"#86efac",maxWidth:600,margin:"0 auto 40px",lineHeight:1.7}}>
          Verified Proof. Farmer-Owned Trust. Turn real agricultural activity into a portable, explainable credit profile — that the farmer owns and controls.
        </p>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <Link to="/login" style={{background:A,color:G,padding:"14px 32px",borderRadius:10,fontWeight:800,fontSize:15,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8}}>
            🌾 I am a Farmer
          </Link>
          <Link to="/login" style={{background:"transparent",color:"#fff",padding:"14px 32px",borderRadius:10,fontWeight:700,fontSize:15,textDecoration:"none",border:"2px solid #ffffff50",display:"inline-flex",alignItems:"center",gap:8}}>
            🤝 I am an FPO Member
          </Link>
          <Link to="/login" style={{background:"transparent",color:"#fff",padding:"14px 32px",borderRadius:10,fontWeight:700,fontSize:15,textDecoration:"none",border:"2px solid #ffffff50",display:"inline-flex",alignItems:"center",gap:8}}>
            🏛️ I am a Lender / NBFC
          </Link>
        </div>
      </div>

      {/* Stats Banner */}
      <div style={{background:A,display:"flex",justifyContent:"center",gap:60,padding:"20px 40px",flexWrap:"wrap"}}>
        {[["20","Farmers Enrolled"],["100","Evidence Claims"],["87%","Evidence Verified"],["0","Raw Data Exposed"]].map(([n,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:800,color:G}}>{n}</div>
            <div style={{fontSize:11,color:"#5c4a1e",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"60px 32px"}}>
        {/* Differentiator */}
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:2,color:"#16a34a",textTransform:"uppercase",marginBottom:8}}>Why KrishiPramaan?</div>
          <h2 style={{fontSize:32,fontWeight:800,color:G,fontFamily:"Georgia,serif",marginBottom:16}}>Not just a credit score — a <em>Trust Engine</em></h2>
          <p style={{fontSize:15,color:"#475569",maxWidth:700,margin:"0 auto",lineHeight:1.8}}>
            Every claim is checked against multiple sources. Every score is explained. The farmer controls who sees it. We're not building another CIBIL for agriculture — we're building sovereign, evidence-first agricultural identity.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:64}}>
          <Card icon="🗄️" title="Evidence Vault" desc="Every data point stored as claim → source → confidence. PM-KISAN (0.98), Market transactions (0.95), FPO verification (0.92), Self-declared (0.55)."/>
          <Card icon="⚠️" title="Conflict Detection" desc="Auto-flags when farmer claim vs market data diverges >20%. Confidence reduced for that claim. Fully transparent."/>
          <Card icon="🧠" title="Explainable Score" desc="One function, four outputs: creditworthiness score, repayment capacity, recommended limit, and plain-language explanation."/>
          <Card icon="🔑" title="Farmer-Owned Consent" desc="Farmer grants or revokes lender access any time. Every event recorded in a tamper-evident audit log."/>
        </div>

        {/* How it Works */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginBottom:64,alignItems:"start"}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:2,color:"#16a34a",textTransform:"uppercase",marginBottom:8}}>Demo Journey</div>
            <h2 style={{fontSize:28,fontWeight:800,color:G,fontFamily:"Georgia,serif",marginBottom:28}}>How KrishiPramaan Works</h2>
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              <Step n={1} title="Farmer submits activity data" desc="Land, crop, income — some self-declared, some from government records."/>
              <Step n={2} title="FPO attests the claim" desc="Community member vouches, optionally submits their own value. Conflict check fires automatically."/>
              <Step n={3} title="Credit Intelligence runs" desc="Score (0–100), repayment capacity, recommended credit limit, and per-factor explanation generated."/>
              <Step n={4} title="Farmer grants lender access" desc="Only the consented lender sees the score + evidence. Farmer can revoke any time. Audit log records it."/>
            </div>
          </div>
          <div style={{background:G,borderRadius:20,padding:32,color:"#fff"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#4ade80",textTransform:"uppercase",marginBottom:4}}>Hackathon Evaluation</div>
            <h3 style={{fontSize:20,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:20}}>We answer all 6 official questions</h3>
            {[
              ["Who is a trustworthy borrower?","Evidence confidence + community trust score"],
              ["How much credit can safely be extended?","Recommended limit (repayment × risk factor)"],
              ["What should credit be used for?","60% crop inputs / 20% labour / 20% irrigation"],
              ["Can the farmer repay from crop income?","Repayment capacity = income − expenses − debt"],
              ["How can community reduce lending risk?","FPO aggregate risk + attestation coverage"],
              ["Better credit without data surrender?","Consent/revoke + tamper-evident audit log"],
            ].map(([q,a])=>(
              <div key={q} style={{borderBottom:"1px solid #ffffff20",padding:"10px 0",display:"flex",gap:12}}>
                <span style={{color:A,fontSize:14,flexShrink:0}}>→</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#d1fae5",marginBottom:2}}>{q}</div>
                  <div style={{fontSize:11,color:"#86efac"}}>{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"20px 28px",textAlign:"center"}}>
          <p style={{fontSize:13,color:"#92400e",margin:0}}>
            ⚠️ <strong>Mandatory Disclaimer:</strong> AI-generated assessment for decision support. Final lending decisions remain with the authorized financial institution.
          </p>
        </div>
      </div>
    </div>
  );
}

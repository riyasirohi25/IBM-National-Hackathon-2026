import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const G = "#0a3622"; const A = "#e6b15c";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login", { email, password });
      if (res.data.success) {
        onLogin(res.data.data);
        const { role, linked_id } = res.data.data;
        if (role === "farmer") navigate(`/farmer/${linked_id}`);
        else if (role === "fpo") navigate(`/fpo/${linked_id}`);
        else if (role === "lender") navigate(`/lender/${linked_id}`);
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 38px)", background: "#f8faf9", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 16, border: "1px solid #e2e8f0", width: "100%", maxWidth: 440, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: G, marginBottom: 8, textAlign: "center" }}>Welcome Back</h2>
        <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 }}>Sign in to your KrishiPramaan account</p>
        
        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca" }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: G, marginBottom: 6 }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: G, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button type="submit" style={{ background: G, color: A, padding: "14px", borderRadius: 8, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", marginTop: 8 }}>
            Sign In
          </button>
        </form>
        
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#64748b" }}>
          Don't have an account? <Link to="/register" style={{ color: G, fontWeight: 700, textDecoration: "none" }}>Register here</Link>
        </div>

        <div style={{ marginTop: 32, padding: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12 }}>
          <h4 style={{ fontSize: 12, fontWeight: 800, color: "#166534", margin: "0 0 12px 0", textTransform: "uppercase" }}>🛠️ Demo Credentials</h4>
          <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
            <button onClick={()=>{setEmail('farmer@demo.com');setPassword('demo123')}} style={{textAlign:"left", padding:8, background:"#fff", border:"1px solid #bbf7d0", borderRadius:6, cursor:"pointer"}}>🌾 <b>Farmer:</b> farmer@demo.com / demo123</button>
            <button onClick={()=>{setEmail('fpo@demo.com');setPassword('demo123')}} style={{textAlign:"left", padding:8, background:"#fff", border:"1px solid #bbf7d0", borderRadius:6, cursor:"pointer"}}>🤝 <b>FPO:</b> fpo@demo.com / demo123</button>
            <button onClick={()=>{setEmail('lender@demo.com');setPassword('demo123')}} style={{textAlign:"left", padding:8, background:"#fff", border:"1px solid #bbf7d0", borderRadius:6, cursor:"pointer"}}>🏛️ <b>Lender:</b> lender@demo.com / demo123</button>
          </div>
        </div>
      </div>
    </div>
  );
}

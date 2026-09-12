import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import FPODashboard from "./pages/FPODashboard";
import LenderDashboard from "./pages/LenderDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function TopBar({ user, onLogout }) {
  return (
    <div style={{background:"#071a0e",color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 16px",borderBottom:"1px solid #1a3c28",position:"sticky",top:0,zIndex:100}}>
      <Link to="/" style={{fontWeight:700,letterSpacing:2,color:"#4ade80",textTransform:"uppercase",fontSize:10, textDecoration: "none"}}>🌾 KrishiPramaan · IBM Hackathon 2026</Link>
      <div style={{display:"flex",gap:4, alignItems: "center"}}>
        {!user ? (
          <>
            <Link to="/login" style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600,textDecoration:"none",color:"#9ca3af"}}>Login</Link>
            <Link to="/register" style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:700,textDecoration:"none",background:"#e6b15c",color:"#071a0e"}}>Register</Link>
          </>
        ) : (
          <>
            <span style={{color: "#e6b15c", fontWeight: 700, marginRight: 8}}>{user.name} ({user.role.toUpperCase()})</span>
            <button onClick={onLogout} style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600,textDecoration:"none",background:"transparent",color:"#fca5a5",border:"1px solid #7f1d1d",cursor:"pointer"}}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("kp_token");
    if (token) {
      axios.get(`http://localhost:8000/api/v1/auth/me?token=${token}`)
        .then(res => {
          if (res.data.success) setUser(res.data.data);
        })
        .catch(() => localStorage.removeItem("kp_token"));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("kp_token", userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    if (user?.token) {
      axios.post(`http://localhost:8000/api/v1/auth/logout?token=${user.token}`).catch(()=>{});
    }
    localStorage.removeItem("kp_token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,sans-serif",background:"#f8faf9"}}>
        <TopBar user={user} onLogout={handleLogout} />
        <div style={{flex:1}}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="/farmer/:id" element={<FarmerDashboard />} />
            <Route path="/fpo/:id" element={<FPODashboard />} />
            <Route path="/lender/:id" element={<LenderDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

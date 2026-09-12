import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const G = "#0a3622"; const A = "#e6b15c";

function Input({ label, type="text", value, onChange, required=true, flex=1 }) {
  return (
    <div style={{ flex }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: G, marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} required={required} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

export default function RegisterPage({ onLogin }) {
  const [role, setRole] = useState("farmer");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    let endpoint = `http://localhost:8000/api/v1/auth/register/${role}`;
    let payload = { ...formData };
    
    // Type casting for Farmer
    if (role === "farmer") {
      payload.age = parseInt(payload.age) || 30;
      payload.land_area_acres = parseFloat(payload.land_area_acres) || 0;
      payload.seasonal_income = parseFloat(payload.seasonal_income) || 0;
      payload.seasonal_expenses = parseFloat(payload.seasonal_expenses) || 0;
      payload.existing_debt_amount = parseFloat(payload.existing_debt_amount) || 0;
      payload.irrigation_available = payload.irrigation_available === "true" || payload.irrigation_available === true;
      payload.pmkisan_enrollment = payload.pmkisan_enrollment === "true" || payload.pmkisan_enrollment === true;
    }

    try {
      const res = await axios.post(endpoint, payload);
      if (res.data.success) {
        onLogin(res.data.data);
        const { role: r, linked_id } = res.data.data;
        if (r === "farmer") navigate(`/farmer/${linked_id}`);
        else if (r === "fpo") navigate(`/fpo/${linked_id}`);
        else if (r === "lender") navigate(`/lender/${linked_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please check your inputs.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 38px)", background: "#f8faf9", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 16, border: "1px solid #e2e8f0", width: "100%", maxWidth: 640, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: G, marginBottom: 8, textAlign: "center" }}>Join KrishiPramaan</h2>
        <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 }}>Select your role and create an account</p>
        
        <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: "#f1f5f9", borderRadius: 10 }}>
          {[
            { id: "farmer", icon: "🌾", label: "Farmer" },
            { id: "fpo", icon: "🤝", label: "FPO" },
            { id: "lender", icon: "🏛️", label: "Lender" }
          ].map(r => (
            <button key={r.id} onClick={() => { setRole(r.id); setFormData({}); setError(""); }} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, background: role === r.id ? "#fff" : "transparent", fontWeight: 700, fontSize: 13, color: role === r.id ? G : "#64748b", cursor: "pointer", boxShadow: role === r.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca" }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <Input label="Email Address" type="email" value={formData.email||""} onChange={v=>update("email",v)} />
            <Input label="Password" type="password" value={formData.password||""} onChange={v=>update("password",v)} />
          </div>
          
          {role === "farmer" && (
            <>
              <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: G, margin: "0 0 16px 0" }}>Personal Details</h3>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <Input label="Full Name" value={formData.name||""} onChange={v=>update("name",v)} />
                  <Input label="Age" type="number" value={formData.age||""} onChange={v=>update("age",v)} flex={0.5} />
                  <div style={{ flex: 0.5 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: G, marginBottom: 6 }}>Gender</label>
                    <select value={formData.gender||""} onChange={e=>update("gender",e.target.value)} required style={{ width: "100%", padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}>
                      <option value="">Select...</option>
                      <option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <Input label="State" value={formData.state||""} onChange={v=>update("state",v)} />
                  <Input label="District" value={formData.district||""} onChange={v=>update("district",v)} />
                </div>
              </div>
              <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: G, margin: "0 0 16px 0" }}>Agricultural Profile</h3>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <Input label="Primary Crop" value={formData.primary_crop||""} onChange={v=>update("primary_crop",v)} />
                  <Input label="Season" value={formData.season||""} onChange={v=>update("season",v)} />
                  <Input label="Land Area (Acres)" type="number" value={formData.land_area_acres||""} onChange={v=>update("land_area_acres",v)} />
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <Input label="Seasonal Income (₹)" type="number" value={formData.seasonal_income||""} onChange={v=>update("seasonal_income",v)} />
                  <Input label="Seasonal Expenses (₹)" type="number" value={formData.seasonal_expenses||""} onChange={v=>update("seasonal_expenses",v)} />
                  <Input label="Existing Debt (₹)" type="number" value={formData.existing_debt_amount||""} onChange={v=>update("existing_debt_amount",v)} required={false} />
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id="irrigation" checked={formData.irrigation_available===true} onChange={e=>update("irrigation_available",e.target.checked)} />
                    <label htmlFor="irrigation" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Irrigation Available</label>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id="pmkisan" checked={formData.pmkisan_enrollment===true} onChange={e=>update("pmkisan_enrollment",e.target.checked)} />
                    <label htmlFor="pmkisan" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>PM-KISAN Enrolled</label>
                  </div>
                </div>
              </div>
            </>
          )}

          {role === "fpo" && (
            <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <Input label="Contact Person Name" value={formData.name||""} onChange={v=>update("name",v)} />
                <Input label="FPO Name" value={formData.fpo_name||""} onChange={v=>update("fpo_name",v)} />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <Input label="State" value={formData.state||""} onChange={v=>update("state",v)} />
                <Input label="District" value={formData.district||""} onChange={v=>update("district",v)} />
              </div>
            </div>
          )}

          {role === "lender" && (
            <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <Input label="Contact Name" value={formData.name||""} onChange={v=>update("name",v)} />
                <Input label="Institution Name" value={formData.institution_name||""} onChange={v=>update("institution_name",v)} />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: G, marginBottom: 6 }}>Institution Type</label>
                  <select value={formData.institution_type||""} onChange={e=>update("institution_type",e.target.value)} required style={{ width: "100%", padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}>
                    <option value="">Select...</option>
                    <option value="Bank">Bank</option><option value="NBFC">NBFC</option><option value="MFI">Microfinance (MFI)</option><option value="Co-operative">Co-operative</option>
                  </select>
                </div>
                <Input label="License Number" value={formData.license_number||""} onChange={v=>update("license_number",v)} required={false} />
              </div>
            </div>
          )}

          <button type="submit" style={{ background: G, color: A, padding: "14px", borderRadius: 8, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", marginTop: 8 }}>
            Create Account
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#64748b" }}>
          Already have an account? <Link to="/login" style={{ color: G, fontWeight: 700, textDecoration: "none" }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

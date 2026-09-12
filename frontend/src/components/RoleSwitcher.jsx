import { Link, useLocation } from 'react-router-dom';

export default function RoleSwitcher() {
  const location = useLocation();
  const path = location.pathname;

  const isFarmer = path.startsWith('/farmer');
  const isFPO = path.startsWith('/fpo');
  const isLender = path.startsWith('/lender');
  const isHome = path === '/';

  return (
    <div className="bg-[#051c11] text-white text-xs px-4 py-2 flex items-center justify-between border-b border-emerald-900/80 z-50 shrink-0">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-bold text-gray-300 uppercase tracking-widest text-[10px]">KrishiPramaan Ecosystem Hub:</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          to="/"
          className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${isHome ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <span>🏠</span> <span className="hidden md:inline">Home / Landing</span>
        </Link>

        <Link
          to="/farmer/1"
          className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${isFarmer ? 'bg-[#e6b15c] text-[#0a3622] font-bold shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <span>🌾</span> <span>1. Farmer Portal</span>
        </Link>

        <Link
          to="/fpo/1"
          className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${isFPO ? 'bg-[#e6b15c] text-[#0a3622] font-bold shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <span>🤝</span> <span>2. FPO Verification</span>
        </Link>

        <Link
          to="/lender/1"
          className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${isLender ? 'bg-[#e6b15c] text-[#0a3622] font-bold shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <span>🏛️</span> <span>3. Lender Intelligence</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
        <span>IBM Hackathon 2026 · Problem Statement 2</span>
      </div>
    </div>
  );
}

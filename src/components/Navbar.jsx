import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020817]/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-110">
           <span className="text-white text-xl">📦</span>
        </div>
        <span className="text-xl font-black text-white tracking-tighter">Lost&Found</span>
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-bold text-slate-400">
        <span className="hover:text-white cursor-pointer">Features</span>
        <span className="hover:text-white cursor-pointer">How it Works</span>
        <span className="hover:text-white cursor-pointer">Technology</span>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 hidden sm:block uppercase tracking-widest">{user.email}</span>
            <button onClick={async () => { await logout(); navigate("/"); }} className="bg-slate-800/50 hover:bg-red-900/20 text-red-400 border border-slate-700 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
              Logout →
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">Login</Link>
            <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
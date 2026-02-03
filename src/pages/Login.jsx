import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/browse"); // Navigate to the dashboard after login
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 font-medium">Reunite with your belongings</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700"
                placeholder="name@university.edu"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-4 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all transform active:scale-95 uppercase tracking-widest text-xs">
              Sign In →
            </button>
          </form>

          <p className="text-center text-slate-500 mt-10 text-sm font-medium">
            New to the platform?{" "}
            <Link to="/signup" className="text-cyan-400 font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
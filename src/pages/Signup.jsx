import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 1. Create user in Auth
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Update Firebase Profile
      await updateProfile(res.user, { displayName: formData.username });

      // 3. Create User Document in Firestore for Chat/Browse
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      alert("Signup Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Join the Community</h2>
          <p className="text-slate-400">Start finding and reporting items today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide uppercase text-[10px]">Unique Username</label>
            <input 
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors"
              placeholder="CoolFinder2026"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide uppercase text-[10px]">Email</label>
            <input 
              type="email" required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors"
              placeholder="you@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide uppercase text-[10px]">Password</label>
            <input 
              type="password" required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all uppercase tracking-widest text-xs mt-4">
            Create Free Account
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">Login Here</Link>
        </p>
      </div>
    </div>
  );
}
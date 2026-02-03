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
      // 1. Create Auth User
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Set Display Name (For Chat/Browse)
      await updateProfile(res.user, { displayName: formData.username });

      // 3. Save User to Firestore for search/chat functionality
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
      });

      navigate("/browse");
    } catch (err) {
      alert("Signup Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Get Started</h2>
            <p className="text-slate-400 font-medium">Join the campus community</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Unique Username</label>
              <input 
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="eg. AlexFinder"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="name@university.edu"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Create Password</label>
              <input 
                type="password" required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button className="w-full bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-4 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all transform active:scale-95 uppercase tracking-widest text-xs mt-4">
              Create Free Account →
            </button>
          </form>

          <p className="text-center text-slate-500 mt-10 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
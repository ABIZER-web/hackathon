import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create user in Firebase Authdivide into 5 people]
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Update Firebase Auth Profile for the 'displayName'divide into 5 people]
      await updateProfile(res.user, { displayName: formData.username });

      // 3. Create Persistent User Document in Firestoredivide into 5 people]
      // This step is critical for your ChatPage to show the correct username
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        username: formData.username,
        email: formData.email,
        createdAt: serverTimestamp(),
        isOnline: true
      });

      navigate("/browse");
    } catch (err) {
      console.error(err);
      alert("Signup Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/30 border border-slate-800/50 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
            <ShieldCheck className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Create Identity</h2>
          <p className="text-slate-500 text-sm font-medium">Join the network to start finding and reporting.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-700 shadow-inner"
                placeholder="Unique Handle"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Email Access</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="email" required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-700 shadow-inner"
                placeholder="you@university.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="password" required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-700 shadow-inner"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-[3px] text-xs mt-6 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? "Initializing..." : "Register Account →"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Already registered?{" "}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline transition-all">Authenticate Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
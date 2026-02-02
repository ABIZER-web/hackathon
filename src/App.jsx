import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc 
} from 'firebase/firestore';

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch Role from Firestore
          const docSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          } else {
            console.warn("User exists in Auth but no Role found in Firestore.");
            setRole('student'); // Fallback
          }
        } catch (e) {
          console.error("Firestore read error:", e.message);
          setRole('student'); // Fallback to allow app entry
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Database Test Function (Verify if DB is working)
  const verifyDatabase = async () => {
    try {
      const docRef = await addDoc(collection(db, "connection_tests"), {
        status: "Online",
        timestamp: new Date().toISOString(),
        tester: user?.email || "Anonymous"
      });
      console.log("✅ Database Working! ID:", docRef.id);
      alert("Success! Check Firebase Console for 'connection_tests' collection.");
    } catch (e) {
      console.error("❌ Database Error:", e.message);
      alert(`Database Error: ${e.message}\n\nCheck if Firestore is in 'Test Mode' and Billing is set correctly.`);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-mono animate-pulse">
      LOADING_SYSTEM...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Verification Tool (Visible only if keys are loaded) */}
      <button 
        onClick={verifyDatabase}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-black shadow-2xl z-50 transition-all active:scale-90"
      >
        TEST_DB_SYNC
      </button>

      {!user ? (
        <AuthScreen />
      ) : role === 'teacher' ? (
        <TeacherDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Save Role to Firestore
        await setDoc(doc(db, "users", res.user.uid), {
          email,
          role: selectedRole,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      alert(`Auth Error: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
      <form onSubmit={handleAuth} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] w-full max-w-md">
        <h2 className="text-4xl font-black text-center mb-2 tracking-tighter">
          {isLogin ? 'LOG_IN' : 'SIGN_UP'}
        </h2>
        <p className="text-slate-500 text-center text-[10px] tracking-[0.3em] font-bold mb-8 uppercase">Vibe Portal v2.0</p>
        
        <div className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full p-4 bg-white/5 rounded-xl border border-white/10 focus:border-blue-500 outline-none" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-4 bg-white/5 rounded-xl border border-white/10 focus:border-blue-500 outline-none" onChange={e => setPassword(e.target.value)} />
          
          {!isLogin && (
            <select className="w-full p-4 bg-slate-800 rounded-xl border border-white/10 text-white" onChange={e => setSelectedRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          )}

          <button disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black transition-all shadow-lg shadow-blue-600/20">
            {authLoading ? 'EXECUTING...' : isLogin ? 'BYPASS_AUTH' : 'CREATE_IDENTITY'}
          </button>
        </div>
        <p className="mt-6 text-center text-slate-500 text-xs">
          {isLogin ? "NO_ACCOUNT?" : "HAVE_ACCOUNT?"}{' '}
          <span className="text-white cursor-pointer font-bold hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "INITIALIZE_SIGNUP" : "PROCEED_TO_LOGIN"}
          </span>
        </p>
      </form>
    </div>
  );
};

const StudentDashboard = ({ user }) => (
  <div className="p-10">
    <div className="flex justify-between items-center mb-12">
      <h1 className="text-3xl font-black tracking-tighter">STUDENT_DASHBOARD</h1>
      <button onClick={() => signOut(auth)} className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs">TERMINATE_SESSION</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
        <p className="text-slate-500 text-[10px] font-bold mb-2">AUTH_IDENTITY</p>
        <p className="font-mono text-blue-400">{user.email}</p>
      </div>
    </div>
  </div>
);

const TeacherDashboard = ({ user }) => (
  <div className="p-10">
    <div className="flex justify-between items-center mb-12">
      <h1 className="text-3xl font-black tracking-tighter text-emerald-500">FACULTY_CONTROL</h1>
      <button onClick={() => signOut(auth)} className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs">TERMINATE_SESSION</button>
    </div>
    <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[2.5rem]">
      <h2 className="text-2xl font-bold mb-4">Professor View</h2>
      <p className="text-slate-400">Database is active and ready for grade entry.</p>
    </div>
  </div>
);

export default App;
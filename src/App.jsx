import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        setUser(currentUser);
        setRole(docSnap.data()?.role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Save role to Firestore
        await setDoc(doc(db, "users", res.user.uid), {
          email,
          role: selectedRole,
          createdAt: new Date()
        });
      }
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <form onSubmit={handleAuth} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Create Account'}</h2>
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 bg-slate-800 rounded border border-slate-700" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-3 mb-4 bg-slate-800 rounded border border-slate-700" onChange={(e) => setPassword(e.target.value)} />
        
        {!isLogin && (
          <select className="w-full p-3 mb-4 bg-slate-800 rounded border border-slate-700 text-slate-400" onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}

        <button className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          {isLogin ? 'Enter Portal' : 'Register'}
        </button>
        <p className="mt-4 text-center text-slate-400 cursor-pointer text-sm" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
};

const StudentDashboard = ({ user }) => (
  <div className="p-8">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <button onClick={() => auth.signOut()} className="text-red-400 hover:underline">Sign Out</button>
    </div>
    <div className="bg-slate-900 p-6 rounded-xl border border-blue-500/30">
      <p className="text-slate-400">Loged in as: {user.email}</p>
      <h3 className="text-xl mt-4 font-semibold text-blue-400">Current Courses: 0</h3>
    </div>
  </div>
);

const TeacherDashboard = ({ user }) => (
  <div className="p-8">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-emerald-400">Staff Control Panel</h1>
      <button onClick={() => auth.signOut()} className="text-red-400 hover:underline">Sign Out</button>
    </div>
    <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30">
      <p className="text-slate-400">Admin Email: {user.email}</p>
      <button className="mt-4 bg-emerald-600 px-4 py-2 rounded font-bold">Manage Students</button>
    </div>
  </div>
);

export default App;
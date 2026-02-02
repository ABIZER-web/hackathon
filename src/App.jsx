import React, { useState } from 'react';

const App = () => {
  const [user, setUser] = useState(null); // { name: '', role: '' }

  const handleLogin = (role) => {
    setUser({ name: role === 'student' ? 'Abizer (Student)' : 'Prof. Saify', role });
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return user.role === 'student' ? (
    <StudentDashboard user={user} logout={() => setUser(null)} />
  ) : (
    <TeacherDashboard user={user} logout={() => setUser(null)} />
  );
};

// --- Components ---

const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Vibe Portal</h1>
      <div className="space-y-4">
        <button 
          onClick={() => onLogin('student')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
        >
          Login as Student
        </button>
        <button 
          onClick={() => onLogin('teacher')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition"
        >
          Login as Teacher
        </button>
      </div>
    </div>
  </div>
);

const StudentDashboard = ({ user, logout }) => (
  <div className="min-h-screen bg-slate-50">
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <span className="font-bold">Student Portal</span>
      <button onClick={logout} className="underline">Logout</button>
    </nav>
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-blue-600">My Assignments</h3>
          <p className="text-slate-600">3 Pending tasks</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-blue-600">Attendance</h3>
          <p className="text-slate-600">85% - Good Standing</p>
        </div>
      </div>
    </main>
  </div>
);

const TeacherDashboard = ({ user, logout }) => (
  <div className="min-h-screen bg-slate-50">
    <nav className="bg-emerald-600 p-4 text-white flex justify-between">
      <span className="font-bold">Staff Panel</span>
      <button onClick={logout} className="underline">Logout</button>
    </nav>
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="font-bold text-emerald-600 mb-2">Class Management</h3>
        <button className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium">
          + Post New Announcement
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold text-emerald-600">Student Progress</h3>
        <p className="text-slate-600">Average Grade: A-</p>
      </div>
    </main>
  </div>
);

export default App;
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) { alert("Login Failed: " + err.message); }
  };

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <form onSubmit={handleLogin} className="p-8 border rounded shadow-md w-96 bg-white">
        <h2 className="text-2xl font-bold mb-4">Staff Login</h2>
        <input className="w-full p-2 border mb-3 rounded" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-2 border mb-3 rounded" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Sign In</button>
      </form>
    </div>
  );
}
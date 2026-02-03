import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold italic">Campus Lost&Found</Link>
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/" className="hover:underline">Board</Link>
            <Link to="/add" className="hover:underline">Report Found Item</Link>
            <button onClick={async () => { await logout(); navigate("/login"); }} className="bg-red-500 px-3 py-1 rounded">Logout</button>
          </>
        ) : (
          <Link to="/login" className="bg-white text-blue-600 px-4 py-1 rounded font-semibold">Login</Link>
        )}
      </div>
    </nav>
  );
}
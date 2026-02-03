import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Function to handle logout
  const logout = () => {
    return signOut(auth);
  };

  // Listener to check if a user is already logged in when the page loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use auth data in any component
export const useAuth = () => {
  return useContext(AuthContext);
};
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Page Imports
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ReportItem from "./pages/ReportItem";
import ChatPage from "./pages/ChatPage";

// Component Imports
import Navbar from "./components/Navbar";

/**
 * ProtectedRoute Component
 * Redirects unauthenticated users to the Login page if they try to 
 * access the Dashboard or Reporting features.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Background wrapper to maintain the deep navy aesthetic */}
        <div className="min-h-screen bg-[#020817] selection:bg-cyan-500/30">
          
          {/* Navbar stays fixed at the top across all pages */}
          <Navbar />

          <Routes>
            {/* 1. Public Landing Page: Visible to everyone on start */}
            <Route path="/" element={<Home />} />

            {/* 2. Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 3. Protected Dashboard: Access only after Login/Signup */}
            <Route 
              path="/browse" 
              element={
                <ProtectedRoute>
                  <Browse />
                </ProtectedRoute>
              } 
            />

            {/* 4. Protected Reporting Routes */}
            <Route 
              path="/report-lost" 
              element={
                <ProtectedRoute>
                  <ReportItem type="lost" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report-found" 
              element={
                <ProtectedRoute>
                  <ReportItem type="found" />
                </ProtectedRoute>
              } 
            />

            {/* 5. Protected Real-time Chat */}
            <Route 
              path="/chat/:receiverId" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />

            {/* 404 Redirect: Send unknown routes back to the Landing Page */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
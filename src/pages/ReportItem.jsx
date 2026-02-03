import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ReportItem({ type }) { // type can be 'lost' or 'found'
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Electronics",
    location: "",
    contact: "",
    description: ""
  });

  const isLost = type === 'lost';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "foundItems"), {
        ...formData,
        type: type, // 'lost' or 'found'
        reporterId: user.uid,
        reporterName: user.displayName || "Anonymous",
        status: "available",
        createdAt: new Date()
      });
      navigate("/browse");
    } catch (err) {
      alert("Error saving item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb / Type Indicator */}
        <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${
          isLost ? "bg-orange-500/10 text-orange-400 border border-orange-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
        }`}>
          Reporting {type} Item
        </div>

        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-2">Item Details</h2>
          <p className="text-slate-400 mb-8 font-medium">Please provide accurate information to help our AI match your item.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
                <input 
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Blue Backpack"
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <select 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Electronics</option>
                  <option>Books</option>
                  <option>Clothing</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Location {isLost ? "Lost" : "Found"}</label>
              <input 
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Library 2nd Floor"
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
              <input 
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="+91 XXXXX XXXXX"
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
              <textarea 
                rows="3"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Describe unique features, marks, or specific details..."
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                isLost 
                ? "bg-orange-600 hover:bg-orange-700 shadow-orange-900/20" 
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
              }`}
            >
              {loading ? "Processing..." : `Submit ${type} Report`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
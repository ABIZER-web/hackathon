import { useState, useRef } from "react";
import { db, storage } from "../firebase/config"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Camera, MapPin, Tag, Phone, Info, Loader2 } from "lucide-react"; 

export default function ReportItem({ type }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Electronics",
    location: "",
    contact: "",
    description: ""
  });

  const isLost = type === 'lost';

  // Handles Local Image Preview before uploading to Firebase
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in first");
    
    setLoading(true);
    try {
      let imageUrl = "";

      // 1. Upload Image to Firebase Storagedivide into 5 people]
      if (imageFile) {
        const storageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Save Data to Firestore
      await addDoc(collection(db, "foundItems"), {
        ...formData,
        imageUrl,
        type: type.toLowerCase(), 
        reporterId: user.uid,
        reporterName: user.displayName || user.email.split('@')[0],
        status: "available",
        createdAt: serverTimestamp(),
      });

      navigate("/browse");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Ensure your Firebase Storage is set up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] pt-24 pb-12 px-4 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Indicator */}
        <div className="mb-10 text-center md:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border backdrop-blur-md ${
            isLost ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isLost ? "bg-orange-500" : "bg-emerald-500"}`}></span>
            AI-Enhanced {type} Report
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Reunite with Details</h2>
          <p className="text-slate-500 mt-2">Our AI analyzes your photo for instant matching.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Image Upload Area */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden relative group shadow-2xl"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 group-hover:scale-105 transition-transform">
                  <Camera className="text-slate-600 w-12 h-12 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm font-bold">Upload Item Image</p>
                  <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-widest font-black">Visual ID Required</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800/50 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Item Name" icon={<Tag size={12}/>}>
                <input required className="input-style" placeholder="e.g. Silver Laptop" onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
              </InputGroup>

              <InputGroup label="Category" icon={<Info size={12}/>}>
                <select className="input-style cursor-pointer" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option>Electronics</option>
                  <option>Documents</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </InputGroup>
            </div>

            <InputGroup label={`Location ${isLost ? "Lost" : "Found"}`} icon={<MapPin size={12}/>}>
              <input required className="input-style" placeholder="e.g. Science Lab, 3rd Floor" onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </InputGroup>

            <InputGroup label="Contact Information" icon={<Phone size={12}/>}>
              <input required type="tel" className="input-style" placeholder="+91 XXXXX XXXXX" onChange={(e) => setFormData({...formData, contact: e.target.value})} />
            </InputGroup>

            <InputGroup label="Detailed Description" icon={<Info size={12}/>}>
              <textarea rows="3" className="input-style resize-none" placeholder="Describe unique features, scratches, or stickers..." onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </InputGroup>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] ${
                isLost 
                ? "bg-orange-600 hover:bg-orange-500 shadow-orange-900/30" 
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30"
              } disabled:opacity-40 text-white`}
            >
              {loading ? <Loader2 className="animate-spin" /> : null}
              {loading ? "Analyzing..." : `Publish ${type} Report`}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-style {
          width: 100%;
          background: rgba(2, 8, 23, 0.6);
          border: 1px solid rgba(30, 41, 59, 1);
          border-radius: 1rem;
          padding: 1rem;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-style:focus {
          outline: none;
          border-color: rgba(6, 182, 212, 1);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
        }
      `}</style>
    </div>
  );
}

function InputGroup({ label, children, icon }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
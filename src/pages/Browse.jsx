import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Search, X, Info, Clock, MapPin, User, 
  MessageSquare, ImageIcon, LayoutDashboard, 
  PackageSearch 
} from "lucide-react";

export default function Browse() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); 
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time synchronization with Firestore
    const q = query(collection(db, "foundItems"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(docs);
    });
    return unsubscribe;
  }, []);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "all" ? true : item.type === filter;
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#020817] p-8 text-white pt-24 selection:bg-cyan-500/30 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatBox title="Total Items" count={items.length} color="bg-blue-600" icon="📦" />
          <StatBox title="Lost Items" count={items.filter(i => i.type === 'lost').length} color="bg-orange-600" icon="⊗" />
          <StatBox title="Found Items" count={items.filter(i => i.type === 'found').length} color="bg-emerald-600" icon="✔" />
        </div>

        {/* Action Header & Advanced Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search items or locations..."
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 backdrop-blur-md transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="bg-slate-900/40 border border-slate-800 p-1.5 rounded-xl flex gap-2 backdrop-blur-md">
              <FilterBtn active={filter === "all"} label="All" onClick={() => setFilter("all")} />
              <FilterBtn active={filter === "lost"} label="Lost" onClick={() => setFilter("lost")} />
              <FilterBtn active={filter === "found"} label="Found" onClick={() => setFilter("found")} />
            </div>
            
            <div className="flex gap-4">
              <Link to="/report-lost" className="bg-orange-600 hover:bg-orange-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 active:scale-95">
                Report Lost
              </Link>
              <Link to="/report-found" className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                Report Found
              </Link>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800/50 rounded-3xl py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-inner text-cyan-500">📦</div>
            <h3 className="text-2xl font-bold mb-2">No results found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                currentUser={user} 
                onView={() => setSelectedItem(item)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* FLOATING CHAT LOGO */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <Link 
          to="/chat/all" 
          className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-900/40 hover:scale-110 active:scale-95 transition-all border border-white/10 relative"
        >
          <MessageSquare size={28} className="text-white" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020817] animate-pulse"></span>
          
          <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 uppercase tracking-widest">
            Open Chat List
          </span>
        </Link>
      </div>

      {/* QUICK VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020817]/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10 p-2 bg-slate-950/50 rounded-full"
            >
              <X size={24} />
            </button>
            
            {selectedItem.imageUrl ? (
              <img src={selectedItem.imageUrl} alt="Item" className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-slate-800 flex items-center justify-center text-slate-600">
                <ImageIcon size={48} />
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedItem.type === 'lost' ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {selectedItem.type}
                </span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12}/> {selectedItem.createdAt?.seconds ? new Date(selectedItem.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                </span>
              </div>
              
              <h2 className="text-3xl font-black mb-4 tracking-tight">{selectedItem.itemName}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{selectedItem.description || "No additional description provided."}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm font-bold text-slate-200 truncate">{selectedItem.location}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reporter</p>
                  <p className="text-sm font-bold text-cyan-400 truncate">@{selectedItem.reporterName}</p>
                </div>
              </div>

              {user?.uid !== selectedItem.reporterId && (
                <Link 
                  to={`/chat/${selectedItem.reporterId}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Initiate Secure Chat
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, currentUser, onView }) {
  const isOwner = currentUser?.uid === item.reporterId;

  const handleClaimed = async (e) => {
    e.stopPropagation();
    if (window.confirm("Mark this item as resolved? This will remove it from the board.")) {
      await deleteDoc(doc(db, "foundItems", item.id));
    }
  };

  return (
    <div 
      onClick={onView}
      className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-all group backdrop-blur-md flex flex-col h-full cursor-pointer relative overflow-hidden active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[2px] ${
          item.type === 'lost' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        }`}>
          {item.type}
        </span>
        <button className="text-slate-600 group-hover:text-cyan-400 transition-colors">
          <Info size={18} />
        </button>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors tracking-tight truncate">
        {item.itemName}
      </h3>
      
      <div className="space-y-3 mb-8 text-sm flex-grow">
        <p className="text-slate-400 flex items-center gap-3 font-medium">
          <span className="bg-slate-800 p-2 rounded-lg text-cyan-500"><MapPin size={14}/></span> 
          <span className="text-slate-200 truncate">{item.location}</span>
        </p>
        <p className="text-slate-400 flex items-center gap-3 font-medium">
          <span className="bg-slate-800 p-2 rounded-lg text-cyan-500"><User size={14}/></span>
          <div className="flex gap-1 min-w-0">
            <span className="text-slate-500">By</span>
            <span className="text-cyan-400 font-bold truncate">@{item.reporterName}</span>
          </div>
        </p>
      </div>

      <div className="flex gap-3 mt-auto" onClick={e => e.stopPropagation()}>
        {isOwner ? (
          <button 
            onClick={handleClaimed} 
            className="w-full bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-white py-3.5 rounded-2xl font-bold text-sm transition-all border border-slate-700"
          >
            Mark as Reunited
          </button>
        ) : (
          <Link 
            to={`/chat/${item.reporterId}`} 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-3.5 rounded-2xl font-bold text-sm text-center shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} /> Message Finder
          </Link>
        )}
      </div>
    </div>
  );
}

function FilterBtn({ active, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
        active ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function StatBox({ title, count, color, icon }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-7 rounded-3xl flex justify-between items-center group hover:bg-slate-900/60 transition-colors">
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] mb-2">{title}</p>
        <h2 className="text-5xl font-black">{count}</h2>
      </div>
      <div className={`${color} w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-black/40`}>
        {icon}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Browse() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "foundItems"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const filteredItems = items.filter(i => filter === "all" ? true : i.type === filter);

  return (
    <div className="min-h-screen bg-[#020817] p-8 text-white pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Box title="Total Items" count={items.length} color="bg-blue-600" />
          <Box title="Lost Items" count={items.filter(i => i.type === 'lost').length} color="bg-orange-600" />
          <Box title="Found Items" count={items.filter(i => i.type === 'found').length} color="bg-emerald-600" />
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-2 rounded-2xl mb-10 flex flex-wrap gap-4 items-center">
          <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            <button onClick={() => setFilter("all")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === "all" ? "bg-cyan-500" : "text-slate-400"}`}>All Items</button>
            <button onClick={() => setFilter("lost")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === "lost" ? "bg-orange-500" : "text-slate-400"}`}>Lost Items</button>
            <button onClick={() => setFilter("found")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === "found" ? "bg-emerald-500" : "text-slate-400"}`}>Found Items</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-all backdrop-blur-sm">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[2px] bg-slate-800 text-cyan-400 border border-slate-700">{item.type}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.itemName}</h3>
              <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">📍 {item.location}</p>
              <div className="flex flex-col gap-3">
                <Link to={`/chat/${item.reporterId}`} className="text-cyan-400 font-bold hover:underline">@{item.reporterName}</Link>
                <Link to={`/chat/${item.receiverId}`} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-2xl font-bold text-sm text-center shadow-lg transition-all">Chat Now</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Box({ title, count, color }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-7 rounded-3xl flex justify-between items-center">
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] mb-2">{title}</p>
        <h2 className="text-5xl font-black">{count}</h2>
      </div>
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl`}>📦</div>
    </div>
  );
}
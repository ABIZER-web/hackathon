import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from "firebase/firestore";

export default function ChatPage() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  const chatId = [user.uid, receiverId].sort().join("_");

  useEffect(() => {
    const q = query(collection(db, "messages"), where("chatId", "==", chatId), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "messages"), {
      chatId, senderId: user.uid, text: newMessage, createdAt: serverTimestamp()
    });
    setNewMessage("");
  };

  return (
    <div className="h-screen bg-[#020817] flex flex-col pt-20">
      <div className="max-w-4xl w-full mx-auto px-6 py-4 border-b border-slate-800 flex items-center bg-slate-900/40 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="mr-4 text-slate-400 hover:text-white">← Back</button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white">C</div>
          <h2 className="font-bold text-white">Chat Session</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${msg.senderId === user.uid ? "bg-cyan-600" : "bg-slate-800"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={sendMessage} className="p-6 max-w-4xl mx-auto w-full flex gap-3">
        <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 outline-none" placeholder="Type a message..." />
        <button className="bg-cyan-600 px-10 py-4 rounded-2xl font-black uppercase text-xs">Send</button>
      </form>
    </div>
  );
}
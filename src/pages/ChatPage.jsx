import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, where, doc, getDoc, setDoc 
} from "firebase/firestore";
import { Send, ArrowLeft, ImageIcon } from "lucide-react";

export default function ChatPage() {
  const { receiverId } = useParams(); 
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverName, setReceiverName] = useState("User");
  const scrollRef = useRef();

  // Sabse important: Consistent Chat ID (Dono side same room join karenge)
  const chatId = [user.uid, receiverId].sort().join("_");

  // 1. Receiver ka data fetch karna (Header ke liye)
  useEffect(() => {
    const fetchReceiver = async () => {
      if (receiverId) {
        const userDoc = await getDoc(doc(db, "users", receiverId));
        if (userDoc.exists()) setReceiverName(userDoc.data().username);
      }
    };
    fetchReceiver();
  }, [receiverId]);

  // 2. Real-time Connection (Dono side sync karne ke liye)
  useEffect(() => {
    if (!chatId) return;
    
    const q = query(
      collection(db, "messages"), 
      where("chatId", "==", chatId), 
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      // Naye message par auto-scroll logic
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  // 3. Message Send karne ka fixed logic
  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Step A: Main 'messages' table mein entry
      await addDoc(collection(db, "messages"), {
        chatId: chatId,
        senderId: user.uid,
        receiverId: receiverId,
        text: newMessage,
        createdAt: serverTimestamp(),
      });

      // Step B: Sidebar updates ke liye 'chats' document update karna
      await setDoc(doc(db, "chats", chatId), {
        participants: [user.uid, receiverId],
        lastUpdate: serverTimestamp(),
        lastMessage: newMessage,
        lastSender: user.uid
      }, { merge: true });

      setNewMessage("");
    } catch (err) {
      console.error("Firebase update failed:", err);
    }
  };

  return (
    <div className="h-screen bg-[#020817] flex flex-col pt-20">
      {/* Header Profile */}
      <div className="bg-[#020817] border-b border-slate-800 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-cyan-500/20">
          {receiverName[0]}
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">{receiverName}</h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">● Online</p>
        </div>
      </div>

      {/* Messages Display Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? "items-end" : "items-start"}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl shadow-lg transition-all ${
              msg.senderId === user.uid 
                ? "bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20" 
                : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-black/40"
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[8px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">
              {msg.createdAt?.toDate() ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Sending..."}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-[#020817] border-t border-slate-800 backdrop-blur-md">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
          <button type="button" className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 transition-all">
            <ImageIcon size={20} />
          </button>
          <input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner" 
            placeholder="Type a message..." 
          />
          <button type="submit" className="bg-cyan-600 p-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            <Send size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
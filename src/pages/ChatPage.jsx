import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, storage } from "../firebase/config"; 
import { useAuth } from "../context/AuthContext";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, where, doc, setDoc, getDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Send, X, ArrowLeft, ImageIcon, MessageSquare, Search, Loader2 } from "lucide-react";

export default function ChatPage() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const scrollRef = useRef();

  const chatId = receiverId !== "all" ? [user.uid, receiverId].sort().join("_") : null;

  // 1. Sidebar Logic
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "chats"), 
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdate", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      setChatList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user.uid]);

  // 2. Receiver Name Fetch (Error Fix)
  useEffect(() => {
    if (receiverId && receiverId !== "all") {
      const fetchReceiver = async () => {
        const userDoc = await getDoc(doc(db, "users", receiverId));
        if (userDoc.exists()) {
          setReceiverName(userDoc.data().username);
        } else {
          setReceiverName("Unknown User");
        }
      };
      fetchReceiver();
    }
  }, [receiverId]);

  // 3. Real-time Messages
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "messages"), 
      where("chatId", "==", chatId), 
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, (error) => {
      console.error("Index required or Permission error:", error);
    });
  }, [chatId]);

  const sendMessage = async (e, imageUrl = null) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !imageUrl) || !chatId) return;

    const messageData = {
      chatId,
      senderId: user.uid,
      text: newMessage,
      imageUrl: imageUrl || null,
      replyTo: replyingTo ? { text: replyingTo.text, senderId: replyingTo.senderId } : null,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      await setDoc(doc(db, "chats", chatId), {
        participants: [user.uid, receiverId],
        lastUpdate: serverTimestamp(),
        lastMessage: imageUrl ? "Sent a photo" : newMessage,
        lastSender: user.uid
      }, { merge: true });

      setNewMessage("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="h-screen bg-[#020817] flex pt-20 overflow-hidden">
      {/* SIDEBAR */}
      <div className={`w-full md:w-80 border-r border-slate-800 bg-slate-900/20 flex flex-col ${receiverId !== 'all' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatList.map(chat => {
            const otherId = chat.participants.find(p => p !== user.uid);
            return (
              <Link key={chat.id} to={`/chat/${otherId}`} className={`flex items-center gap-3 p-4 border-b border-slate-800/30 ${receiverId === otherId ? 'bg-cyan-600/10' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-cyan-400">
                  {otherId?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">@{otherId?.slice(0,8)}</p>
                  <p className="text-[10px] text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className={`flex-1 flex flex-col bg-slate-900/10 ${receiverId === 'all' ? 'hidden md:flex' : 'flex'}`}>
        {receiverId !== 'all' ? (
          <>
            <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-4">
              <button onClick={() => navigate('/chat/all')} className="md:hidden text-slate-400"><ArrowLeft size={20}/></button>
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white uppercase">
                {receiverName?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-white font-bold text-sm leading-none">{receiverName || "Loading..."}</h2>
                <p className="text-[10px] text-emerald-400 font-bold tracking-widest mt-1">● Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[75%] p-4 rounded-2xl ${msg.senderId === user.uid ? "bg-cyan-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-slate-900/80 border-t border-slate-800">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-500" 
                  placeholder="Enter message..." 
                />
                <button type="submit" className="bg-cyan-600 p-4 rounded-2xl"><Send size={18} className="text-white"/></button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-bold">Select a chat to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
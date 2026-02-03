import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, storage } from "../firebase/config"; 
import { useAuth } from "../context/AuthContext";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, where, doc, setDoc, getDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Send, X, ArrowLeft, ImageIcon, MessageSquare, Loader2 } from "lucide-react";

export default function ChatPage() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const scrollRef = useRef();

  // Consistent Chat ID shared by both participants
  const chatId = receiverId !== "all" ? [user.uid, receiverId].sort().join("_") : null;

  // 1. Sidebar Logic: Fetch all conversations involving the current user
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "chats"), 
      where("participants", "array-contains", user.uid), 
      orderBy("lastUpdate", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChatList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user.uid]);

  // 2. Fetch Receiver Name for the Chat Header
  useEffect(() => {
    if (receiverId && receiverId !== "all") {
      const fetchReceiver = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", receiverId));
          if (userDoc.exists()) {
            setReceiverName(userDoc.data().username);
          } else {
            setReceiverName("Unknown User");
          }
        } catch (err) {
          console.error("Error fetching receiver name:", err);
        }
      };
      fetchReceiver();
    }
  }, [receiverId]);

  // 3. Real-time Messages Sync
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "messages"), 
      where("chatId", "==", chatId), 
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      // Catching the Index Error here to prevent app crash
      console.error("Firestore Index Error: Click the link in your console to fix.", error);
    });

    return () => unsubscribe();
  }, [chatId]);

  // 4. Auto-scroll to bottom whenever messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Media Upload Logic (Proof of Item)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatId) return;

    setLoadingMedia(true);
    try {
      const storageRef = ref(storage, `chat_proofs/${chatId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      // Auto-send the message with the Image URL
      await sendMessage(null, url);
    } catch (err) {
      console.error("Media upload failed:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const sendMessage = async (e, imageUrl = null) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !imageUrl) || !chatId) return;

    const msgContent = newMessage;
    setNewMessage(""); // Clear input immediately for better UX

    const messageData = {
      chatId,
      senderId: user.uid,
      text: msgContent || "",
      imageUrl: imageUrl || null, 
      createdAt: serverTimestamp(),
    };

    try {
      // Add the message to the main feed
      await addDoc(collection(db, "messages"), messageData);
      
      // Update/Create the chat summary for the Sidebar
      await setDoc(doc(db, "chats", chatId), {
        participants: [user.uid, receiverId],
        lastUpdate: serverTimestamp(),
        lastMessage: imageUrl ? "📷 Proof Photo" : msgContent,
        lastSender: user.uid
      }, { merge: true });

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="h-screen bg-[#020817] flex pt-20 overflow-hidden text-white">
      {/* SIDEBAR: Conversation History */}
      <div className={`w-full md:w-80 border-r border-slate-800 bg-slate-900/20 flex flex-col ${receiverId !== 'all' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter">Messages</h2>
          <button onClick={() => navigate('/browse')} className="md:hidden text-slate-500 hover:text-white transition-colors">
             <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatList.length === 0 ? (
            <div className="p-10 text-center opacity-20">
               <MessageSquare size={32} className="mx-auto mb-2" />
               <p className="text-[10px] font-bold tracking-widest uppercase">No Active Chats</p>
            </div>
          ) : (
            chatList.map(chat => {
              const otherId = chat.participants.find(p => p !== user.uid);
              return (
                <Link 
                  key={chat.id} 
                  to={`/chat/${otherId}`} 
                  className={`flex items-center gap-3 p-4 border-b border-slate-800/30 transition-all ${receiverId === otherId ? 'bg-cyan-600/10 border-r-4 border-r-cyan-500 shadow-inner' : 'hover:bg-slate-800/30'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-cyan-400 border border-slate-600 shadow-lg">
                    {otherId?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate text-white tracking-tight">@{otherId?.slice(0,8)}</p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">{chat.lastMessage}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-slate-900/10 ${receiverId === 'all' ? 'hidden md:flex' : 'flex'}`}>
        {receiverId !== 'all' ? (
          <>
            {/* Active Header */}
            <div className="bg-[#020817] border-b border-slate-800 p-4 flex items-center gap-4 shadow-xl z-10">
              <button onClick={() => navigate('/chat/all')} className="md:hidden text-slate-400">
                <ArrowLeft size={20}/>
              </button>
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold uppercase shadow-lg shadow-cyan-500/20 text-white">
                {receiverName?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-sm leading-none truncate tracking-tight">{receiverName || "Loading..."}</h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[2px]">Online</p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/5">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-xl transition-all ${
                    msg.senderId === user.uid 
                      ? "bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20" 
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-black/40"
                  }`}>
                    {/* Media Render */}
                    {msg.imageUrl && (
                      <a href={msg.imageUrl} target="_blank" rel="noreferrer" className="block mb-2 overflow-hidden rounded-lg border border-white/10 group">
                        <img src={msg.imageUrl} alt="Proof" className="max-w-full max-h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                      </a>
                    )}
                    {msg.text && <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>}
                  </div>
                  <span className="text-[8px] text-slate-600 mt-1 font-black uppercase tracking-widest">
                    {msg.createdAt?.toDate() ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "..."}
                  </span>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Fixed Input Dock */}
            <div className="p-4 bg-[#020817] border-t border-slate-800 backdrop-blur-md">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                <label className="p-3.5 bg-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 transition-all cursor-pointer border border-slate-700 shadow-lg active:scale-95">
                  {loadingMedia ? <Loader2 className="animate-spin" size={20}/> : <ImageIcon size={20} />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loadingMedia} />
                </label>
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm font-medium shadow-inner placeholder:text-slate-600" 
                  placeholder="Ask for proof or send details..." 
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() && !loadingMedia}
                  className="bg-cyan-600 p-4 rounded-2xl shadow-lg shadow-cyan-900/30 hover:bg-cyan-500 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} className="text-white" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State for Inbox */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10">
            <div className="w-24 h-24 bg-slate-900/50 rounded-[3rem] border border-slate-800 flex items-center justify-center mb-6 text-3xl shadow-2xl">
              💬
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI Communication Hub</h3>
            <p className="text-[10px] font-black uppercase tracking-[4px] opacity-40 max-w-xs text-center leading-relaxed">
              Select a secure session from the sidebar to begin peer-to-peer verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from "firebase/firestore";
// Note: For media, you would normally use getStorage from firebase/storage

export default function ChatPage() {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // Track which message we are replying to
  const scrollRef = useRef();

  const chatId = [user.uid, receiverId].sort().join("_");

  useEffect(() => {
    const q = query(collection(db, "messages"), where("chatId", "==", chatId), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  }, [chatId]);

  const sendMessage = async (e, imageUrl = null) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageUrl) return;

    await addDoc(collection(db, "messages"), {
      chatId,
      senderId: user.uid,
      text: newMessage,
      imageUrl: imageUrl, // New field for media
      replyTo: replyingTo, // Stores the text/sender of the message being replied to
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
    setReplyingTo(null); // Reset reply state after sending
  };

  return (
    <div className="h-screen bg-[#020817] flex flex-col pt-20">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? "items-end" : "items-start"}`}>
            
            {/* Reply Preview inside bubble */}
            {msg.replyTo && (
              <div className="bg-slate-800/50 p-2 rounded-t-lg text-[10px] text-slate-400 border-l-2 border-cyan-500 mb-[-8px] ml-2 mr-2">
                Replying to: {msg.replyTo.text.substring(0, 30)}...
              </div>
            )}

            <div 
              onClick={() => setReplyingTo(msg)} // Click message to reply
              className={`max-w-[70%] p-4 rounded-2xl cursor-pointer hover:brightness-110 transition-all ${
                msg.senderId === user.uid ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"
              }`}
            >
              {msg.imageUrl && <img src={msg.imageUrl} alt="attachment" className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
              <p className="text-sm">{msg.text}</p>
            </div>
            <span className="text-[9px] text-slate-500 mt-1">Click to reply</span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area with Reply Preview */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
        {replyingTo && (
          <div className="max-w-4xl mx-auto mb-2 p-2 bg-slate-800 rounded-lg flex justify-between items-center">
            <p className="text-xs text-cyan-400">Replying to: {replyingTo.text}</p>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 text-xs">✕</button>
          </div>
        )}
        
        <form onSubmit={(e) => sendMessage(e)} className="max-w-4xl mx-auto flex gap-3">
          <label className="bg-slate-800 p-3 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
            📷
            <input type="file" className="hidden" onChange={(e) => alert("Storage logic goes here!")} />
          </label>
          <input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 text-white focus:border-cyan-500 outline-none" 
            placeholder="Type a message..." 
          />
          <button className="bg-cyan-600 px-6 py-3 rounded-xl font-bold">Send</button>
        </form>
      </div>
    </div>
  );
}
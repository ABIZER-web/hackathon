import { useState } from "react";
import { addItem } from "../firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const [form, setForm] = useState({ itemName: "", location: "", contact: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addItem(form);
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center">Report a Found Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          required className="w-full p-2 border rounded" 
          placeholder="Item Name (e.g. Sony Headphones)" 
          onChange={e => setForm({...form, itemName: e.target.value})} 
        />
        <input 
          required className="w-full p-2 border rounded" 
          placeholder="Where was it found?" 
          onChange={e => setForm({...form, location: e.target.value})} 
        />
        <input 
          required className="w-full p-2 border rounded" 
          placeholder="Your Contact Number" 
          onChange={e => setForm({...form, contact: e.target.value})} 
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Post Item</button>
      </form>
    </div>
  );
}
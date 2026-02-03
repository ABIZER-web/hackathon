import { useEffect, useState } from "react";
import { getItems, deleteItem } from "../firebase/firestore";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const [items, setItems] = useState([]);

  const fetchData = async () => {
    const data = await getItems();
    setItems(data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleClaim = async (id) => {
    await deleteItem(id);
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Found Items Board</h1>
      {items.length === 0 ? (
        <p className="text-gray-500 italic">No items found yet. The campus is clean!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => <ItemCard key={item.id} item={item} onClaim={handleClaim} />)}
        </div>
      )}
    </div>
  );
}
export default function ItemCard({ item, onClaim }) {
  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-800 mb-2 underline decoration-blue-500">{item.itemName}</h3>
      <p className="text-sm text-gray-600">📍 <strong>Location:</strong> {item.location}</p>
      <p className="text-sm text-gray-600 mb-4">📞 <strong>Contact:</strong> {item.contact}</p>
      <button 
        onClick={() => onClaim(item.id)}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition-colors"
      >
        Mark as Claimed
      </button>
    </div>
  );
}
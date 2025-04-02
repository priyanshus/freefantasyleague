import { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export default function UpdateWinner() {
  const [pollId, setPollId] = useState("");
  const [winner, setWinner] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdateWinner = async () => {
    if (!pollId.trim() || (winner !== "0" && winner !== "1") || !securityKey.trim()) {
      setMessage("Please enter a valid Poll ID, winner (0 or 1), and security key.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/update-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: Number(pollId),
          winner: Number(winner),
          gudgobar: securityKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update winner");

      setMessage("✅ Winner updated successfully!");
      setPollId(""); 
      setWinner(""); 
      setSecurityKey(""); 
    } catch (error) {
      setMessage("Error updating winner.");
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-gray-100 p-4 rounded-lg shadow-md mt-6 text-gray-800">
      <h3 className="text-lg font-semibold mb-2">Update Match Result</h3>

      <input
        type="number"
        placeholder="Poll ID"
        value={pollId}
        onChange={(e) => setPollId(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-2"
      />

      <input
        type="number"
        placeholder="Winner (0 or 1)"
        value={winner}
        onChange={(e) => setWinner(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-2"
      />

      <input
        type="password"
        placeholder="Security Key"
        value={securityKey}
        onChange={(e) => setSecurityKey(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-2"
      />

      <button
        onClick={handleUpdateWinner}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
      >
        Submit
      </button>

      {message && <p className="mt-2 text-sm text-center text-gray-700">{message}</p>}
    </div>
  );
}

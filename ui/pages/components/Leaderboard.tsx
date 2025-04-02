import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface LeaderboardEntry {
  name: string;
  correct: number;
  wrong: number;
  totalPoints: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch leaderboard data
  const fetchLeaderboard = () => {
    setLoading(true);
    fetch(`${BASE_URL}/leaderboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((data) => {
        const processedData = data.map((entry: { name: string; correct: number; wrong: number }) => ({
          ...entry,
          totalPoints: entry.correct * 2,
        }));

        // Sorting leaderboard
        const sortedData = [...processedData].sort((a, b) => b.totalPoints - a.totalPoints);

        setLeaderboard(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leaderboard fetch error:", err);
        setError("Failed to load leaderboard");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error & Loading States */}
      {loading && <p className="text-center text-gray-700">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Leaderboard Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-sm md:text-base">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-center">✅ Correct</th>
                <th className="border p-2 text-center">❌ Wrong</th>
                <th className="border p-2 text-center">🏆 Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50 text-sm md:text-base">
                  <td className="border p-2">{entry.name}</td>
                  <td className="border p-2 text-center">{entry.correct}</td>
                  <td className="border p-2 text-center">{entry.wrong}</td>
                  <td className="border p-2 text-center font-bold">{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

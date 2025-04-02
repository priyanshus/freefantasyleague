import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Submission {
  name: string;
  selectedOption: number;
}

export default function Poll() {
  const [pollId, setPollId] = useState<number | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<PollOption[]>([]);
  const [voted, setVoted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  // Load name from localStorage when component mounts
  useEffect(() => {
    const storedName = localStorage.getItem("pollUserName");
    if (storedName) setName(storedName);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/polls`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch poll data");
        return res.json();
      })
      .then((data) => {
        const pollQuestion = `${data.team1} vs ${data.team2}`;

        const votes = [0, 0];
        data.submissions.forEach((submission: Submission) => {
          votes[submission.selectedOption]++;
        });

        const pollOptions: PollOption[] = [
          { id: 0, text: data.team1, votes: votes[0] },
          { id: 1, text: data.team2, votes: votes[1] },
        ];

        setPollId(data.id);
        setQuestion(pollQuestion);
        setOptions(pollOptions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching poll:", err);
        setError("Failed to load poll");
        setLoading(false);
      });
  }, []);

  const handleVote = async (id: number) => {
    if (voted || name.trim() === "" || pollId === null) return;

    try {
      const response = await fetch(`${BASE_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, name, selectedOption: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "User has already submitted this poll") {
          setError("You have already voted in this poll.");
          setVoted(true);
        } else {
          throw new Error("Failed to submit vote");
        }
        return;
      }

      // Save name to localStorage only when vote is submitted
      localStorage.setItem("pollUserName", name);

      setOptions((prev) =>
        prev.map((opt) =>
          opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
        )
      );
      setVoted(true);
    } catch (error) {
      console.error("Voting error:", error);
      setError("Failed to submit vote");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
      <h2 className="text-xl font-bold text-gray-800">Winner of {question}? Guess your best!</h2>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}


      {/* Show name input only if it's not saved in localStorage */}
      {!voted && !localStorage.getItem("pollUserName") && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4 text-gray-800"
          />
        </div>
      )}

      <div className="mt-4 space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            className={`w-full rounded-lg px-4 py-2 text-white ${
              voted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={() => handleVote(option.id)}
            disabled={voted || (name.trim() === "" && !localStorage.getItem("pollUserName"))}
          >
            {option.text}
          </button>
        ))}
      </div>

      {voted && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">Results:</h3>
          {options.map((option) => (
            <div key={option.id} className="flex justify-between items-center mt-2">
              <span className="text-gray-600">{option.text}</span>
              <div className="w-2/3 bg-gray-300 rounded-full h-4 relative">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{
                    width: `${(option.votes / Math.max(...options.map((o) => o.votes), 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-2 font-semibold">{option.votes}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

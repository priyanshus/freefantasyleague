const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = "db.json";
const db = JSON.parse(fs.readFileSync("db.json", "utf8"));

app.get("/polls", (req, res) => {
  const now = new Date();

  const nowUtc = new Date();
  const nowIST = new Date(nowUtc.getTime() + 5.5 * 60 * 60 * 1000);

  const activePoll = db.polls.find((poll) => {
    const pollDeadlineIST = new Date(new Date(poll.deadline).getTime() + 5.5 * 60 * 60 * 1000);
    return pollDeadlineIST > nowIST; 
  });

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found based on IST" });
  }

  res.json(activePoll);
});

app.post("/update-winner", (req, res) => {
  const { pollId, winner, gudgobar } = req.body;
  console.log("Received request to update winner:", req.body);
  if (!pollId || winner === undefined || gudgobar != 'vinaysir') {
    return res.status(400).json({ error: "pollId and winner are required" });
  }

  let db = loadDatabase();
  const poll = db.polls.find(p => p.id === pollId);

  if (!poll) {
    return res.status(404).json({ error: "Poll not found" });
  }

  // Update the winner
  poll.winner = winner;
  saveDatabase(db);

  res.json({ message: "Winner updated successfully", pollId });
});

// ✅ Load database from file
const loadDatabase = () => {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    return { polls: [] }; // Default empty DB
  }
};

// ✅ Save database to file
const saveDatabase = (db) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving database:", error);
  }
};

// ✅ Submit poll response
app.post("/vote", (req, res) => {
  const { pollId, name, selectedOption } = req.body;

  if (!pollId || !name || selectedOption === undefined) {
    return res.status(400).json({ error: "pollId, name, and selectedOption are required" });
  }

  let db = loadDatabase();
  const poll = db.polls.find(p => p.id === pollId);

  if (!poll) {
    return res.status(404).json({ error: "Poll not found" });
  }

  const nowIST = new Date();
  const pollDeadline = new Date(poll.deadline);

  if (pollDeadline <= nowIST) {
    return res.status(400).json({ error: "Poll has expired" });
  }

  // Prevent duplicate submissions
  if (poll.submissions.some(sub => sub.name === name)) {
    return res.status(400).json({ error: "User has already submitted this poll" });
  }

  // Save submission
  poll.submissions.push({ name, selectedOption });
  saveDatabase(db);

  res.json({ message: "Poll submitted successfully", pollId });
});

app.get("/leaderboard", (req, res) => {
  const db = loadDatabase();
  const leaderboard = {};

  db.polls.forEach((poll) => {
    if (poll.winner !== null) {
      poll.submissions.forEach((p) => {
        console.log(p);
        if (!leaderboard[p.name]) {
          leaderboard[p.name] = { correct: 0, wrong: 0 };
        }
        if (p.selectedOption === poll.winner) {
          leaderboard[p.name].correct++;
        } else {
          leaderboard[p.name].wrong++;
        }
      });
    }

    console.log(leaderboard);
  });

  // Convert to sorted array by correct votes
  const sortedLeaderboard = Object.entries(leaderboard)
    .map(([name, { correct, wrong }]) => ({ name, correct, wrong }))
    .sort((a, b) => b.correct - a.correct);

  res.json(sortedLeaderboard);
});

app.get("/download-db", (req, res) => {
  const filePath = path.join(__dirname, "db.json");

  res.download(filePath, "db.json", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Failed to download database file.");
    }
  });
});


// 🌍 Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

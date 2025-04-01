const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const POLL_FILE = "polls.json";
const SUBMISSION_FILE = "submissions.json";

// 🚀 Get Active Polls
app.get("/polls", (req, res) => {
    console.log("Incoming request headers:", req.headers);  // Debug log headers

    try {
        const polls = JSON.parse(fs.readFileSync(POLL_FILE));
        const now = new Date();
        const activePolls = polls.filter(poll => new Date(poll.deadline) > now);
        res.json(activePolls);
    } catch (error) {
        console.error("Error reading polls data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📝 Submit an Answer
app.post("/submit", (req, res) => {
    const { name, pollId, selectedOption } = req.body;
    if (!name || pollId === undefined || selectedOption === undefined) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        const polls = JSON.parse(fs.readFileSync(POLL_FILE));
        const poll = polls.find(p => p.id === pollId);
        if (!poll) return res.status(404).json({ error: "Poll not found" });

        const isCorrect = poll.correct === selectedOption;
        const submissions = JSON.parse(fs.readFileSync(SUBMISSION_FILE));

        submissions.push({ name, pollId, isCorrect });
        fs.writeFileSync(SUBMISSION_FILE, JSON.stringify(submissions, null, 2));

        res.json({ success: true, isCorrect });
    } catch (error) {
        console.error("Error during submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🏆 Get Leaderboard
app.get("/leaderboard", (req, res) => {
    try {
        const submissions = JSON.parse(fs.readFileSync(SUBMISSION_FILE));
        const scores = submissions.reduce((acc, { name, isCorrect }) => {
            if (!acc[name]) acc[name] = 0;
            if (isCorrect) acc[name]++;
            return acc;
        }, {});

        const sortedLeaderboard = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([name, score]) => ({ name, score }));

        res.json(sortedLeaderboard);
    } catch (error) {
        console.error("Error reading leaderboard:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🌍 Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

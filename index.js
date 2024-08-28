const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let userId = 1;

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const newUser = {
    username,
    _id: userId.toString(),
    log: [],
    count: 0,
  };

  users.push(newUser);
  userId++;

  res.json({ username: newUser.username, _id: newUser._id });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  const user = users.find((u) => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!description || !duration) {
    return res
      .status(400)
      .json({ error: "Description and duration are required" });
  }

  const exerciseDate = date ? new Date(date) : new Date();

  const exercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };

  if (!user.log) {
    user.log = [];
  }
  user.log.push(exercise);
  user.count = (user.count || 0) + 1;

  // Construct the response object to match the expected format
  const response = {
    _id: userId,
    username: user.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description,
  };

  res.json(response);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let log = user.log ? [...user.log] : [];

  if (from) {
    const fromDate = new Date(from);
    log = log.filter((exercise) => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter((exercise) => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const response = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log,
  };

  res.json(response);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

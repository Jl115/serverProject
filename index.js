//required for html passing from server to client
const express = require("express");
const path = require("path");

const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
// Verbindung zu MongoDB
mongoose.connect("mongodb://root:root@localhost:27017/?authMechanism=DEFAULT", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const userShema = new mongoose.Schema({
  name: String,
  password: String,
});
const User = mongoose.model("User", userShema);

app.use(express.static(path.join(__dirname, "template")));
app.use(express.json()); // required to parse JSON data in the request body
app.use(express.urlencoded({ extended: true }));


app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "template", "index.html"));
});

// GET all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting users from MongoDB");
  }
});

// GET a single user by ID
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting user from MongoDB");
  }
});

// POST a new user
app.post("/api/users", async (req, res) => {
  const { name, password } = req.body;
  const user = new User({ name, password });
  try {
    await user.save();
    console.log("Received data:", req.body);
    res.sendFile(path.join(__dirname, "template", "login.html"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving user to MongoDB");
  }
});

// PUT (update) an existing user by ID
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, password },
      { new: true }
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User updated in MongoDB");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user in MongoDB");
  }
});

// DELETE a user by ID
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted from MongoDB");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting user from MongoDB");
  }
});

// POST request to check if user exists
app.post("/api/users/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name, password });
    if (!user) {
      return res.status(401).send("Invalid login credentials");
    }
    res.sendFile(path.join(__dirname, "template", "home.html"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error checking user credentials");
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

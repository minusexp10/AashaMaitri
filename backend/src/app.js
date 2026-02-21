const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");

// CORS SHOULD ALWAYS COME BEFORE ROUTES
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "Shashwat_randi",
  resave: false,
  saveUninitialized: false
}));

const authRoutes = require('./routes/authRoutes');
const appRoutes = require('./routes/appRoutes');

app.use('/auth', authRoutes);
app.use('/app', appRoutes);

app.get('/', (req, res) => {
  res.send("Server is running..");
});

module.exports = app;
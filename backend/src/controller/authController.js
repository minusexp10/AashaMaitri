const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Ideally keep it in .env
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; 

exports.signup = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({
        message: "Phone No, name and password required"
      });

    const [existing] = await pool.query(
      "SELECT 1 FROM ASHA WHERE phone = ?",
      [phone]
    );

    if (existing.length > 0)
      return res.status(409).json({
        message: "Mobile number already registered"
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO ASHA (name, phone, password_hash) VALUES (?, ?, ?)",
      [name, phone, hashedPassword]
    );

    // Optional: auto-login after signup
    const token = jwt.sign(
      { phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signup successful",
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const [users] = await pool.query(
      "SELECT id, name, phone, password_hash FROM ASHA WHERE phone = ?",
      [phone]
    );

    if (users.length == 0)
      return res.status(401).json({
        message: "Invalid phone number or password"
      });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch)
      return res.status(401).json({
        message: "Invalid phone number or password"
      });

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        phone: user.phone
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login Successful",
      asha_id: user.id,
      name: user.name,
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
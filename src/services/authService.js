const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/userModel");

// ✅ REASON: Complete signup with validation and proper error handling
const signup = async ({ name, email, password, role }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  // ✅ REASON: Secure password hashing with salt rounds
  const hashed = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashed,
    role,
  });

  return user;
};

// ✅ REASON: Secure login with password verification
const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  // ✅ REASON: JWT token with expiry for session management
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }, // Extended to 7 days for better UX
  );

  return { user, token };
};

module.exports = { signup, login };

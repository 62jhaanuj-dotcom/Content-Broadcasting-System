const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/userModel");
const env = require("../config/env");

// Create new user after checking duplicate email.
const signup = async ({ name, email, password, role }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashed,
    role,
  });

  return user;
};

// Check password and create login token.
const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { user, token };
};

module.exports = { signup, login };

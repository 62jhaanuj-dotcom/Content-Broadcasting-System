const authService = require("../services/authService");

// Register a new user.
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (
      typeof password !== "string" ||
      password.trim().length < 6
    ) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (!role || !["teacher", "principal"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be 'teacher' or 'principal'" });
    }

    const user = await authService.signup({ name, email, password, role });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Login user and return JWT token.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const { user, token } = await authService.login({ email, password });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login };

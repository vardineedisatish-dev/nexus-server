import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/index.js';

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are all required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashed });
  const token = signToken(user._id);

  res.status(201).json({ token, user });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({ token, user });
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function updateProfile(req, res) {
  const { name, jobTitle, avatarUrl } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (jobTitle !== undefined) updates.jobTitle = jobTitle;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ user });
}

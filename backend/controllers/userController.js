import User from '../models/User.js';

export async function getAllUsers(req, res) {
  const users = await User.find()
    .select('name email avatarUrl jobTitle')
    .sort({ name: 1 });

  res.json({ users });
}

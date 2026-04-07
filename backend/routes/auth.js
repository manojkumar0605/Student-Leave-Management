import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { userId, password, role } = req.body;
  try {
    const user = await User.findOne({ userId, password, role });
    if (!user) return res.status(401).json({ message: 'Invalid credentials or role' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, userId: user.userId, presentDays: user.presentDays, absentDays: user.absentDays } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Seed data route for easy testing
router.post('/seed', async (req, res) => {
  try {
    const existing = await User.countDocuments();
    if (existing > 0) return res.json({ message: 'Database already seeded' });

    await User.create([
      { userId: 'S01', password: '123', role: 'student', name: 'Student One', presentDays: 50, absentDays: 2 },
      { userId: 'T01', password: '123', role: 'staff', name: 'Teacher One', presentDays: 0, absentDays: 0 }
    ]);
    res.json({ message: 'Seed data inserted! You can login with S01/123 (Student) or T01/123 (Staff).' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
});

export default router;

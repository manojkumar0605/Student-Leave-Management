import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply for Leave (Student)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can apply for leave' });
  const { fromDate, toDate, reason } = req.body;
  try {
    const newLeave = await Leave.create({
      student: req.user.id,
      fromDate,
      toDate,
      reason
    });
    res.status(201).json(newLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Leaves (Student sees own, Staff sees all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let leaves;
    if (req.user.role === 'student') {
      leaves = await Leave.find({ student: req.user.id }).sort({ createdAt: -1 });
    } else {
      leaves = await Leave.find().populate('student', 'name userId').sort({ createdAt: -1 });
    }
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Deny Leave (Staff)
router.put('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'staff') return res.status(403).json({ message: 'Only staff can update leave status' });
  const { status, staffComment, absentDaysToAdd } = req.body; // status: 'approved' | 'rejected'
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    
    leave.status = status;
    if (staffComment) leave.staffComment = staffComment;
    await leave.save();

    // If approved, update student's absent days
    if (status === 'approved' && absentDaysToAdd) {
       await User.findByIdAndUpdate(leave.student, { $inc: { absentDays: absentDaysToAdd } });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const user = await User.findById(req.user.id);
      res.json({ presentDays: user.presentDays, absentDays: user.absentDays });
    } else {
      // For staff, maybe we return overall stats or they just see their own empty ones?
      // Let's just return something simple or aggregate
      const users = await User.find({ role: 'student' });
      const totalLeaves = await Leave.countDocuments();
      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      res.json({ totalStudents: users.length, totalLeaves, pendingLeaves });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

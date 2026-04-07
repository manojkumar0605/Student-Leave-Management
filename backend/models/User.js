import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Plaint-text for simplicity in this demo demo
  role: { type: String, enum: ['student', 'staff'], required: true },
  name: { type: String, required: true },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
});

export default mongoose.model('User', userSchema);

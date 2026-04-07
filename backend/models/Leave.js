import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromDate: { type: String, required: true }, // Format: DD-MM-YYYY
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  staffComment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Leave', leaveSchema);

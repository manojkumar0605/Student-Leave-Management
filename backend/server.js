import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.js';
import leaveRoutes from './routes/leaves.js';

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Leave Management API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const chalk = require('chalk'); // <-- NEW: Import the chalk library
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { startScheduler } = require('./services/notificationScheduler');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/vapid-public-key', (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) =>
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'))
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // NEW: The awesome, colorful console log!
  console.log(
    chalk.green.bold(
      `Server is live and running at: ${chalk.cyan(`http://localhost:${PORT}`)}`
    )
  );
  startScheduler();
});
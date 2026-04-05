/**
 * MindEase Backend — Entry Point
 * Loads environment, connects to DB, then starts Express server.
 */

const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 MindEase Backend running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
});

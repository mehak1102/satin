import app from './app.js';
// Public SEO files are registered on the app, outside /api.
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { startCycleReminders } from './services/cycle-reminder.js';

const server = app.listen(env.port, async () => {
  console.log(`Satin API listening on port ${env.port}`);
  try {
    const connection = await connectDb();
    if (connection) {
      console.log('MongoDB connected');
      startCycleReminders();
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
});

let closing = false;

function shutdown() {
  if (closing) return;
  closing = true;
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

server.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);



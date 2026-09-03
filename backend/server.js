import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { PORT } from './config/index.js';
import { notFound, errorHandler } from './middleware/errors.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors({
  origin: "https://nexus-server-zeta.vercel.app",
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  });

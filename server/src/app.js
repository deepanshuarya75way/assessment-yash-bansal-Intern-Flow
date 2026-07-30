import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { morganMiddleware } from './middleware/logger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Global Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin static file loading
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app') || origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use(morganMiddleware);
app.use(generalLimiter);


// Health & Status checks
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'InternFlow API',
        status: 'UP',
        message: 'InternFlow Backend Server is running with PostgreSQL'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import sprintRoutes from './modules/sprints/sprint.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';
import commentRoutes from './modules/comments/comment.routes.js';
import internshipRoutes from './modules/internships/internship.routes.js';
import feedbackRoutes from './modules/feedback/feedback.routes.js';
import skillRoutes from './modules/skills/skill.routes.js';
import placementRoutes from './modules/placement/placement.routes.js';
import resumeRoutes from './modules/resume/resume.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import exportRoutes from './modules/export/export.routes.js';
import githubRoutes from './modules/github/github.routes.js';

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/sprints', sprintRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/internships', internshipRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/placement', placementRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/github', githubRoutes);

// Catch 404
app.use((req, res, next) => {
    next(ApiError.notFound('Route not found'));
});

// Error handling
app.use(errorHandler);

export default app;

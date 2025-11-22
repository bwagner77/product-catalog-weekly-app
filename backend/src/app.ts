import express, { Request, Response } from 'express';
import cors from 'cors';
import { traceIdMiddleware, errorHandler, getErrorCount } from './utils/traceId';
import productsRoute from './routes/products';
import categoriesRoute from './routes/categories';
import ordersRoute from './routes/orders';
import authRoute from './routes/auth';

const app = express();

// Core middleware
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow same-origin/no-origin (like curl, server-to-server) and the configured FRONTEND_URL
			if (!origin) return callback(null, true);
			if (origin.replace(/\/$/, '') === FRONTEND_URL) return callback(null, true);
			// Disallow other origins (no CORS headers added)
			return callback(null, false);
		},
	})
);
app.use(traceIdMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Product catalog routes (US1) and categories (US4)
app.use('/api', authRoute);
app.use('/api', productsRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api', ordersRoute);

// Health endpoint (T036)
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		status: 'ok',
		uptime: process.uptime(),
		errorCount: getErrorCount(),
		timestamp: new Date().toISOString(),
	});
});

// Enhanced error handler (T010)
app.use(errorHandler);

export default app;

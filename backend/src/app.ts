import express, { Request, Response } from 'express';
import { traceIdMiddleware, errorHandler, getErrorCount } from './utils/traceId';
import productsRoute from './routes/products';

const app = express();

// Core middleware
app.use(traceIdMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Product catalog routes (US1)
app.use('/api', productsRoute);

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

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { videosRouter } from './routes/videos.js';
import { conversionsRouter } from './routes/conversions.js';
import { downloadsRouter } from './routes/downloads.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimit.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

app.use('/api/v1/videos', videosRouter);
app.use('/api/v1/conversions', conversionsRouter);
app.use('/api/v1/downloads', downloadsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.warn(`[server] Running on http://localhost:${PORT}`);
});

export { app };

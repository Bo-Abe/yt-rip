import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { conversionRequestSchema } from '../../shared/schemas.js';
import {
  startConversion,
  getJob,
  getAllJobs,
  subscribeToJob,
} from '../services/conversion.service.js';
import type { ApiResponse, ConversionJob, ConversionRequest } from '../../shared/types.js';

export const conversionsRouter = Router();

// Start conversions for selected videos
conversionsRouter.post('/', validate(conversionRequestSchema), async (req, res, next) => {
  try {
    const params = req.body as ConversionRequest;
    const jobs: ConversionJob[] = [];

    for (const videoId of params.videoIds) {
      const job = await startConversion({
        videoId,
        videoTitle: params.videoTitles?.[videoId] || videoId,
        videoDuration: params.videoDurations?.[videoId] || 0,
        format: params.format,
        audioBitrate: params.audioBitrate,
        videoQuality: params.videoQuality,
        trim: params.trim,
        embedMetadata: params.embedMetadata,
        embedThumbnail: params.embedThumbnail,
      });
      jobs.push(job);
    }

    const response: ApiResponse<{ jobs: ConversionJob[] }> = { data: { jobs } };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// Get job status
conversionsRouter.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
    return;
  }
  res.json({ data: job });
});

// SSE stream for real-time progress
conversionsRouter.get('/:id/sse', (req, res) => {
  const jobId = req.params.id;
  const job = getJob(jobId);

  if (!job) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send current state immediately
  res.write(`data: ${JSON.stringify(job)}\n\n`);

  if (job.status === 'done' || job.status === 'error') {
    res.end();
    return;
  }

  const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
    res.write(`data: ${JSON.stringify(updatedJob)}\n\n`);
    if (updatedJob.status === 'done' || updatedJob.status === 'error') {
      res.end();
    }
  });

  req.on('close', unsubscribe);
});

// List all active jobs
conversionsRouter.get('/', (_req, res) => {
  res.json({ data: { jobs: getAllJobs() } });
});

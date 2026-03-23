import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { getJob } from '../services/conversion.service.js';

export const downloadsRouter = Router();

// Download single converted file
downloadsRouter.get('/:id', (req, res, next) => {
  try {
    const job = getJob(req.params.id);

    if (!job) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
      return;
    }

    if (job.status !== 'done' || !job.filePath) {
      res.status(400).json({
        error: { code: 'NOT_READY', message: 'Conversion not yet complete' },
      });
      return;
    }

    if (!fs.existsSync(job.filePath)) {
      res.status(410).json({
        error: { code: 'FILE_EXPIRED', message: 'File has been cleaned up. Please convert again.' },
      });
      return;
    }

    const filename = path.basename(job.filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const stream = fs.createReadStream(job.filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

// Download multiple files as ZIP
downloadsRouter.post('/batch', (req, res, next) => {
  try {
    const { jobIds } = req.body as { jobIds: string[] };
    if (!jobIds || jobIds.length === 0) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'No job IDs provided' },
      });
      return;
    }

    const filesToZip: { path: string; name: string }[] = [];

    for (const id of jobIds) {
      const job = getJob(id);
      if (!job || job.status !== 'done' || !job.filePath || !fs.existsSync(job.filePath)) {
        continue;
      }
      filesToZip.push({ path: job.filePath, name: path.basename(job.filePath) });
    }

    if (filesToZip.length === 0) {
      res.status(400).json({
        error: { code: 'NO_FILES', message: 'No completed files available for download' },
      });
      return;
    }

    res.setHeader('Content-Disposition', 'attachment; filename="yt-rip-batch.zip"');
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 5 } });
    archive.pipe(res);

    for (const file of filesToZip) {
      archive.file(file.path, { name: file.name });
    }

    archive.finalize();
  } catch (err) {
    next(err);
  }
});

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import type {
  OutputFormat,
  AudioBitrate,
  VideoQuality,
  TrimOptions,
  ConversionJob,
  ConversionStatus,
} from '../../shared/types.js';
import { downloadVideo } from './youtube.service.js';

const TEMP_DIR = process.env.TEMP_DIR || './tmp';
const jobs = new Map<string, ConversionJob>();
const progressListeners = new Map<string, Set<(job: ConversionJob) => void>>();

const QUALITY_TO_RESOLUTION: Record<string, string> = {
  '360p': '640x360',
  '480p': '854x480',
  '720p': '1280x720',
  '1080p': '1920x1080',
  '1440p': '2560x1440',
  '2160p': '3840x2160',
};

export function getJob(jobId: string): ConversionJob | undefined {
  return jobs.get(jobId);
}

export function getAllJobs(): ConversionJob[] {
  return Array.from(jobs.values());
}

export function subscribeToJob(jobId: string, listener: (job: ConversionJob) => void): () => void {
  if (!progressListeners.has(jobId)) {
    progressListeners.set(jobId, new Set());
  }
  progressListeners.get(jobId)!.add(listener);
  return () => progressListeners.get(jobId)?.delete(listener);
}

function updateJob(jobId: string, update: Partial<ConversionJob>): void {
  const job = jobs.get(jobId);
  if (!job) return;
  Object.assign(job, update);
  const listeners = progressListeners.get(jobId);
  if (listeners) {
    for (const listener of listeners) listener(job);
  }
}

export async function startConversion(params: {
  videoId: string;
  videoTitle: string;
  format: OutputFormat;
  audioBitrate?: AudioBitrate;
  videoQuality?: VideoQuality;
  trim?: TrimOptions;
  embedMetadata?: boolean;
  embedThumbnail?: boolean;
}): Promise<ConversionJob> {
  const jobId = uuidv4();
  const isAudio = ['mp3', 'wav', 'flac', 'm4a'].includes(params.format);
  const ext = params.format;
  const safeTitle = params.videoTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 80);
  const outputFilename = `${safeTitle}_${jobId.slice(0, 8)}.${ext}`;
  const outputPath = path.join(TEMP_DIR, outputFilename);

  const job: ConversionJob = {
    id: jobId,
    videoId: params.videoId,
    videoTitle: params.videoTitle,
    format: params.format,
    status: 'queued',
    progress: 0,
    filePath: outputPath,
    createdAt: new Date().toISOString(),
  };

  jobs.set(jobId, job);

  // Run async — don't await
  processConversion(job, params, isAudio).catch((err) => {
    console.error(`[conversion] Job ${jobId} failed:`, err);
    updateJob(jobId, { status: 'error', error: String(err) });
  });

  return job;
}

async function processConversion(
  job: ConversionJob,
  params: {
    videoId: string;
    format: OutputFormat;
    audioBitrate?: AudioBitrate;
    videoQuality?: VideoQuality;
    trim?: TrimOptions;
    embedMetadata?: boolean;
    embedThumbnail?: boolean;
  },
  isAudio: boolean,
): Promise<void> {
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // Step 1: Download
  updateJob(job.id, { status: 'downloading', progress: 10 });
  const rawPath = path.join(TEMP_DIR, `raw_${job.id}`);
  await downloadVideo(params.videoId, rawPath + '.%(ext)s', isAudio ? 'audio' : 'video');

  // Find the downloaded file (yt-dlp appends the real extension)
  const files = await fs.readdir(TEMP_DIR);
  const rawFile = files.find((f) => f.startsWith(`raw_${job.id}`));
  if (!rawFile) throw new Error('Downloaded file not found');
  const inputPath = path.join(TEMP_DIR, rawFile);

  // Step 2: Convert with FFmpeg
  updateJob(job.id, { status: 'converting', progress: 40 });

  await new Promise<void>((resolve, reject) => {
    let cmd = ffmpeg(inputPath);

    // Trim
    if (params.trim) {
      cmd = cmd.setStartTime(params.trim.start).setDuration(params.trim.end - params.trim.start);
    }

    // Audio settings
    if (isAudio) {
      const bitrate = params.audioBitrate || 192;
      cmd = cmd.audioBitrate(`${bitrate}k`).noVideo();

      if (params.format === 'mp3') cmd = cmd.audioCodec('libmp3lame');
      else if (params.format === 'flac') cmd = cmd.audioCodec('flac');
      else if (params.format === 'wav') cmd = cmd.audioCodec('pcm_s16le');
      else if (params.format === 'm4a') cmd = cmd.audioCodec('aac');
    } else {
      // Video settings
      const quality = params.videoQuality || '720p';
      const resolution = QUALITY_TO_RESOLUTION[quality];
      if (resolution) cmd = cmd.size(resolution);

      if (params.format === 'mp4') {
        cmd = cmd.videoCodec('libx264').audioCodec('aac');
      } else if (params.format === 'webm') {
        cmd = cmd.videoCodec('libvpx-vp9').audioCodec('libopus');
      }
    }

    cmd
      .on('progress', (info) => {
        const pct = Math.min(95, 40 + (info.percent || 0) * 0.55);
        updateJob(job.id, { progress: Math.round(pct) });
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(job.filePath!);
  });

  // Cleanup raw file
  await fs.unlink(inputPath).catch(() => {});

  // Get file size
  const stat = await fs.stat(job.filePath!);
  updateJob(job.id, { status: 'done', progress: 100, fileSize: stat.size });
}

// Cleanup old temp files
export async function cleanupTempFiles(maxAgeHours: number = 4): Promise<void> {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stat = await fs.stat(filePath);
      if (now - stat.mtimeMs > maxAge) {
        await fs.unlink(filePath).catch(() => {});
      }
    }
  } catch {
    // TEMP_DIR might not exist yet
  }
}

// Run cleanup every hour
setInterval(() => cleanupTempFiles(), 60 * 60 * 1000);

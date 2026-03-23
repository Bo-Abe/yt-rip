import { z } from 'zod';

const youtubeUrlPattern =
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|playlist\?list=|@|channel\/|c\/|shorts\/).*/;

export const fetchVideosSchema = z.object({
  url: z.string().url('URL invalide').regex(youtubeUrlPattern, 'URL YouTube invalide'),
});

export const audioFormats = ['mp3', 'wav', 'flac', 'm4a'] as const;
export const videoFormats = ['mp4', 'webm'] as const;
export const allFormats = [...audioFormats, ...videoFormats] as const;
export const audioBitrates = [64, 128, 192, 256, 320] as const;
export const videoQualities = ['360p', '480p', '720p', '1080p', '1440p', '2160p'] as const;

export const trimSchema = z.object({
  start: z.number().min(0),
  end: z.number().min(0),
}).refine((data) => data.end > data.start, {
  message: 'End time must be after start time',
});

export const conversionRequestSchema = z.object({
  videoIds: z.array(z.string()).min(1, 'Sélectionnez au moins une vidéo'),
  format: z.enum(allFormats),
  audioBitrate: z.enum(audioBitrates.map(String) as [string, ...string[]]).transform(Number).optional(),
  videoQuality: z.enum(videoQualities).optional(),
  trim: trimSchema.optional(),
  embedMetadata: z.boolean().optional().default(true),
  embedThumbnail: z.boolean().optional().default(true),
});

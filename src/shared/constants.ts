export const API_BASE = '/api/v1';

export const FORMAT_LABELS: Record<string, string> = {
  mp3: 'MP3 (Audio)',
  wav: 'WAV (Audio)',
  flac: 'FLAC (Audio)',
  m4a: 'M4A (Audio)',
  mp4: 'MP4 (Video)',
  webm: 'WebM (Video)',
};

export const BITRATE_LABELS: Record<number, string> = {
  64: '64 kbps — Low',
  128: '128 kbps — Standard',
  192: '192 kbps — Good',
  256: '256 kbps — High',
  320: '320 kbps — Best',
};

export const QUALITY_LABELS: Record<string, string> = {
  '360p': '360p — SD',
  '480p': '480p — SD',
  '720p': '720p — HD',
  '1080p': '1080p — Full HD',
  '1440p': '1440p — 2K',
  '2160p': '2160p — 4K',
};

export const MAX_CONCURRENT_CONVERSIONS = 3;
export const TEMP_FILE_TTL_HOURS = 4;

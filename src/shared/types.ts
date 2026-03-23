export interface VideoInfo {
  id: string;
  title: string;
  duration: number; // seconds
  thumbnail: string;
  channel: string;
  uploadDate: string;
  viewCount: number;
  url: string;
}

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'm4a';
export type VideoFormat = 'mp4' | 'webm';
export type OutputFormat = AudioFormat | VideoFormat;

export type AudioBitrate = 64 | 128 | 192 | 256 | 320;
export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';

export interface TrimOptions {
  start: number; // seconds
  end: number; // seconds
}

export interface ConversionRequest {
  videoIds: string[];
  format: OutputFormat;
  audioBitrate?: AudioBitrate;
  videoQuality?: VideoQuality;
  trim?: TrimOptions;
  embedMetadata?: boolean;
  embedThumbnail?: boolean;
}

export type ConversionStatus = 'queued' | 'downloading' | 'converting' | 'done' | 'error';

export interface ConversionJob {
  id: string;
  videoId: string;
  videoTitle: string;
  format: OutputFormat;
  status: ConversionStatus;
  progress: number; // 0-100
  error?: string;
  filePath?: string;
  fileSize?: number;
  createdAt: string;
}

export interface FetchVideosRequest {
  url: string;
}

export interface FetchVideosResponse {
  videos: VideoInfo[];
  playlistTitle?: string;
  channelName?: string;
  totalCount: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface SSEProgressEvent {
  jobId: string;
  status: ConversionStatus;
  progress: number;
  error?: string;
  downloadUrl?: string;
}

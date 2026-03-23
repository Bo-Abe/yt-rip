import { exec } from 'child_process';
import { promisify } from 'util';
import type { VideoInfo } from '../../shared/types.js';
import { AppError } from '../middleware/errorHandler.js';

const execAsync = promisify(exec);

function getYtdlp(): string {
  const p = process.env.YTDLP_PATH || 'yt-dlp';
  const bin = p.includes(' ') ? `"${p}"` : p;

  // yt-dlp needs ffmpeg to merge video+audio streams
  const ffmpegPath = process.env.FFMPEG_PATH;
  if (ffmpegPath) {
    const ffmpegDir = ffmpegPath.replace(/[/\\][^/\\]+$/, '');
    return `${bin} --ffmpeg-location "${ffmpegDir}"`;
  }
  return bin;
}

interface YtdlpVideoEntry {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  channel: string;
  upload_date: string;
  view_count: number;
  webpage_url: string;
  url?: string;
}

export async function fetchVideos(url: string): Promise<{
  videos: VideoInfo[];
  playlistTitle?: string;
  channelName?: string;
}> {
  try {
    const args = [
      '--flat-playlist',
      '--dump-json',
      '--no-warnings',
      '--no-download',
      '--ignore-errors',
      url,
    ];

    const cmd = `${getYtdlp()} ${args.join(' ')}`;
    const { stdout } = await execAsync(cmd, {
      timeout: 60_000,
      maxBuffer: 50 * 1024 * 1024, // 50MB for large playlists
    });

    const lines = stdout.trim().split('\n').filter(Boolean);
    const videos: VideoInfo[] = [];
    let playlistTitle: string | undefined;
    let channelName: string | undefined;

    for (const line of lines) {
      const entry: YtdlpVideoEntry = JSON.parse(line);
      if (!channelName && entry.channel) channelName = entry.channel;

      videos.push({
        id: entry.id,
        title: entry.title,
        duration: entry.duration || 0,
        thumbnail: entry.thumbnail || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
        channel: entry.channel || 'Unknown',
        uploadDate: entry.upload_date || '',
        viewCount: entry.view_count || 0,
        url: entry.webpage_url || entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
      });
    }

    return { videos, playlistTitle, channelName };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('is not a valid URL') || message.includes('Unsupported URL')) {
      throw new AppError(400, 'INVALID_URL', 'URL YouTube invalide ou non supportée');
    }
    throw new AppError(502, 'YTDLP_ERROR', `Erreur yt-dlp: ${message}`);
  }
}

export async function getVideoStreamUrl(videoId: string, format: 'audio' | 'video'): Promise<string> {
  const formatArg = format === 'audio' ? 'bestaudio' : 'bestvideo+bestaudio';
  const cmd = `${getYtdlp()} -f ${formatArg} -g --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  const { stdout } = await execAsync(cmd, { timeout: 30_000 });

  return stdout.trim().split('\n')[0] || '';
}

export async function downloadVideo(
  videoId: string,
  outputPath: string,
  format: 'audio' | 'video',
): Promise<string> {
  const formatArg = format === 'audio' ? 'bestaudio' : 'bestvideo+bestaudio/best';
  const mergeArg = format === 'video' ? ' --merge-output-format mkv' : '';
  const cmd = `${getYtdlp()} -f ${formatArg}${mergeArg} -o "${outputPath}" --no-warnings --no-playlist "https://www.youtube.com/watch?v=${videoId}"`;
  const { stdout } = await execAsync(cmd, { timeout: 300_000 }); // 5 min max

  return stdout.trim();
}

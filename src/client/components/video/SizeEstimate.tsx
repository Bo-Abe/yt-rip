import { useMemo } from 'react';
import { HardDrive } from 'lucide-react';
import type { VideoInfo, OutputFormat, AudioBitrate, VideoQuality } from '../../../shared/types';
import { formatFileSize } from '../../lib/formatters';

// Rough bitrate estimates in kbps for video qualities
const VIDEO_BITRATE_MAP: Record<string, number> = {
  '360p': 800,
  '480p': 1500,
  '720p': 3000,
  '1080p': 6000,
  '1440p': 12000,
  '2160p': 25000,
};

interface SizeEstimateProps {
  videos: VideoInfo[];
  selectedIds: Set<string>;
  format: OutputFormat;
  audioBitrate: AudioBitrate;
  videoQuality: VideoQuality;
  trimDuration?: number | null; // if trimmed, override duration
}

export function SizeEstimate({
  videos,
  selectedIds,
  format,
  audioBitrate,
  videoQuality,
  trimDuration,
}: SizeEstimateProps) {
  const estimate = useMemo(() => {
    const selected = videos.filter((v) => selectedIds.has(v.id));
    if (selected.length === 0) return 0;

    const isAudio = ['mp3', 'wav', 'flac', 'm4a'].includes(format);
    let totalBytes = 0;

    for (const video of selected) {
      const dur = trimDuration ?? video.duration;
      if (dur <= 0) continue;

      if (isAudio) {
        let bps = audioBitrate * 1000;
        // WAV is uncompressed ~1411kbps, FLAC ~900kbps
        if (format === 'wav') bps = 1_411_000;
        else if (format === 'flac') bps = 900_000;
        totalBytes += (dur * bps) / 8;
      } else {
        const videoBps = (VIDEO_BITRATE_MAP[videoQuality] || 3000) * 1000;
        const audioBps = 128_000; // audio track in video
        totalBytes += (dur * (videoBps + audioBps)) / 8;
      }
    }

    return totalBytes;
  }, [videos, selectedIds, format, audioBitrate, videoQuality, trimDuration]);

  if (selectedIds.size === 0 || estimate === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50">
      <HardDrive className="h-3.5 w-3.5" />
      <span>
        Estimated size: <span className="font-medium text-white/70">{formatFileSize(estimate)}</span>
        {selectedIds.size > 1 && <span className="ml-1">({selectedIds.size} files)</span>}
      </span>
    </div>
  );
}

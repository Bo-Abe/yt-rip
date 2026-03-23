import { Music, Film } from 'lucide-react';
import type { OutputFormat, AudioBitrate, VideoQuality } from '../../../shared/types';
import { FORMAT_LABELS, BITRATE_LABELS, QUALITY_LABELS } from '../../../shared/constants';
import { audioFormats, videoFormats, audioBitrates, videoQualities } from '../../../shared/schemas';

interface FormatSelectorProps {
  format: OutputFormat;
  audioBitrate: AudioBitrate;
  videoQuality: VideoQuality;
  onFormatChange: (format: OutputFormat) => void;
  onBitrateChange: (bitrate: AudioBitrate) => void;
  onQualityChange: (quality: VideoQuality) => void;
}

export function FormatSelector({
  format,
  audioBitrate,
  videoQuality,
  onFormatChange,
  onBitrateChange,
  onQualityChange,
}: FormatSelectorProps) {
  const isAudio = (audioFormats as readonly string[]).includes(format);

  return (
    <div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
      {/* Format type toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onFormatChange('mp3')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            isAudio
              ? 'bg-brand-400/20 text-brand-300 ring-1 ring-brand-400/40'
              : 'text-white/50 hover:bg-white/5 hover:text-white/70'
          }`}
        >
          <Music className="h-4 w-4" />
          Audio
        </button>
        <button
          onClick={() => onFormatChange('mp4')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            !isAudio
              ? 'bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/40'
              : 'text-white/50 hover:bg-white/5 hover:text-white/70'
          }`}
        >
          <Film className="h-4 w-4" />
          Video
        </button>
      </div>

      {/* Format dropdown */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
          Format
        </label>
        <select
          value={format}
          onChange={(e) => onFormatChange(e.target.value as OutputFormat)}
          className="input-field"
        >
          {(isAudio ? audioFormats : videoFormats).map((f) => (
            <option key={f} value={f} className="bg-surface-50">
              {FORMAT_LABELS[f] || f.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Bitrate / Quality */}
      {isAudio ? (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
            Bitrate
          </label>
          <select
            value={audioBitrate}
            onChange={(e) => onBitrateChange(Number(e.target.value) as AudioBitrate)}
            className="input-field"
          >
            {audioBitrates.map((b) => (
              <option key={b} value={b} className="bg-surface-50">
                {BITRATE_LABELS[b]}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
            Quality
          </label>
          <select
            value={videoQuality}
            onChange={(e) => onQualityChange(e.target.value as VideoQuality)}
            className="input-field"
          >
            {videoQualities.map((q) => (
              <option key={q} value={q} className="bg-surface-50">
                {QUALITY_LABELS[q]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

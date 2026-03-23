import { useState, useCallback } from 'react';
import { Scissors } from 'lucide-react';
import { formatDuration } from '../../lib/formatters';
import { TrimPreview } from './TrimPreview';

interface TrimSliderProps {
  videoId: string;
  videoTitle: string;
  duration: number; // total duration in seconds
  onTrimChange: (trim: { start: number; end: number } | null) => void;
}

export function TrimSlider({ videoId, videoTitle, duration, onTrimChange }: TrimSliderProps) {
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  const handleToggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      setStart(0);
      setEnd(duration);
      onTrimChange({ start: 0, end: duration });
    } else {
      onTrimChange(null);
    }
  }, [enabled, duration, onTrimChange]);

  const handleStartChange = useCallback(
    (val: number) => {
      const clamped = Math.min(val, end - 1);
      setStart(clamped);
      onTrimChange({ start: clamped, end });
    },
    [end, onTrimChange],
  );

  const handleEndChange = useCallback(
    (val: number) => {
      const clamped = Math.max(val, start + 1);
      setEnd(clamped);
      onTrimChange({ start, end: clamped });
    },
    [start, onTrimChange],
  );

  if (duration <= 0) return null;

  const trimmedDuration = end - start;
  const startPct = (start / duration) * 100;
  const endPct = (end / duration) * 100;

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 text-sm font-medium transition-colors ${
          enabled ? 'text-brand-300' : 'text-white/50 hover:text-white/70'
        }`}
      >
        <Scissors className="h-4 w-4" />
        Trim {enabled ? 'ON' : 'OFF'}
      </button>

      {enabled && (
        <div className="mt-4 space-y-4">
          {/* Preview player */}
          <TrimPreview
            videoId={videoId}
            start={start}
            end={end}
            title={videoTitle}
          />

          {/* Visual range bar */}
          <div className="relative h-2 rounded-full bg-white/10">
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-blue"
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
            />
          </div>

          {/* Start slider */}
          <div className="flex items-center gap-3">
            <label className="w-12 text-xs text-white/40">Start</label>
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={start}
              onChange={(e) => handleStartChange(Number(e.target.value))}
              className="flex-1 accent-brand-400"
            />
            <span className="w-16 text-right text-xs font-mono text-white/60">
              {formatDuration(start)}
            </span>
          </div>

          {/* End slider */}
          <div className="flex items-center gap-3">
            <label className="w-12 text-xs text-white/40">End</label>
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={end}
              onChange={(e) => handleEndChange(Number(e.target.value))}
              className="flex-1 accent-brand-400"
            />
            <span className="w-16 text-right text-xs font-mono text-white/60">
              {formatDuration(end)}
            </span>
          </div>

          {/* Duration info */}
          <p className="text-xs text-white/40">
            Trimmed duration: <span className="text-white/70">{formatDuration(trimmedDuration)}</span>
            {trimmedDuration < duration && (
              <span className="ml-1 text-brand-300">
                (saving {formatDuration(duration - trimmedDuration)})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

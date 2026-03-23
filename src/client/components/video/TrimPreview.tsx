import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { formatDuration } from '../../lib/formatters';

interface TrimPreviewProps {
  videoId: string;
  start: number;
  end: number;
  title: string;
}

export function TrimPreview({ videoId, start, end, title }: TrimPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(start);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

  function initPlayer() {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        start: Math.floor(start),
        end: Math.ceil(end),
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        disablekb: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => setPlayerReady(true),
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            setCurrentTime(start);
          }
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          }
          if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          }
        },
      },
    });
  }

  // Track current time
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const t = playerRef.current.getCurrentTime();
          setCurrentTime(t);
          // Stop at end point
          if (t >= end) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            setCurrentTime(end);
          }
        }
      }, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, end]);

  // Seek when start/end change
  useEffect(() => {
    if (playerRef.current && playerReady && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(start, true);
      setCurrentTime(start);
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    }
  }, [start, end, playerReady]);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      // If at end, restart from start
      if (currentTime >= end - 0.5) {
        playerRef.current.seekTo(start, true);
        setCurrentTime(start);
      }
      playerRef.current.playVideo();
    }
  }, [isPlaying, playerReady, currentTime, start, end]);

  const handleRestart = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    playerRef.current.seekTo(start, true);
    playerRef.current.playVideo();
    setCurrentTime(start);
    setIsPlaying(true);
  }, [playerReady, start]);

  const handleMute = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  }, [isMuted, playerReady]);

  const progressPct = end > start ? ((currentTime - start) / (end - start)) * 100 : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-white/40">Preview</p>

      {/* YouTube player (hidden but functional for audio, visible for video) */}
      <div className="relative overflow-hidden rounded-lg bg-black">
        <div
          ref={containerRef}
          className="aspect-video w-full"
        />
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-100">
            <p className="text-sm text-white/30">Loading player...</p>
          </div>
        )}
      </div>

      {/* Custom controls */}
      <div className="space-y-2">
        {/* Progress bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-blue transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs font-mono text-white/40">
          <span>{formatDuration(Math.max(0, currentTime - start))}</span>
          <span>{formatDuration(end - start)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            disabled={!playerReady}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-400/20 text-brand-300 transition-colors hover:bg-brand-400/30 disabled:opacity-30"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={handleRestart}
            disabled={!playerReady}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/70 disabled:opacity-30"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleMute}
            disabled={!playerReady}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/70 disabled:opacity-30"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <span className="ml-auto text-xs text-white/30 truncate">{title}</span>
        </div>
      </div>
    </div>
  );
}

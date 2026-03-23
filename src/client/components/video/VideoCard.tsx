import { motion } from 'framer-motion';
import { Eye, Check, ImageDown } from 'lucide-react';
import type { VideoInfo } from '../../../shared/types';
import { formatDuration, formatViews } from '../../lib/formatters';

interface VideoCardProps {
  video: VideoInfo;
  isSelected: boolean;
  onToggle: () => void;
}

export function VideoCard({ video, isSelected, onToggle }: VideoCardProps) {
  function handleThumbnailDownload(e: React.MouseEvent) {
    e.stopPropagation();
    // Get max resolution thumbnail
    const hdUrl = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
    const a = document.createElement('a');
    a.href = hdUrl;
    a.download = `${video.title}.jpg`;
    a.target = '_blank';
    a.click();
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-hover group cursor-pointer overflow-hidden ${
        isSelected ? 'border-brand-400/40 bg-brand-400/10' : ''
      }`}
      onClick={onToggle}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
        {/* Selection indicator */}
        <div
          className={`absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
            isSelected
              ? 'border-brand-400 bg-brand-400'
              : 'border-white/30 bg-black/40 group-hover:border-white/60'
          }`}
        >
          {isSelected && <Check className="h-4 w-4 text-white" />}
        </div>
        {/* Thumbnail download button */}
        <button
          onClick={handleThumbnailDownload}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white/60 opacity-0 transition-all hover:bg-black/80 hover:text-white group-hover:opacity-100"
          title="Download thumbnail"
        >
          <ImageDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-white/90">
          {video.title}
        </h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
          <span className="truncate">{video.channel}</span>
          {video.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(video.viewCount)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

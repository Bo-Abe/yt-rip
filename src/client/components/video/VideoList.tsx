import { motion } from 'framer-motion';
import type { VideoInfo } from '../../../shared/types';
import { VideoCard } from './VideoCard';

interface VideoListProps {
  videos: VideoInfo[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function VideoList({ videos, selectedIds, onToggle }: VideoListProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isSelected={selectedIds.has(video.id)}
          onToggle={() => onToggle(video.id)}
        />
      ))}
    </motion.div>
  );
}

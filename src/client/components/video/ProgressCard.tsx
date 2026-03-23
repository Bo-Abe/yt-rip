import { motion } from 'framer-motion';
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ConversionJob } from '../../../shared/types';
import { formatFileSize } from '../../lib/formatters';
import { api } from '../../lib/api';

interface ProgressCardProps {
  job: ConversionJob;
}

const statusConfig = {
  queued: { icon: Loader2, color: 'text-white/40', label: 'In queue...' },
  downloading: { icon: Loader2, color: 'text-accent-cyan', label: 'Downloading...' },
  converting: { icon: Loader2, color: 'text-brand-400', label: 'Converting...' },
  done: { icon: CheckCircle, color: 'text-green-400', label: 'Complete' },
  error: { icon: AlertCircle, color: 'text-red-400', label: 'Error' },
};

export function ProgressCard({ job }: ProgressCardProps) {
  const config = statusConfig[job.status];
  const Icon = config.icon;
  const isAnimated = job.status === 'downloading' || job.status === 'converting' || job.status === 'queued';

  return (
    <div className="glass-card overflow-hidden p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-white/90">{job.videoTitle}</h4>
          <div className="mt-1 flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${config.color} ${isAnimated ? 'animate-spin' : ''}`}
            />
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            {job.fileSize && job.status === 'done' && (
              <span className="text-xs text-white/30">{formatFileSize(job.fileSize)}</span>
            )}
          </div>
          {job.error && (
            <p className="mt-1 text-xs text-red-400/80">{job.error}</p>
          )}
        </div>

        {job.status === 'done' && (
          <a
            href={api.getDownloadUrl(job.id)}
            download
            className="btn-primary flex items-center gap-1.5 !px-4 !py-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        )}
      </div>

      {/* Progress bar */}
      {job.status !== 'done' && job.status !== 'error' && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-blue"
            initial={{ width: 0 }}
            animate={{ width: `${job.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}

import { motion } from 'framer-motion';
import { Clock, Trash2, Music, Film } from 'lucide-react';
import { useConverterStore } from '../features/converter/store';
import { formatFileSize } from '../lib/formatters';

function HistoryPage() {
  const { history, clearHistory } = useConverterStore();

  const audioFormats = ['mp3', 'wav', 'flac', 'm4a'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">History</h1>
            <p className="mt-1 text-sm text-white/40">{history.length} conversions</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-secondary flex items-center gap-2 text-sm !text-red-400 hover:!text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {history.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-16 text-center">
          <Clock className="mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">No conversions yet</p>
          <p className="mt-1 text-xs text-white/25">Your conversion history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => {
            const isAudio = audioFormats.includes(entry.format);
            return (
              <motion.div
                key={`${entry.id}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card flex items-center gap-3 p-3"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isAudio ? 'bg-brand-400/20 text-brand-300' : 'bg-accent-blue/20 text-accent-blue'
                  }`}
                >
                  {isAudio ? <Music className="h-4 w-4" /> : <Film className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/80">{entry.videoTitle}</p>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span className="uppercase">{entry.format}</span>
                    {entry.fileSize && <span>{formatFileSize(entry.fileSize)}</span>}
                    <span>{new Date(entry.convertedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

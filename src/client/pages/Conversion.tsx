import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Package } from 'lucide-react';
import { useConverterStore } from '../features/converter/store';
import { ProgressCard } from '../components/video/ProgressCard';
import { useMultiSSE } from '../hooks/useSSE';
import { api } from '../lib/api';

function ConversionPage() {
  const navigate = useNavigate();
  const { jobs, updateJob } = useConverterStore();

  // Subscribe to SSE for ALL active jobs
  const activeJobIds = useMemo(
    () => jobs.filter((j) => j.status !== 'done' && j.status !== 'error').map((j) => j.id),
    [jobs],
  );

  const handleSSEUpdate = useCallback(
    (updated: import('../../shared/types').ConversionJob) => {
      updateJob(updated.id, updated);
    },
    [updateJob],
  );

  useMultiSSE(activeJobIds, handleSSEUpdate);

  const completedJobs = jobs.filter((j) => j.status === 'done');
  const allDone = jobs.length > 0 && jobs.every((j) => j.status === 'done' || j.status === 'error');

  async function handleBatchDownload() {
    const jobIds = completedJobs.map((j) => j.id);
    if (jobIds.length === 0) return;

    const res = await fetch(api.getBatchDownloadUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobIds }),
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yt-rip-batch.zip';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (jobs.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate('/results')}
          className="mb-4 flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Downloads</h1>
            <p className="mt-1 text-sm text-white/40">
              {completedJobs.length} / {jobs.length} complete
            </p>
          </div>

          {completedJobs.length > 1 && (
            <button onClick={handleBatchDownload} className="btn-secondary flex items-center gap-2">
              <Package className="h-4 w-4" />
              Download All (ZIP)
            </button>
          )}
        </div>
      </motion.div>

      {/* Progress cards */}
      <div className="space-y-3">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ProgressCard job={job} />
          </motion.div>
        ))}
      </div>

      {/* All done message */}
      {allDone && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="glass-card mx-auto max-w-md p-6">
            <Download className="mx-auto mb-3 h-10 w-10 text-green-400" />
            <h3 className="text-lg font-semibold text-white">All conversions complete!</h3>
            <p className="mt-1 text-sm text-white/40">
              Click individual download buttons or download all as ZIP.
            </p>
            <button
              onClick={() => {
                useConverterStore.getState().reset();
                navigate('/');
              }}
              className="btn-primary mt-4"
            >
              Convert More Videos
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ConversionPage;

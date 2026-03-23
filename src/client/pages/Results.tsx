import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConverterStore } from '../features/converter/store';
import { VideoList } from '../components/video/VideoList';
import { BatchActions } from '../components/video/BatchActions';
import { FormatSelector } from '../components/video/FormatSelector';
import { api } from '../lib/api';

function ResultsPage() {
  const navigate = useNavigate();
  const store = useConverterStore();

  if (store.videos.length === 0) {
    navigate('/');
    return null;
  }

  async function handleConvert() {
    if (store.selectedIds.size === 0) {
      toast.error('Select at least one video');
      return;
    }

    const isAudio = ['mp3', 'wav', 'flac', 'm4a'].includes(store.format);

    try {
      store.setLoading(true);
      // Build videoId → title and duration mappings
      const videoTitles: Record<string, string> = {};
      const videoDurations: Record<string, number> = {};
      for (const v of store.videos) {
        if (store.selectedIds.has(v.id)) {
          videoTitles[v.id] = v.title;
          videoDurations[v.id] = v.duration;
        }
      }
      const result = await api.startConversions({
        videoIds: Array.from(store.selectedIds),
        videoTitles,
        videoDurations,
        format: store.format,
        audioBitrate: isAudio ? store.audioBitrate : undefined,
        videoQuality: !isAudio ? store.videoQuality : undefined,
        embedMetadata: true,
        embedThumbnail: true,
      });
      store.setJobs(result.jobs);
      navigate('/conversion');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Conversion failed';
      toast.error(msg);
    } finally {
      store.setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {store.channelName || store.playlistTitle || 'Videos'}
            </h1>
            <p className="mt-1 text-sm text-white/40">{store.videos.length} videos found</p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <BatchActions
          totalCount={store.videos.length}
          selectedCount={store.selectedIds.size}
          onSelectAll={store.selectAll}
          onSelectNone={store.selectNone}
          onConvert={handleConvert}
          isConverting={store.isLoading}
        />
        <FormatSelector
          format={store.format}
          audioBitrate={store.audioBitrate}
          videoQuality={store.videoQuality}
          onFormatChange={store.setFormat}
          onBitrateChange={store.setAudioBitrate}
          onQualityChange={store.setVideoQuality}
        />
      </div>

      {/* Video grid */}
      <VideoList
        videos={store.videos}
        selectedIds={store.selectedIds}
        onToggle={store.toggleSelect}
      />
    </div>
  );
}

export default ResultsPage;

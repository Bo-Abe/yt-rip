import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConverterStore } from '../features/converter/store';
import { VideoList } from '../components/video/VideoList';
import { BatchActions } from '../components/video/BatchActions';
import { FormatSelector } from '../components/video/FormatSelector';
import { TrimSlider } from '../components/video/TrimSlider';
import { SizeEstimate } from '../components/video/SizeEstimate';
import { api } from '../lib/api';

function ResultsPage() {
  const navigate = useNavigate();
  const store = useConverterStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter videos by search
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return store.videos;
    const q = searchQuery.toLowerCase();
    return store.videos.filter(
      (v) => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q),
    );
  }, [store.videos, searchQuery]);

  // Get the single selected video (for trim slider + preview)
  const selectedVideo = useMemo(() => {
    if (store.selectedIds.size !== 1) return null;
    const id = Array.from(store.selectedIds)[0];
    return store.videos.find((v) => v.id === id) ?? null;
  }, [store.videos, store.selectedIds]);

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
        trim: store.trim ?? undefined,
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
          {store.videos.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="input-field !py-2 !pl-9 !pr-4 text-sm"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <BatchActions
            totalCount={store.videos.length}
            selectedCount={store.selectedIds.size}
            onSelectAll={store.selectAll}
            onSelectNone={store.selectNone}
            onConvert={handleConvert}
            isConverting={store.isLoading}
          />
          <SizeEstimate
            videos={store.videos}
            selectedIds={store.selectedIds}
            format={store.format}
            audioBitrate={store.audioBitrate}
            videoQuality={store.videoQuality}
            trimDuration={store.trim ? store.trim.end - store.trim.start : null}
          />
        </div>
        <div className="space-y-4">
          <FormatSelector
            format={store.format}
            audioBitrate={store.audioBitrate}
            videoQuality={store.videoQuality}
            onFormatChange={store.setFormat}
            onBitrateChange={store.setAudioBitrate}
            onQualityChange={store.setVideoQuality}
          />
          {selectedVideo && selectedVideo.duration > 0 && (
            <TrimSlider
              videoId={selectedVideo.id}
              videoTitle={selectedVideo.title}
              duration={selectedVideo.duration}
              onTrimChange={store.setTrim}
            />
          )}
        </div>
      </div>

      {/* Video grid */}
      <VideoList
        videos={filteredVideos}
        selectedIds={store.selectedIds}
        onToggle={store.toggleSelect}
      />
      {searchQuery && filteredVideos.length === 0 && (
        <p className="mt-8 text-center text-sm text-white/30">
          No videos matching &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
}

export default ResultsPage;

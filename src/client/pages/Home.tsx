import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Link2, Zap, Music, Film, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConverterStore } from '../features/converter/store';
import { api } from '../lib/api';

function HomePage() {
  const navigate = useNavigate();
  const { url, setUrl, setVideos, setLoading, setError, isLoading } = useConverterStore();
  const [inputFocused, setInputFocused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
      if (text && text.includes('youtube')) {
        setUrl(text.trim());
      }
    },
    [setUrl],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text');
      if (text && text.includes('youtube') && !url) {
        e.preventDefault();
        setUrl(text.trim());
      }
    },
    [setUrl, url],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.fetchVideos(url.trim());
      setVideos(result.videos, result.channelName ?? undefined, result.playlistTitle ?? undefined);
      navigate('/results');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch videos';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative overflow-hidden transition-colors ${isDragOver ? 'ring-2 ring-inset ring-brand-400/50' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-brand-400/5 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-accent-blue/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-16 sm:pt-24">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/5 px-4 py-1.5 text-sm text-brand-300">
            <Zap className="h-4 w-4" />
            Fast &amp; Free YouTube Converter
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Convert YouTube to
            <br />
            <span className="gradient-text">MP3 &amp; MP4</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            Paste a video, playlist, or channel URL. Select your videos, choose format &amp; quality, download instantly.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.form
          onSubmit={handleSubmit}
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              inputFocused ? 'glow-purple' : ''
            }`}
          >
            <div className="gradient-border rounded-2xl">
              <div className="flex items-center rounded-2xl bg-surface-100 px-4 py-2">
                <Link2 className="mr-3 h-5 w-5 shrink-0 text-white/30" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="https://www.youtube.com/@channel, /playlist, or /watch?v=..."
                  className="flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-white/25"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="btn-primary ml-2 flex items-center gap-2 !rounded-xl !px-5 !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? (
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isLoading ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Loading overlay — fixed full screen */}
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="glass-card glow-purple flex flex-col items-center gap-4 px-10 py-8">
              <motion.div
                className="h-10 w-10 rounded-full border-4 border-brand-400/30 border-t-brand-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <div className="text-center">
                <p className="text-base font-medium text-white">Fetching videos...</p>
                <p className="mt-1 text-sm text-white/40">This may take a moment for large channels</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            {
              icon: Music,
              title: 'Audio Formats',
              desc: 'MP3, WAV, FLAC, M4A — up to 320kbps',
              color: 'from-brand-400 to-brand-600',
            },
            {
              icon: Film,
              title: 'Video Formats',
              desc: 'MP4, WebM — up to 4K resolution',
              color: 'from-accent-blue to-accent-cyan',
            },
            {
              icon: Shield,
              title: 'Batch Download',
              desc: 'Full channels, playlists — select & convert',
              color: 'from-accent-pink to-brand-400',
            },
          ].map((feat) => (
            <div key={feat.title} className="glass-card p-5">
              <div
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color}`}
              >
                <feat.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white/90">{feat.title}</h3>
              <p className="mt-1 text-xs text-white/40">{feat.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;

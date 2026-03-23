import { create } from 'zustand';
import type {
  VideoInfo,
  OutputFormat,
  AudioBitrate,
  VideoQuality,
  ConversionJob,
} from '../../../shared/types';

interface ConverterState {
  // URL & Videos
  url: string;
  videos: VideoInfo[];
  channelName: string | null;
  playlistTitle: string | null;
  isLoading: boolean;
  error: string | null;

  // Selection
  selectedIds: Set<string>;

  // Conversion options
  format: OutputFormat;
  audioBitrate: AudioBitrate;
  videoQuality: VideoQuality;

  // Jobs
  jobs: ConversionJob[];

  // Actions
  setUrl: (url: string) => void;
  setVideos: (videos: VideoInfo[], channel?: string, playlist?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  selectNone: () => void;
  setFormat: (format: OutputFormat) => void;
  setAudioBitrate: (bitrate: AudioBitrate) => void;
  setVideoQuality: (quality: VideoQuality) => void;
  setJobs: (jobs: ConversionJob[]) => void;
  updateJob: (id: string, update: Partial<ConversionJob>) => void;
  reset: () => void;
}

export const useConverterStore = create<ConverterState>((set, get) => ({
  url: '',
  videos: [],
  channelName: null,
  playlistTitle: null,
  isLoading: false,
  error: null,
  selectedIds: new Set(),
  format: 'mp3',
  audioBitrate: 192,
  videoQuality: '720p',
  jobs: [],

  setUrl: (url) => set({ url }),
  setVideos: (videos, channelName, playlistTitle) =>
    set({ videos, channelName: channelName ?? null, playlistTitle: playlistTitle ?? null, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  toggleSelect: (id) => {
    const selected = new Set(get().selectedIds);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    set({ selectedIds: selected });
  },
  selectAll: () => set({ selectedIds: new Set(get().videos.map((v) => v.id)) }),
  selectNone: () => set({ selectedIds: new Set() }),

  setFormat: (format) => set({ format }),
  setAudioBitrate: (audioBitrate) => set({ audioBitrate }),
  setVideoQuality: (videoQuality) => set({ videoQuality }),

  setJobs: (jobs) => set({ jobs }),
  updateJob: (id, update) =>
    set({
      jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...update } : j)),
    }),

  reset: () =>
    set({
      url: '',
      videos: [],
      channelName: null,
      playlistTitle: null,
      isLoading: false,
      error: null,
      selectedIds: new Set(),
      jobs: [],
    }),
}));

import { create } from 'zustand';
import type {
  VideoInfo,
  OutputFormat,
  AudioBitrate,
  VideoQuality,
  ConversionJob,
  TrimOptions,
} from '../../../shared/types';

interface HistoryEntry {
  id: string;
  videoTitle: string;
  format: OutputFormat;
  fileSize?: number;
  convertedAt: string;
}

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
  trim: TrimOptions | null;

  // Jobs
  jobs: ConversionJob[];

  // History
  history: HistoryEntry[];

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
  setTrim: (trim: TrimOptions | null) => void;
  setJobs: (jobs: ConversionJob[]) => void;
  updateJob: (id: string, update: Partial<ConversionJob>) => void;
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  reset: () => void;
}

// Load history from localStorage
function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem('ytrip_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]): void {
  localStorage.setItem('ytrip_history', JSON.stringify(history.slice(0, 200)));
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
  trim: null,
  jobs: [],
  history: loadHistory(),

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
  setTrim: (trim) => set({ trim }),

  setJobs: (jobs) => set({ jobs }),
  updateJob: (id, update) =>
    set({
      jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...update } : j)),
    }),

  addToHistory: (entry) => {
    const history = [entry, ...get().history].slice(0, 200);
    saveHistory(history);
    set({ history });
  },
  clearHistory: () => {
    localStorage.removeItem('ytrip_history');
    set({ history: [] });
  },

  reset: () =>
    set({
      url: '',
      videos: [],
      channelName: null,
      playlistTitle: null,
      isLoading: false,
      error: null,
      selectedIds: new Set(),
      trim: null,
      jobs: [],
    }),
}));

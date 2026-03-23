import { API_BASE } from '../../shared/constants';
import type {
  ApiResponse,
  FetchVideosResponse,
  ConversionJob,
  ConversionRequest,
} from '../../shared/types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Request failed: ${res.status}`);
  }

  return json.data as T;
}

export const api = {
  fetchVideos(url: string) {
    return request<FetchVideosResponse>('/videos/fetch', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  startConversions(params: ConversionRequest) {
    return request<{ jobs: ConversionJob[] }>('/conversions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  getJob(id: string) {
    return request<ConversionJob>(`/conversions/${id}`);
  },

  getJobs() {
    return request<{ jobs: ConversionJob[] }>('/conversions');
  },

  getDownloadUrl(jobId: string) {
    return `${API_BASE}/downloads/${jobId}`;
  },

  getBatchDownloadUrl() {
    return `${API_BASE}/downloads/batch`;
  },
};

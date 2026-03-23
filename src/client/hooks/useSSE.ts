import { useEffect, useRef } from 'react';
import { API_BASE } from '../../shared/constants';
import type { ConversionJob } from '../../shared/types';

export function useSSE(jobId: string | null, onUpdate: (job: ConversionJob) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const es = new EventSource(`${API_BASE}/conversions/${jobId}/sse`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const job = JSON.parse(event.data) as ConversionJob;
        onUpdate(job);

        if (job.status === 'done' || job.status === 'error') {
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [jobId, onUpdate]);
}

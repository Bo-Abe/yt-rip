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

/** Subscribe to SSE for multiple jobs simultaneously */
export function useMultiSSE(
  jobIds: string[],
  onUpdate: (job: ConversionJob) => void,
) {
  const sourcesRef = useRef<Map<string, EventSource>>(new Map());

  useEffect(() => {
    const current = sourcesRef.current;

    // Close SSE for jobs no longer in the list
    for (const [id, es] of current) {
      if (!jobIds.includes(id)) {
        es.close();
        current.delete(id);
      }
    }

    // Open SSE for new jobs
    for (const jobId of jobIds) {
      if (current.has(jobId)) continue;

      const es = new EventSource(`${API_BASE}/conversions/${jobId}/sse`);

      es.onmessage = (event) => {
        try {
          const job = JSON.parse(event.data) as ConversionJob;
          onUpdate(job);
          if (job.status === 'done' || job.status === 'error') {
            es.close();
            current.delete(jobId);
          }
        } catch {
          // ignore
        }
      };

      es.onerror = () => {
        es.close();
        current.delete(jobId);
      };

      current.set(jobId, es);
    }

    return () => {
      for (const es of current.values()) es.close();
      current.clear();
    };
  }, [jobIds.join(','), onUpdate]);
}

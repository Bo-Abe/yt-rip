import { describe, it, expect } from 'vitest';
import { fetchVideosSchema, conversionRequestSchema } from '../../../src/shared/schemas';

describe('fetchVideosSchema', () => {
  it('should accept valid YouTube video URL', () => {
    const result = fetchVideosSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    expect(result.success).toBe(true);
  });

  it('should accept YouTube channel URL', () => {
    const result = fetchVideosSchema.safeParse({
      url: 'https://www.youtube.com/@KINGMIXX-x1c',
    });
    expect(result.success).toBe(true);
  });

  it('should accept YouTube playlist URL', () => {
    const result = fetchVideosSchema.safeParse({
      url: 'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
    });
    expect(result.success).toBe(true);
  });

  it('should accept YouTube shorts URL', () => {
    const result = fetchVideosSchema.safeParse({
      url: 'https://www.youtube.com/shorts/abc123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject non-YouTube URL', () => {
    const result = fetchVideosSchema.safeParse({
      url: 'https://vimeo.com/12345',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty string', () => {
    const result = fetchVideosSchema.safeParse({ url: '' });
    expect(result.success).toBe(false);
  });

  it('should reject non-URL string', () => {
    const result = fetchVideosSchema.safeParse({ url: 'not a url' });
    expect(result.success).toBe(false);
  });
});

describe('conversionRequestSchema', () => {
  it('should accept valid MP3 conversion request', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc123'],
      format: 'mp3',
      audioBitrate: 320,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid MP4 conversion request', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc123', 'def456'],
      format: 'mp4',
      videoQuality: '1080p',
    });
    expect(result.success).toBe(true);
  });

  it('should accept audioBitrate as string', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc123'],
      format: 'mp3',
      audioBitrate: '192',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty videoIds', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: [],
      format: 'mp3',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid format', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc'],
      format: 'avi',
    });
    expect(result.success).toBe(false);
  });

  it('should accept with trim options', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc123'],
      format: 'mp3',
      trim: { start: 10, end: 60 },
    });
    expect(result.success).toBe(true);
  });

  it('should reject trim where end <= start', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc123'],
      format: 'mp3',
      trim: { start: 60, end: 10 },
    });
    expect(result.success).toBe(false);
  });

  it('should accept with videoTitles and videoDurations', () => {
    const result = conversionRequestSchema.safeParse({
      videoIds: ['abc123'],
      videoTitles: { abc123: 'My Video' },
      videoDurations: { abc123: 120 },
      format: 'flac',
    });
    expect(result.success).toBe(true);
  });
});

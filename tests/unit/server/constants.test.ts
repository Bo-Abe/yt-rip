import { describe, it, expect } from 'vitest';
import { FORMAT_LABELS, BITRATE_LABELS, QUALITY_LABELS } from '../../../src/shared/constants';

describe('constants', () => {
  it('should have labels for all audio formats', () => {
    expect(FORMAT_LABELS.mp3).toBeDefined();
    expect(FORMAT_LABELS.wav).toBeDefined();
    expect(FORMAT_LABELS.flac).toBeDefined();
    expect(FORMAT_LABELS.m4a).toBeDefined();
  });

  it('should have labels for all video formats', () => {
    expect(FORMAT_LABELS.mp4).toBeDefined();
    expect(FORMAT_LABELS.webm).toBeDefined();
  });

  it('should have labels for all bitrates', () => {
    expect(BITRATE_LABELS[64]).toBeDefined();
    expect(BITRATE_LABELS[128]).toBeDefined();
    expect(BITRATE_LABELS[192]).toBeDefined();
    expect(BITRATE_LABELS[256]).toBeDefined();
    expect(BITRATE_LABELS[320]).toBeDefined();
  });

  it('should have labels for all video qualities', () => {
    expect(QUALITY_LABELS['360p']).toBeDefined();
    expect(QUALITY_LABELS['1080p']).toBeDefined();
    expect(QUALITY_LABELS['2160p']).toBeDefined();
  });
});

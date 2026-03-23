import { describe, it, expect } from 'vitest';
import { formatDuration, formatViews, formatFileSize, estimateFileSize } from '../../../src/client/lib/formatters';

describe('formatDuration', () => {
  it('should format seconds only', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05');
  });

  it('should format hours', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('should handle negative', () => {
    expect(formatDuration(-5)).toBe('0:00');
  });
});

describe('formatViews', () => {
  it('should format millions', () => {
    expect(formatViews(1_500_000)).toBe('1.5M');
  });

  it('should format thousands', () => {
    expect(formatViews(42_300)).toBe('42.3K');
  });

  it('should format small numbers as-is', () => {
    expect(formatViews(999)).toBe('999');
  });
});

describe('formatFileSize', () => {
  it('should format gigabytes', () => {
    expect(formatFileSize(1_610_612_736)).toBe('1.5 GB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(5_242_880)).toBe('5.0 MB');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });
});

describe('estimateFileSize', () => {
  it('should estimate MP3 at 192kbps for 3 minutes', () => {
    const size = estimateFileSize(180, 192);
    // 180 * 192000 / 8 = 4,320,000 bytes ≈ 4.3MB
    expect(size).toBe(4_320_000);
  });
});

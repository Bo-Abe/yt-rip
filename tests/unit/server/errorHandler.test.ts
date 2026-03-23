import { describe, it, expect, vi } from 'vitest';
import { AppError, errorHandler } from '../../../src/server/middleware/errorHandler';
import type { Request, Response, NextFunction } from 'express';

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('AppError', () => {
  it('should create an error with statusCode and code', () => {
    const err = new AppError(404, 'NOT_FOUND', 'Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
    expect(err.name).toBe('AppError');
  });
});

describe('errorHandler', () => {
  it('should handle AppError with correct status and shape', () => {
    const err = new AppError(400, 'INVALID_URL', 'Bad URL');
    const res = mockRes();

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INVALID_URL', message: 'Bad URL' },
    });
  });

  it('should handle generic errors with 500', () => {
    const err = new Error('something broke');
    const res = mockRes();

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  });
});

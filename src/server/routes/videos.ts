import { Router } from 'express';
import { fetchVideos } from '../services/youtube.service.js';
import { validate } from '../middleware/validate.js';
import { fetchVideosSchema } from '../../shared/schemas.js';
import type { ApiResponse, FetchVideosResponse } from '../../shared/types.js';

export const videosRouter = Router();

videosRouter.post('/fetch', validate(fetchVideosSchema), async (req, res, next) => {
  try {
    const { url } = req.body as { url: string };
    const result = await fetchVideos(url);

    const response: ApiResponse<FetchVideosResponse> = {
      data: {
        videos: result.videos,
        playlistTitle: result.playlistTitle,
        channelName: result.channelName,
        totalCount: result.videos.length,
      },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

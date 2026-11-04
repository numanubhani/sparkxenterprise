import { Router } from 'express';
import mongoose from 'mongoose';
import Upload from '../models/Upload.js';

const router = Router();

// GET /api/uploads/:id — public, serves an uploaded product image
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const file = await Upload.findById(req.params.id).lean();
    if (!file) return res.status(404).end();
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // the site is on a different origin than the API
    res.send(file.data.buffer ? Buffer.from(file.data.buffer) : file.data);
  } catch (err) {
    next(err);
  }
});

export default router;

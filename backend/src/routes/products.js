import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// GET /api/products?category=&featured=true
router.get('/', async (req, res, next) => {
  try {
    const filter = { active: { $ne: false } };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.featured = true;
    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).select('-supplierRef').lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: { $ne: false } }).select('-supplierRef').lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;

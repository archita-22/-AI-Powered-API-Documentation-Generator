import express from 'express';
const router = express.Router();

router.get('/menu', (req, res) => {
  res.json({ items: ['Paneer Butter Masala', 'Veg Biryani'] });
});

router.post('/menu', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'name and price required' });
  }
  res.status(201).json({ name, price });
});

export default router;
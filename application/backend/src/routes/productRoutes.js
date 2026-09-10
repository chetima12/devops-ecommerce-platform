const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, price FROM products ORDER BY id'
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error fetching products:', error.message);

    res.status(500).json({
      message: 'Failed to fetch products'
    });
  }
});

// Get total product count
router.get('/count', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM products'
    );

    res.status(200).json({
      count: Number(result.rows[0].count)
    });

  } catch (error) {
    console.error('Error counting products:', error.message);

    res.status(500).json({
      message: 'Failed to count products'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, price FROM products WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching product:', error.message);

    res.status(500).json({
      message: 'Failed to fetch product'
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { 
  sendQuoteNotificationToAdmin, 
  sendQuoteConfirmationToCustomer 
} = require('../services/emailService');

// POST /api/quotes - Create new quote request
router.post('/', async (req, res) => {
  const {
    full_name,
    email,
    phone,
    company,
    origin_country,
    cargo_type,
    transport_mode,
    cargo_quantity,
    cargo_dimensions,
    cargo_weight,
    route,
    route_details,
    delivery_country,
    final_destination,
    message
  } = req.body;

  // Validation
  if (!full_name || !email || !origin_country || !cargo_type || !transport_mode) {
    return res.status(400).json({ 
      error: 'Missing required fields: full_name, email, origin_country, cargo_type, transport_mode' 
    });
  }

  try {
    const query = `
      INSERT INTO quotes (
        full_name, email, phone, company,
        origin_country, cargo_type, transport_mode,
        cargo_quantity, cargo_dimensions, cargo_weight,
        route, route_details, delivery_country, final_destination,
        message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      full_name, email, phone, company,
      origin_country, cargo_type, transport_mode,
      cargo_quantity, cargo_dimensions, cargo_weight,
      route, route_details, delivery_country, final_destination,
      message
    ];

    const result = await pool.query(query, values);
    const quote = result.rows[0];

    // Send emails (don't block response)
    Promise.all([
      sendQuoteNotificationToAdmin(quote),
      sendQuoteConfirmationToCustomer(quote)
    ]).catch(err => console.error('Email error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: { id: quote.id }
    });

  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

// GET /api/quotes - Get all quotes (admin)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM quotes';
    const values = [];
    
    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    console.error('Fetch quotes error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// GET /api/quotes/:id - Get single quote
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Fetch quote error:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// PATCH /api/quotes/:id - Update quote status (admin)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const result = await pool.query(
      'UPDATE quotes SET status = COALESCE($1, status), admin_notes = COALESCE($2, admin_notes) WHERE id = $3 RETURNING *',
      [status, admin_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

module.exports = router;

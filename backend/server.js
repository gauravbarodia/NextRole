const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// --- FIX 1: Add express.json() ---
// Without this, req.body will be undefined and POST/PUT will crash
app.use(express.json()); 

// --- FIX 2: Add "https://" to the Railway URL ---
app.use(cors({
  origin: [
    "http://localhost:5173",                  
    "https://nextrole-production.up.railway.app" // <--- Must have https://
  ],
  credentials: true
}));

// --- MIDDLEWARE: Check for User ID ---
const requireAuth = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No User ID found' });
  }
  req.userId = userId;
  next();
};

app.use(requireAuth);

// 1. GET: Fetch User's Jobs
app.get('/jobs', async (req, res) => {
  const { search, status } = req.query;
  // Use params array to prevent SQL injection
  let sql = 'SELECT * FROM applications WHERE user_id = ?';
  const params = [req.userId];

  if (search) {
    sql += ' AND (company LIKE ? OR role LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (status && status !== 'All') {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY date_applied DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Add Job
app.post('/jobs', async (req, res) => {
  const { company, role, status } = req.body; // Needs express.json() to work!
  try {
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE company = ? AND role = ? AND user_id = ?', 
      [company, role, req.userId]
    );

    if (existing.length > 0) return res.status(409).json({ message: 'Duplicate', job: existing[0] });

    const [result] = await db.query(
      'INSERT INTO applications (company, role, status, date_applied, user_id) VALUES (?, ?, ?, NOW(), ?)',
      [company, role, status || 'Applied', req.userId]
    );
    
    // Fetch the newly created job to return it
    const [newRow] = await db.query('SELECT * FROM applications WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT: Update Status
app.put('/jobs/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE applications SET status = ? WHERE id = ? AND user_id = ?', 
      [status, req.params.id, req.userId]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE ALL (Correctly placed before /:id)
app.delete('/jobs/all', async (req, res) => {
  const { status } = req.query;
  try {
    if (status && status !== 'All') {
      await db.query('DELETE FROM applications WHERE status = ? AND user_id = ?', [status, req.userId]);
    } else {
      await db.query('DELETE FROM applications WHERE user_id = ?', [req.userId]);
    }
    res.json({ message: 'Cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE Single Job
app.delete('/jobs/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM applications WHERE id = ? AND user_id = ?', 
      [req.params.id, req.userId]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
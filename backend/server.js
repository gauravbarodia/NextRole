const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE: Check for User ID ---
// Every request from frontend MUST send a 'user-id' header
const requireAuth = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No User ID found' });
  }
  req.userId = userId; // Save it to use in routes
  next();
};

// Apply to ALL routes
app.use(requireAuth);

// 1. GET: Fetch ONLY this user's jobs
app.get('/jobs', async (req, res) => {
  const { search, status } = req.query;
  
  // Start with filtering by USER ID
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

// 2. POST: Add job (With User ID)
app.post('/jobs', async (req, res) => {
  const { company, role, status } = req.body;
  try {
    // Check duplicates only for THIS user
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE company = ? AND role = ? AND user_id = ?', 
      [company, role, req.userId]
    );

    if (existing.length > 0) return res.status(409).json({ message: 'Duplicate', job: existing[0] });

    const [result] = await db.query(
      'INSERT INTO applications (company, role, status, date_applied, user_id) VALUES (?, ?, ?, NOW(), ?)',
      [company, role, status, req.userId]
    );
    
    const [newRow] = await db.query('SELECT * FROM applications WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT: Update Status (Ensure user owns the job)
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

// 4. DELETE Single Job (Ensure user owns it)
app.delete('/jobs/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM applications WHERE id = ? AND user_id = ?', 
      [req.params.id, req.userId]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE ALL (Only this user's jobs)
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

app.listen(5000, () => console.log('Server running on 5000'));
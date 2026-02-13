const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. GET: Fetch jobs with Search & Filter
app.get('/jobs', async (req, res) => {
  const { search, status } = req.query;
  
  let sql = 'SELECT * FROM applications';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(company LIKE ? OR role LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (status && status !== 'All') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY date_applied DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Add a new job (With Duplicate Check)
app.post('/jobs', async (req, res) => {
  const { company, role, status } = req.body;
  try {
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE company = ? AND role = ?', 
      [company, role]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Duplicate found', job: existing[0] });
    }

    const [result] = await db.query(
      'INSERT INTO applications (company, role, status, date_applied) VALUES (?, ?, ?, NOW())',
      [company, role, status]
    );
    
    const [newRow] = await db.query('SELECT * FROM applications WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT: Update status
app.put('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. SMART DELETE ALL (Must be above /:id)
app.delete('/jobs/all', async (req, res) => {
  const { status } = req.query;
  try {
    if (status && status !== 'All') {
      await db.query('DELETE FROM applications WHERE status = ?', [status]);
    } else {
      await db.query('DELETE FROM applications');
    }
    res.json({ message: 'Jobs deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE SINGLE JOB
app.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
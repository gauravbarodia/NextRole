const mysql = require('mysql2');
require('dotenv').config(); 

// Create a connection pool (better for performance)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',            // Your MySQL username (usually 'root')
  password: 'gaurav@5395', // <--- REPLACE THIS with your actual password
  database: 'job_tracker_db' // The database we just created
});

// Export the "promise" version so we can use async/await
module.exports = pool.promise();
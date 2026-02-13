/**
 * Database Connection Module
 * * This file handles the connection to the MySQL database using a connection pool.
 * A pool is used instead of a single connection to handle multiple concurrent requests efficiently.
 * * Dependencies:
 * - mysql2: The driver to talk to MySQL.
 * - dotenv: To load private credentials (password, host) from a .env file.
 */

const mysql = require('mysql2/promise');
require('dotenv').config(); 

// Create a pool of connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gaurav@5395', // ideally should strictly use process.env in production
  database: process.env.DB_NAME || 'job_tracker',
  
  // Pool Options
  waitForConnections: true, // If all connections are busy, wait for one to free up
  connectionLimit: 10,      // Max number of simultaneous connections
  queueLimit: 0             // No limit on waiting requests
});

// Export the pool so it can be used in server.js
module.exports = pool;
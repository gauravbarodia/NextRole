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
dotenv.config();
const pool = mysql.createPool({
  host: process.env.DB_HOST,     
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,  
  port: process.env.DB_PORT,      
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
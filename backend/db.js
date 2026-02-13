const mysql = require('mysql2');
const dotenv = require('dotenv'); // <--- YOU ARE MISSING THIS LINE!

// Load env variables
dotenv.config(); 

// Create the connection pool
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

// Export the connection so server.js can use it
module.exports = pool.promise();
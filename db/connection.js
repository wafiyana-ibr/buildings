const mysqlWafi = require('mysql2/promise');
require('dotenv').config();

const poolWafi = mysqlWafi.createPool({
  host: process.env.DB_HOST_WAFI || 'localhost',
  user: process.env.DB_USER_WAFI || 'root',
  password: process.env.DB_PASSWORD_WAFI || '',
  database: process.env.DB_NAME_WAFI || 'wafi_clash_buildings',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
async function initDBConnectionWafi() {
  try {
    const connectionWafi = await poolWafi.getConnection();
    console.log('MySQL connection established successfully');
    connectionWafi.release();
    return true;
  } catch (errorWafi) {
    console.error('MySQL connection error:', errorWafi);
    return false;
  }
}

module.exports = { poolWafi, initDBConnectionWafi };

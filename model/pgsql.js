const {Pool} = require('pg');
const config = require('../config/config.json');

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASS,
  port: config.DB_PORT,
});

/**
 * 事务处理
 * @param {callBack} cb 
 */
const transaction = async (cb) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    cb(client);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');

    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  pool, transaction
}
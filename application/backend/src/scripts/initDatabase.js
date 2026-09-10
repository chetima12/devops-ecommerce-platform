const pool = require('../config/database');

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL
      );
    `);

    const result = await pool.query(
      'SELECT COUNT(*) FROM products'
    );

    if (Number(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, price)
        VALUES
          ('Laptop', 1200),
          ('Keyboard', 80),
          ('Mouse', 40);
      `);

      console.log('Initial product data inserted');
    }

    console.log('Database initialized successfully');

  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();

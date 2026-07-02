const { Client } = require('pg');

const dbName = 'nan_salazar_db';
const connectionConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Juan1025',
  database: 'postgres',
};

async function main() {
  const client = new Client(connectionConfig);

  try {
    await client.connect();
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos creada: ${dbName}`);
    } else {
      console.log(`ℹ️ La base de datos ya existe: ${dbName}`);
    }
  } catch (error) {
    console.error('❌ Error al preparar la base de datos:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

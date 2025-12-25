const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'gangseungsig',
  password: undefined,
  database: 'townin',
});

console.log('Attempting to connect to PostgreSQL...');
console.log('Config:', {
  host: client.host,
  port: client.port,
  user: client.user,
  database: client.database,
});

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to PostgreSQL!');
    return client.query('SELECT version()');
  })
  .then((res) => {
    console.log('PostgreSQL version:', res.rows[0].version);
    return client.end();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error connecting to PostgreSQL:', err);
    process.exit(1);
  });

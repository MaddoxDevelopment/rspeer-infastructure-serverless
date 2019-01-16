const { Client } = require('pg');

const client = new Client({
    user: process.env.postgres_user,
    host: process.env.postgres_host,
    database: process.env.postgres_database,
    password: process.env.postgres_password,
    port: process.env.postgres_port,
    ssl : true
});

client.connect();

module.exports = client;
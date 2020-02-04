// Require created environment variables
require('dotenv').config();
// Require service objects
const ServiceObject = require('./ServiceObject');

// Require library to access database
const knex = require('knex');

// Create knex instance with the database configuration
const db = knex({
    // Specify driver for Postgres - type of database
    client: 'pg',
    // Specify database to connect to
    connection: process.env.DB_URL
});
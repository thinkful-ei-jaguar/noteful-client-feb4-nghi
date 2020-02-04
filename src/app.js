//-------------------------------------- Import/require modules
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');

const foldersRouter = require('./folders/folders-router');
const notesRouter = require('./notes/notes-router');

const app = express();

// Depends on the condition of the environment
// Morgan - tiny format for production environment
// Morgan - common format for development environment
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';









//-------------------------------------- Mounting our middleware
app.use(morgan(morganOption));
// Hide HTTP response headers before sending cross origins
// Use helmet before cors
app.use(helmet());
app.use(cors());
// Use to parse JSON body of request
app.use(express.json());
// Create error if any
app.use(function errorHandler(error, req, res, next) {
  let response;
   if (NODE_ENV === 'production') {
     response = { error: { message: 'server error' } };
   } else {
     console.error(error);
     response = { message: error.message, error };
   }
   res.status(500).json(response);
 });







 //-------------------------------------- Endpoints configuration
app.use('/api/folders', foldersRouter);

 app.get('/', (req, res) => {
  res.send('Hello, Nghi!');
});

module.exports = app; 
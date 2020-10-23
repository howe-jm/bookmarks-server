require('dotenv').config();
const { NODE_ENV } = require('./config');

const express = require('express');
const app = express();

const morgan = require('morgan');
const morganOption =
  NODE_ENV === 'production' ? 'tiny' : 'common';

const cors = require('cors');
const helmet = require('helmet');

const validateBearerToken = require('./bearerToken');
const errorHandler = require('./errorHandler');
const bookmarksRoute = require('./bookmarks/bookmarks-route.js');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(validateBearerToken);
app.use(errorHandler);
app.use(bookmarksRoute);

module.exports = app;

const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const { bookmarks } = require('../store');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    //function here
  });

bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find((obj) => obj.id == id);
    if (!bookmark) {
      logger.error(`Bookmark with ${id} not found.`);
      return res.status(404).send('Bookmark not found!');
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    //function here
  });

module.exports = bookmarkRouter;

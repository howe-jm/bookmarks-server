const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store.js');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, desc, rating } = req.body;
    if (!title || title === '') {
      return res.status(400).send('Title required.');
    }
    if (!url || url === '') {
      return res.status(400).send('URL required.');
    }
    if (!desc || desc === '') {
      return res.status(400).send('Description required.');
    }
    if (!rating) {
      return res.status(400).send('Rating required.');
    }
    if (typeof rating !== 'number') {
      return res
        .status(400)
        .send('Rating must be a number.');
    }

    res.status(201).send('All is well');
  });

bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find((obj) => obj.id === id);
    if (!bookmark) {
      logger.error(`Bookmark with ${id} not found.`);
      return res.status(404).send('Bookmark not found!');
    }
    res.status(200).json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIdx = bookmarks.findIndex(
      (obj) => obj.id === id
    );
    if (bookmarkIdx === -1) {
      logger.error(`Bookmark with ${id} not found.`);
      return res.status(404).send('Bookmark not found!');
    }
    bookmarks.splice(bookmarkIdx, 1);
    logger.info(`Bookmark with ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;

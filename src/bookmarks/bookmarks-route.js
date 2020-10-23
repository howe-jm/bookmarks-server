const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store.js');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
var regex = new RegExp(expression);

const port = process.env.PORT;

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, desc, rating } = req.body;
    if (!title || title === '') {
      logger.error('Title required.');
      return res.status(400).send('Title required.');
    }
    if (!url || url === '') {
      logger.error('URL required.');
      return res.status(400).send('URL required.');
    }
    if (!url.match(regex)) {
      logger.error('Invalid URL.');
      return res.status(400).send('Invalid URL.');
    }
    if (!desc || desc === '') {
      logger.error('Desc required.');
      return res.status(400).send('Description required.');
    }
    if (!rating) {
      logger.error('Rating required.');
      return res.status(400).send('Rating required.');
    }
    if (typeof rating !== 'number') {
      logger.error('Rating must be a number.');
      return res
        .status(400)
        .send('Rating must be a number.');
    }
    let id = uuid();
    const newBookmark = {
      id,
      title,
      url,
      desc,
      rating,
    };
    bookmarks.push(newBookmark);
    logger.info(`Bookmark with ${id} created`);

    res
      .status(201)
      .location(`http://localhost:${port}/bookmarks/${id}`)
      .json(newBookmark);
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

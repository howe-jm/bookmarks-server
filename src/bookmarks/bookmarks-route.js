const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const BookmarksService = require('./bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

const serializeArticle = (bookmark) => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  website_url: xss(bookmark.website_url),
  website_description: xss(bookmark.website_description),
  rating: xss(bookmark.rating),
});

var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
var regex = new RegExp(expression);

const port = process.env.PORT;

bookmarkRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then((bookmarks) => {
        if (bookmarks.length === 0) {
          return res.status(404).json({
            error: { message: `No bookmarks` },
          });
        }
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, website_url, website_description, rating } = req.body;
    const newBookmark = {
      title,
      website_url,
      website_description,
      rating,
    };

    for (const [key, value] of Object.entries(newBookmark))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    BookmarksService.insertBookmark(req.app.get('db'), newBookmark)
      .then((bookmark) => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeArticle(bookmark));
      })
      .catch(next);
  });

bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    BookmarksService.getById(req.app.get('db'), id)
      .then((bookmark) => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `No matching bookmarks` },
          });
        }
        res.json(bookmark);
      })
      .catch(next);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIdx = bookmarks.findIndex((obj) => obj.id === id);
    if (bookmarkIdx === -1) {
      logger.error(`Bookmark with ${id} not found.`);
      return res.status(404).send('Bookmark not found!');
    }
    bookmarks.splice(bookmarkIdx, 1);
    logger.info(`Bookmark with ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;

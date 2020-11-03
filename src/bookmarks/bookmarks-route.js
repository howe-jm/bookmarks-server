/* eslint-disable eqeqeq */
/* eslint-disable quotes */
const path = require('path');
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

bookmarkRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then((bookmarks) => {
        if (bookmarks.length === 0) {
          logger.error(`No bookmarks`);
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
      if (value == null) {
        logger.error(`Missing '${key}' in request body`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }

    if (!newBookmark.website_url.match(regex)) {
      logger.error('Invalid URL.');
      return res.status(400).json({ error: { message: `Invalid URL` } });
    }

    if (newBookmark.rating < 0 || newBookmark.rating > 5) {
      logger.error('Invalid rating');
      return res
        .status(400)
        .json({ error: { message: `Rating must be between 1 and 5` } });
    }

    BookmarksService.insertBookmark(req.app.get('db'), newBookmark)
      .then((bookmark) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
          .json(serializeArticle(bookmark));
      })
      .catch(next);
  });

bookmarkRouter
  .route('/:id')
  .all((req, res, next) => {
    BookmarksService.getById(req.app.get('db'), req.params.id).then((bookmark) => {
      if (!bookmark) {
        logger.error(`Bookmark doesn't exist`);
        return res.status(404).json({
          error: { message: `Bookmark doesn't exist` },
        });
      }
      res.bookmark = bookmark;
      next();
    });
  })
  .get((req, res, next) => {
    const { id } = req.params;
    BookmarksService.getById(req.app.get('db'), id)
      .then((bookmark) => {
        if (!bookmark) {
          logger.error(`Bookmark doesn't exist`);
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` },
          });
        }
        res.json(bookmark);
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.deleteBookmark(knexInstance, req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, website_url, website_description, rating } = req.body;
    const bookmarkToUpdate = { title, website_url, website_description, rating };

    const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title', 'website_url', 'website_description', or 'rating'`,
        },
      });

    BookmarksService.updateBookmark(req.app.get('db'), req.params.id, bookmarkToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarkRouter;

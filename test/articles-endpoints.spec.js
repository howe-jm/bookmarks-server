/* eslint-disable quotes */
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const {
  makeBookmarksArray,
} = require('./bookmarks.fixtures.js');

let token = 'this-test-key';

describe.only('Bookmarks Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());
  before('clean the table', () =>
    db('bookmarks').truncate()
  );

  afterEach('cleanup', () => db('bookmarks').truncate());

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        return supertest(app)
          .get(`/bookmarks`)
          .set({ Authorization: `Bearer ${token}` })
          .expect(404, {
            error: { message: `No bookmarks` },
          });
      });
    });
    context(
      'Given there are bookmarks in the database',
      () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('insert bookmarks', () => {
          return db.into('bookmarks').insert(testBookmarks);
        });

        it('responds with 200 and all of the bookmarks', () => {
          return supertest(app)
            .get('/bookmarks')
            .set({ Authorization: `Bearer ${token}` })
            .expect(200, testBookmarks);
        });
      }
    );
  });

  describe(`GET /bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set({ Authorization: `Bearer ${token}` })
          .expect(404, {
            error: { message: `No matching bookmarks` },
          });
      });
    });
    context(
      'Given there are bookmarks in the database',
      () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('insert bookmarks', () => {
          return db.into('bookmarks').insert(testBookmarks);
        });

        it('responds with 200 and the specified bookmark', () => {
          const bookmarkId = 2;
          const expectedBookmark =
            testBookmarks[bookmarkId - 1];
          return supertest(app)
            .get(`/bookmarks/${bookmarkId}`)
            .set({ Authorization: `Bearer ${token}` })
            .expect(200, expectedBookmark);
        });
      }
    );
  });
});
/* eslint-disable quotes */
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures.js');

let token = 'this-test-key';

describe('Bookmarks Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks').truncate());

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
    context('Given there are bookmarks in the database', () => {
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
    });
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
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into('bookmarks').insert(testBookmarks);
      });

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set({ Authorization: `Bearer ${token}` })
          .expect(200, expectedBookmark);
      });
    });
  });

  describe.only(`POST /bookmarks`, () => {
    it(`creates a bookmark, responding with 201 and the new bookmark`, function () {
      this.retries(3);
      const newBookmark = {
        title: 'Test new bookmark',
        website_url: 'Test new bookmark content...',
        website_description: 'Some content about some things',
        rating: '3',
      };
      return supertest(app)
        .post('/bookmarks')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBookmark)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.website_url).to.eql(newBookmark.website_url);
          expect(res.body.website_description).to.eql(newBookmark.website_description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .set({ Authorization: `Bearer ${token}` })
            .expect(postRes.body)
        );
    });
    const requiredFields = ['title', 'website_url', 'website_description', 'rating'];
    requiredFields.forEach((field) => {
      const newBookmark = {
        title: 'Test new bookmark',
        website_url: 'Test new bookmark content...',
        website_description: 'Some content about some things',
        rating: 3,
      };
      it(`responds with a 400 and an error message when '${field}' is missing`, () => {
        delete newBookmark[field];

        return supertest(app)
          .post('/bookmarks')
          .set({ Authorization: `Bearer ${token}` })
          .send(newBookmark)
          .expect(400, { error: { message: `Missing '${field}' in request body` } });
      });
    });
    context(`Given an XSS attack bookmark`, () => {
      const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
        website_url: 'Test new bookmark content...',
        website_description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: '1',
      };

      beforeEach('insert malicious bookmark', () => {
        return db.into('bookmarks').insert([maliciousBookmark]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .post(`/bookmarks/`)
          .set({ Authorization: `Bearer ${token}` })
          .send(maliciousBookmark)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).to.eql(
              'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
            );
            expect(res.body.website_description).to.eql(
              `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
            );
          });
      });
    });
  });
});

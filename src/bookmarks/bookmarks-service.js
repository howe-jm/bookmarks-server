const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },
  insertBookmarks(knex, newArticle) {
    return knex
      .insert(newArticle)
      .into('bookmarks')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from('bookmarks')
      .select('*')
      .where('id', id)
      .first();
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks').where({ id }).delete();
  },
  updateBookmark(knex, id, newArticleFields) {
    return knex('bookmarks')
      .where({ id })
      .update(newArticleFields);
  },
};
module.exports = BookmarksService;

BEGIN;

INSERT INTO bookmarks (title, website_url, website_description, rating)
VALUES
('Google', 'http://google.com', 'An indie search engine startup.', "4"),
('Fluffiest Cats in the World', 'http://medium.com/bloggerx/fluffiest-cats-334', 'The only list of fluffy cats online', "5"),
('Yahoo', 'http://yahoo.com', 'An world-dominating search engine startup', "3"),
('Reddit', 'http://reddit.com', 'Where productivity goes to die, also cats.', "3"),
('Twitter', 'http://twitter.com', 'That page with the things', "1"),
('Real Life Pokedex', 'http://fake-real-life-pokedex.com', 'This site is not actually a pokedex.', "2"),
('Thinkful Overview', 'https://overview.thinkful.com/', 'Thinkful program overview', "5");

COMMIT;
# Express Bookmarks Server

This is a bookmarks app server!

## Set up

Complete the following steps to start a new project called bookmarks-server:

1. Clone this repository to your local machine and change to the directory:

`git clone (URL or SSH) bookmarks-server && cd $_`

2. Make a fresh start of the git history for this project with

`rm -rf .git && git init`

3. Install the node dependencies

`npm install`

4. Move the example Environment file to `.env` that will be ignored by git and read by the express server. Update the API_KEY to use a secure bearer token.

`mv example.env .env`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

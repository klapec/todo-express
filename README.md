# Todo-express

[![Build Status](https://travis-ci.org/klapec/todo-express.svg?branch=master)](https://travis-ci.org/klapec/todo-express)

Node.js app based on Express, MongoDB, Mongoose, Passport.

## Usage

Install all the dependencies with `npm install` and start with `npm start`.

If you want to use this for development purposes, use `gulp` to launch the app. It sets up a local server, watches all the files for any changes, recompiles them and refreshes the browser if necessary.

Requires MongoDB. If it's not running locally (on `localhost:27017`) then the mongo URI needs to be provided via the MONGOURI environmental variable.

## Testing

Both client and server side tests can be run with `gulp test`.

## Example

[klapec-todo-express.heroku.com](https://klapec-todo-express.herokuapp.com/).

Since this is running on a free heroku dyno, it sleeps after 30 minutes of inactivity and it has to sleep for 6 hours in a 24 hour period.

If the page is loading slowly, give it a few seconds for it to wake up.

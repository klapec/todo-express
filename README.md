# Todo-express
![](https://codeship.com/projects/22409750-2266-0133-e963-02fe1facef38/status?branch=master)
[![Dependency Status](https://david-dm.org/klapec/todo-express.svg)](https://david-dm.org/klapec/todo-express)

Node.js app based on Express, MongoDB, Mongoose and Passport.

## Usage

Install all the dependencies with `npm install --production` and start with `npm start`.

If you want to use this for development purposes, run `npm install` and use `gulp` to launch the app. It sets up a local server, watches all the files for any changes, recompiles them and refreshes the browser if necessary.

Requires MongoDB. If it's not running locally (on `localhost:27017`) then the mongo URI needs to be provided via the MONGO_URI environmental variable.

## Testing

Both client and server side tests can be run with `npm test`.
Frontend tests require PhantomJS installed globally.

## Example

[todoexpress-klapec.rhcloud.com/](http://todoexpress-klapec.rhcloud.com/)

/* eslint no-unused-expressions: 0 */

import http from 'http';
import httpProxy from 'http-proxy';
import mongoose from 'mongoose';
import request from 'supertest';
import jsdom from 'jsdom';
import chai from 'chai';
import mongoConfig from '../../config/mongo';

const proxy = httpProxy.createProxyServer();
const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:3000' });
});
const mongoUri = process.env.MONGO_URI || mongoConfig.uri;

if (!mongoose.connection.name) {
  const connect = () => {
    mongoose.connect(mongoUri);
  };
  connect();
}

import '../../models/user';

const expect = chai.expect;
const User = mongoose.model('User');

describe('Backend: ', () => {
  before(done => {
    request(server)
      .get('/signup')
      .end((err, res) => {
        if (err) return false;

        jsdom.env(res.text, (errors, window) => {
          const csrf = window.document.querySelector('input[name="_csrf"]').value;

          request(server)
            .post('/signup')
            .set('cookie', res.headers['set-cookie'])
            .send({
              _csrf: csrf,
              email: 'test@gmail.com',
              password: 'test',
              passwordConfirmation: 'test'
            })
            // .end((err, res) => {
            //   console.log('err: ', err);
            //   console.log('res: ', res);
            //   done();
            // });
            .expect('Location', '/tasks')
            .expect(302, done);
        });
      });
  });

  describe('GET /', () => {
    it('should redirect to /login', done => {
      request(server)
        .get('/')
        .expect('Location', '/login')
        .expect(302, done);
    });
  });

  describe('POST /', () => {
    it('should return 404', done => {
      request(server)
        .post('/')
        .send({ foo: 'bar' })
        .expect(404, done);
    });
  });

  describe('GET /signup', () => {
    it('should render the signup page', done => {
      request(server)
        .get('/signup')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('POST /signup', () => {
    describe('with invalid CSRF', () => {
      it('should return 403', done => {
        request(server)
          .post('/signup')
          .send({ foo: 'bar' })
          .expect(403, done);
      });
    });

    describe('with valid CSRF', () => {
      it('should redirect to /tasks', done => {
        request(server)
          .get('/signup')
          .end((err, res) => {
            if (err) return false;

            jsdom.env(res.text, (errors, window) => {
              const csrf = window.document.querySelector('input[name="_csrf"]').value;

              request(server)
                .post('/signup')
                .set('cookie', res.headers['set-cookie'])
                .send({
                  _csrf: csrf,
                  email: 'test2@gmail.com',
                  password: 'test2',
                  passwordConfirmation: 'test2'
                })
                .expect('Location', '/tasks')
                .expect(302, done);
            });
          });
      });
      it('should\'ve created a new user', done => {
        User.findOne(
          { email: 'test2@gmail.com' },
          (err, user) => {
            expect(err).to.be.null;
            expect(user).to.be.an('object');
            expect(user.email).to.be.eql('test2@gmail.com');

            done();
          }
        );
      });
    });
  });

  describe('GET /login', () => {
    it('should render the login page', done => {
      request(server)
        .get('/login')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('POST /login', () => {
    describe('with invalid CSRF', () => {
      it('should return 403', done => {
        request(server)
          .post('/login')
          .send({ foo: 'bar' })
          .expect(403, done);
      });
    });

    describe('with valid CSRF', () => {
      it('should redirect to /tasks', done => {
        request(server)
          .get('/login')
          .end((err, res) => {

            expect(err).to.not.exist;

            jsdom.env(res.text, (errors, window) => {
              const csrf = window.document.querySelector('input[name="_csrf"]').value;

              request(server)
                .post('/login')
                .set('cookie', res.headers['set-cookie'])
                .send({
                  _csrf: csrf,
                  email: 'test@gmail.com',
                  password: 'test'
                })
                .expect('Location', '/tasks')
                .expect(302, done);
            });
          });
      });
    });
  });

  describe('GET /logout', () => {
    it('should redirect to /', done => {
      request(server)
        .get('/logout')
        .expect('Location', '/')
        .expect(302, done);
    });
  });

  describe('404', () => {
    it('should return 404', done => {
      request(server)
        .get('/foobar')
        .expect(404, done);
    });
  });

  after(() => {
    mongoose.connection.db.dropCollection('tasks');
    mongoose.connection.db.dropCollection('users');
    mongoose.connection.db.dropCollection('sessions');
  });
});

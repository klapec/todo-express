/* eslint no-unused-expressions:0 */

import request from 'supertest';
import jsdom from 'jsdom';
import chai from 'chai';
import app from '../app';

const expect = chai.expect;

describe('Route', () => {
  describe('GET /', () => {
    it('should redirect to /login', done => {
      request(app)
        .get('/')
        .expect('Location', '/login')
        .expect(302, done);
    });
  });

  describe('POST /', () => {
    it('should return 404', done => {
      request(app)
        .post('/')
        .send({ foo: 'bar' })
        .expect(404, done);
    });
  });

  describe('GET /signup', () => {
    it('should render the signup page', done => {
      request(app)
        .get('/signup')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('POST /signup', () => {
    describe('with invalid CSRF', () => {
      it('should return 403', done => {
        request(app)
          .post('/signup')
          .send({ foo: 'bar' })
          .expect(403, done);
      });
    });

    describe('with valid CSRF', () => {
      it('should redirect to /tasks', done => {
        request(app)
          .get('/signup')
          .end((err, res) => {
            if (err) return false;

            jsdom.env(res.text, (errors, window) => {
              const csrf = window.document.querySelector('input[name="_csrf"]').value;

              request(app)
                .post('/signup')
                .set('cookie', res.headers['set-cookie'])
                .send({
                  _csrf: csrf,
                  email: 'test@gmail.com',
                  password: 'test',
                  passwordConfirmation: 'test'
                })
                .expect('Location', '/tasks')
                .expect(302, done);
            });
          });
      });
    });
  });

  describe('GET /login', () => {
    it('should render the login page', done => {
      request(app)
        .get('/login')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('POST /login', () => {
    describe('with invalid CSRF', () => {
      it('should return 403', done => {
        request(app)
          .post('/login')
          .send({ foo: 'bar' })
          .expect(403, done);
      });
    });

    describe('with valid CSRF', () => {
      it('should redirect to /tasks', done => {
        request(app)
          .get('/login')
          .end((err, res) => {

            expect(err).to.not.exist;

            jsdom.env(res.text, (errors, window) => {
              const csrf = window.document.querySelector('input[name="_csrf"]').value;

              request(app)
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
      request(app)
        .get('/logout')
        .expect('Location', '/')
        .expect(302, done);
    });
  });

  describe('GET /tasks', () => {
    it('should redirect to /login', done => {
      request(app)
        .get('/tasks')
        .expect('Location', '/login')
        .expect(302, done);
    });
  });

  describe('POST /tasks', () => {
    it('should redirect to /login', done => {
      request(app)
        .post('/tasks')
        .expect('Location', '/login')
        .expect(302, done);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should redirect to /login', done => {
      request(app)
        .put('/tasks/123456')
        .expect('Location', '/login')
        .expect(302, done);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should redirect to /login', done => {
      request(app)
        .del('/tasks/123456')
        .expect('Location', '/login')
        .expect(302, done);
    });
  });

  describe('404', () => {
    it('should return 404', done => {
      request(app)
        .get('/foobar')
        .expect(404, done);
    });
  });
});

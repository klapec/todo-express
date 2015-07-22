/* eslint no-unused-expressions:0 */

import mongoose from 'mongoose';
import request from 'supertest';
import jsdom from 'jsdom';
import chai from 'chai';
import app from '../../app';

import '../../models/task';
import '../../models/user';

const expect = chai.expect;

const agent = request.agent(app);

const Task = mongoose.model('Task');
const User = mongoose.model('User');

let testUser;
let taskCount;
const testTasks = [];

describe('Backend', () => {
  before(done => {
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

              // Using agent so that the credentials persist
              agent.post('/login')
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

  describe('GET /tasks', () => {
    it('should redirect to /login when not logged in', done => {
      request(app)
        .get('/tasks')
        .expect('Location', '/login')
        .expect(302, done);
    });

    describe('logged in', () => {
      it('should return 200', done => {
        agent.get('/tasks')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(200, done);
      });
    });
  });

  describe('POST /tasks', () => {
    it('should redirect to /login when not logged in', done => {
      request(app)
        .post('/tasks')
        .expect('Location', '/login')
        .expect(302, done);
    });

    describe('when logged in', () => {
      before(() => {
        Task.count((err, cnt) => {
          if (err) return false;
          taskCount = cnt;
        });
      });

      it('should be able to create a task', done => {
        agent.post('/tasks')
          .send({
            title: 'Test task 1'
          })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.type).to.be.eql('application/json');
            expect(res.status).to.be.eql(200);
            expect(res.body.id).to.not.be.empty;

            testTasks.push(res.body);

            Task.count((err, cnt) => {
              expect(err).to.be.null;
              expect(cnt).to.be.eql(taskCount + 1);

              done();
            });
          });
      });
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should redirect to /login when not logged in', done => {
      request(app)
        .put('/tasks/123456')
        .expect('Location', '/login')
        .expect(302, done);
    });

    describe('when logged in', () => {
      it('should be able to update the `completed` task parameter', done => {
        agent.put(`/tasks/${testTasks[0].id}`)
          .send({
            completed: true
          })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.type).to.be.eql('application/json');
            expect(res.status).to.be.eql(200);
            expect(res.body.id).to.be.equal(testTasks[0].id);
            expect(res.body.completed).to.be.eql(true);

            done();
          });
      });

      it('should be able to update the task name', done => {
        agent.put(`/tasks/${testTasks[0].id}`)
          .send({
            title: 'Test task 1 updated'
          })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.type).to.be.eql('application/json');
            expect(res.status).to.be.eql(200);
            expect(res.body.id).to.be.equal(testTasks[0].id);
            expect(res.body.title).to.be.eql('Test task 1 updated');

            done();
          });
      });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should redirect to /login when not logged in', done => {
      request(app)
        .del('/tasks/123456')
        .expect('Location', '/login')
        .expect(302, done);
    });

    describe('when logged in', () => {
      it('should be able to remove a task', done => {
        agent.del(`/tasks/${testTasks[0].id}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.body.query).to.be.an('array');
            expect(res.body.query[0]).to.be.eql(testTasks[0].id);

            done();
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

  describe('404', () => {
    it('should return 404', done => {
      request(app)
        .get('/foobar')
        .expect(404, done);
    });
  });

  after(() => {
    mongoose.connection.db.dropCollection('tasks');
    mongoose.connection.db.dropCollection('users');
  });
});

/* eslint no-unused-expressions: 0 */

import http from 'http';
import httpProxy from 'http-proxy';
import mongoose from 'mongoose';
import request from 'supertest';
import jsdom from 'jsdom';
import chai from 'chai';

const proxy = httpProxy.createProxyServer();
const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:3000' });
});
const mongoUri = process.env.MONGOURI || mongoConfig.uri;

if (!mongoose.connection.name) {
  const connect = () => {
    mongoose.connect(mongoUri);
  };
  connect();
}

import '../../models/task';

const expect = chai.expect;
const Task = mongoose.model('Task');
const agent = request.agent(server);

let taskCount;
const testTasks = [];

describe('Backend: ', () => {
  before(done => {
    request(server)
      .get('/signup')
      .end((err, res) => {

        expect(err).to.not.exist;

        jsdom.env(res.text, (errors, window) => {
          const csrf = window.document.querySelector('input[name="_csrf"]').value;

          // Using agent so that the credentials persist
          agent
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

  describe('GET /tasks', () => {
    it('should redirect to /login when not logged in', done => {
      request(server)
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
      request(server)
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
      request(server)
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
      request(server)
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

  after(() => {
    mongoose.connection.db.dropCollection('tasks');
    mongoose.connection.db.dropCollection('users');
    mongoose.connection.db.dropCollection('sessions');
  });
});

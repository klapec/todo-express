/* eslint no-unused-expressions:0 */

import mongoose from 'mongoose';
import chai from 'chai';

import '../models/task';
import '../models/user';

const expect = chai.expect;

const Task = mongoose.model('Task');
const User = mongoose.model('User');

let testUser;
let taskCount;

describe('Task', () => {
  before(() => {
    User.findOne(
      { email: 'test@gmail.com' },
      (err, user) => {
        if (err) return false;
        testUser = user;
      }
    );
  });

  describe('create', () => {
    before(() => {
      Task.count((err, cnt) => {
        if (err) return false;
        taskCount = cnt;
      });
    });

    it('a new task', done => {
      Task.create(
        {
          name: 'foo',
          createdBy: testUser._id
        },
        (err, task) => {
          expect(err).to.be.null;
          expect(task).to.be.an('object');
          expect(task.createdBy).to.be.eql(testUser._id);
          expect(task.name).to.be.eql('foo');

          Task.count((err, cnt) => {
            expect(err).to.be.null;
            expect(cnt).to.be.equal(taskCount + 1);
            done();
          });
        }
      );
    });

    it('multiple tasks', done => {
      Task.create(
        [
          {
            name: 'bar',
            createdBy: testUser._id
          },
          {
            name: 'baz',
            createdBy: testUser._id
          }
        ],
        (err, tasks) => {
          expect(err).to.be.null;
          expect(tasks).to.be.an('array');
          expect(tasks[0]).to.be.an('object');
          expect(tasks[1]).to.be.an('object');
          expect(tasks[0].name).to.be.eql('bar');
          expect(tasks[1].name).to.be.eql('baz');

          done();
        }
      );
    });
  });

  describe('get', () => {
    it('the list of tasks', done => {
      Task.find(
        { createdBy: testUser._id },
        (err, tasks) => {
          expect(err).to.be.null;
          expect(tasks).to.be.an('array');
          expect(tasks.length).to.be.eql(3);
          expect(tasks[0]).to.be.an('object');
          expect(tasks[0].createdBy).to.be.eql(testUser._id);
          expect(tasks[0].name).to.be.eql('foo');

          done();
        }
      );
    });
  });

  describe('update', () => {
    it('the `completed` parameter of a task', done => {
      Task.findOneAndUpdate(
        { createdBy: testUser._id },
        { completed: true },
        { 'new': true },
        (err, task) => {
          expect(err).to.be.null;
          expect(task).to.be.an('object');
          expect(task.completed).to.be.true;

          done();
        }
      );
    });

    it('the task name', done => {
      Task.findOneAndUpdate(
        { createdBy: testUser._id },
        { name: 'foo2' },
        { 'new': true },
        (err, task) => {
          expect(err).to.be.null;
          expect(task).to.be.an('object');
          expect(task.name).to.eql('foo2');
          done();
        }
      );
    });
  });

  describe('remove', () => {
    it('a task', done => {
      Task.findOneAndRemove(
        { createdBy: testUser._id },
        (err, task) => {
          expect(err).to.be.null;
          expect(task).to.be.an('object');
          expect(task.name).to.be.eql('foo2');

          Task.count((err, cnt) => {
            expect(err).to.be.null;
            expect(cnt).to.be.equal(taskCount + 2);
            done();
          });
        }
      );
    });

    it('multiple tasks', done => {
      Task.find(
        { createdBy: testUser._id },
        (err, tasks) => {
          expect(err).to.be.null;
          expect(tasks).to.be.an('array');
          expect(tasks.length).to.be.eql(2);

          tasks.forEach(v => {
            Task.findByIdAndRemove(
              { _id: v._id },
              err => {
                expect(err).to.be.null;
              }
            );
          });

          Task.count((err, cnt) => {
            expect(err).to.be.null;
            expect(cnt).to.be.eql(0);
            done();
          });
        }
      );
    });
  });

  after(() => {
    mongoose.connection.db.dropCollection('tasks');
    mongoose.connection.db.dropCollection('users');
  });
});

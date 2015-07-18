// FIXME I need to take care of the tests ASAP
import assert from 'assert';
import mongoose from 'mongoose';

const dbURI = require('../config/config').db;
const Dummy = mongoose.model('Dummy', new mongoose.Schema({a: Number}));
const clearDB = require('mocha-mongoose')(dbURI);

describe('Model', () => {
  before((done) => {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  beforeEach((done) => {
    clearDB((err) => {
      if (err) return err;
      done();
    });
  });

  it('can be saved', (done) => {
    new Dummy({a: 1}).save(done);
  });

  it('can be listed', (done) => {
    new Dummy({a: 1}).save((err) => {
      if (err) return done(err);

      new Dummy({a: 2}).save((err) => {
        if (err) return done(err);

        Dummy.find({}, (err, docs) => {
          if (err) return done(err);
          assert.equal(docs.length, 2);
          done();
        });
      });
    });
  });

  it('creation can clear the database on demand', (done) => {
    new Dummy({a: 5}).save((err) => {
      if (err) return done(err);

      clearDB((err) => {
        if (err) return done(err);

        Dummy.find({}, (err, docs) => {
          if (err) return done(err);

          assert.equal(docs.length, 0);
          done();
        });
      });
    });
  });
});

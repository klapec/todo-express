import mongoose from 'mongoose';
import logger from '../helpers/logger';

const Task = mongoose.model('Task');
const tasks = {
  // Initial server render
  get(req, res) {
    Task.find(
      { createdBy: req.user._id },
      null,
      { sort: 'createdOn' }, // ascending
      (err, tasks) => {
        if (err) {
          logger.error(err);
          return res.render('tasks/index', { err });
        }
        res.render('tasks/index', { tasks });
      }
    );
  },

  create(req, res) {
    const newTask = new Task({
      name: req.body.title,
      createdBy: req.user._id,
      createdOn: new Date()
    });

    newTask.save(err => {
      if (err) {
        logger.error(err);
        return res.send({ err });
      }
      return res.send({
        id: newTask._id
      });
    });
  },

  update(req, res) {
    if (req.body.completed !== undefined) {
      Task.findOneAndUpdate(
        { _id: req.params.id },
        { completed: req.body.completed },
        { 'new': true },
        (err, task) => {
          if (err) {
            logger.error(err);
            return res.send({ err });
          }
          res.send({
            completed: task.completed
          });
        }
      );
    } else {
      Task.findOneAndUpdate(
        { _id: req.params.id },
        { name: req.body.title },
        err => {
          if (err) {
            logger.error(err);
            return res.send({ err });
          }
          res.send({
            id: req.params.id,
            title: req.body.title
          });
        }
      );
    }
  },

  remove(req, res) {
    const params = req.params.id;
    const query = [];

    if (req.params.id.search(/&/) !== -1) {
      const arr = req.params.id.split('&');
      arr.forEach(v => {
        query.push(v);
      });
    } else {
      query.push(params);
    }

    function removeAll(cb) {
      query.forEach(v => {
        Task.findByIdAndRemove(
          v,
          err => {
            if (err) {
              logger.error(err);
              return cb({ err });
            }
          }
        );
      });
      cb({ query });
    }

    removeAll(arg => {
      return res.send({
        err: arg.err,
        query: arg.query
      });
    });
  }
};

export default tasks;

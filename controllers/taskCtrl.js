import mongoose from 'mongoose';
import logger from '../helpers/logger';

const Task = mongoose.model('Task');
const taskCtrl = {

  // Initial server render
  // Gets all the tasks created by the current user from the DB
  // and sends them to the template
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

  // Creates a new task, receives an object with the title property
  // Takes the user id from the req object
  create(req, res) {
    const newTask = new Task({
      name: req.body.title,
      createdBy: req.user._id,
      createdOn: new Date()
    });

    newTask.save(err => {
      if (err) {
        logger.error(err);
        return res.status(500);
      }
      // Sends back ID of the new task
      return res.send({
        id: newTask._id
      });
    });
  },

  // Updates the task - whether by its name
  // or the completion parameter (true/false)
  update(req, res) {
    // Checks for the completed property
    // Uses the undefined type as the property could be false
    if (req.body.completed !== undefined) {
      Task.findOneAndUpdate(
        { _id: req.params.id },
        { completed: req.body.completed },
        { 'new': true },
        (err, task) => {
          if (err) {
            logger.error(err);
            return res.status(500);
          }
          res.send({
            id: task._id,
            completed: task.completed
          });
        }
      );
    // If the completed property doesn't exist, update the task
    // with the specified name
    } else {
      Task.findOneAndUpdate(
        { _id: req.params.id },
        { name: req.body.title },
        { 'new': true },
        (err, task) => {
          if (err) {
            logger.error(err);
            return res.status(500);
          }
          res.send({
            id: task._id,
            title: task.name
          });
        }
      );
    }
  },

  // Removes task/s specified as the request parameter
  remove(req, res) {
    const params = req.params.id;
    const query = [];

    // Checks whether the id parameter contains any ampersands
    // which would mean we're trying to remove multiple tasks
    if (req.params.id.search(/&/) !== -1) {
      // Splits the query into an array
      const arr = req.params.id.split('&');
      arr.forEach(v => {
        query.push(v);
      });
    // Otherwise the parameter must contain a single task ID
    } else {
      query.push(params);
    }

    Task.remove({ '_id': { '$in': query }}, err => {
      if (err) {
        logger.error(err);
        return res.send(500);
      }
      res.send({ query });
    });
  }
};

export default taskCtrl;

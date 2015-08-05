export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  bindAll() {
    // Checking if the task-list element exists === we're on /tasks
    if (this.view.taskList) {
      this.view.bind('init');
      this.view.bind('addTask', args => {
        this.addTask(args.title);
      });
      this.view.bind('editTask');
      this.view.bind('editTaskDone', args => {
        this.editTaskDone(args.id, args.title, args.oldVal);
      });
      this.view.bind('editTaskCancel');
      this.view.bind('removeTask', args => {
        this.removeTask(args);
      });
      this.view.bind('toggleTask', args => {
        this.toggleTask(args.id, args.completed);
      });
      this.view.bind('removeCompleted', args => {
        this.removeTask(args);
      });
    }
  }

  addTask(title) {
    // Checks for empty input
    if (title.trim() === '') {
      return;
    }

    // Sends the task title to the model
    // receives task id and title from the DB if the request was successful
    this.model.create(title)
      .then(response => {
        const res = JSON.parse(response);
        this.view.render('addTask', {
          id: res.id,
          title
        });
      }, error => {
        this.view.render('addTask', {
          err: error
        });
      });
  }

  // Invoked when the editing has finished
  editTaskDone(id, title, oldVal) {
    // Checks if the input isn't empty and if it actually changed
    if (title.trim() && title !== oldVal) {
      this.model.update(id, { title })
        .then(response => {
          const res = JSON.parse(response);
          this.view.render('editTaskDone', {
            id: res.id,
            title: res.title
          });
        }, error => {
          this.view.render('editTaskDone', {
            err: error
          });
        });
    // Otherwise returns the old value to the View
    } else {
      this.view.render('editTaskDone', { id, title: oldVal });
    }
  }

  // Used to remove either singular tasks by their id
  // or multiple completed tasks
  removeTask(args) {
    let query = '';

    // Checks whether the args object has a completed property
    // which would indicate that we want to remove multiple
    // completed tasks
    if (args.completed) {
      const arr = [];
      Array.prototype.forEach.call(args.completed, v => {
        // Pushes ids of the completed tasks to an array
        arr.push(v.dataset.id);
      });
      // Stringifies the array into a query, separating array items
      // with an ampersand
      query = arr.join('&');
    // Otherwise, we wan't to remove a single task
    } else {
      query = args.id;
    }

    this.model.remove(query)
      .then(response => {
        const res = JSON.parse(response);
        this.view.render('removeTask', {
          query: res.query
        });
      }, error => {
        this.view.render('removeTask', {
          err: error
        });
      });
  }

  // Toggles the completed parameter of a task
  // which can be either true or false
  toggleTask(id, completed) {
    this.model.update(id, { completed })
      .then(response => {
        const res = JSON.parse(response);
        this.view.render('toggleTask', {
          id: res.id,
          completed: res.completed
        });
      }, error => {
        this.view.render('toggleTask', {
          err: error
        });
      });
  }
}

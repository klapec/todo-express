export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  bindAll() {
    // Checking if we're on the tasks page
    if (window.location.pathname === '/tasks') {
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

    this.view.render('addTask', { title });

    this.model.create(title)
      .then(response => {
        // update the ID
        const res = JSON.parse(response);
        this.view.render('updateTaskId', {
          title,
          id: res.id
        });
      }, err => {
        // display an error
        this.view.render('addTask', { err, title });
      });
  }

  // Invoked when the editing has finished
  editTaskDone(id, title, oldVal) {
    // Checks if the input isn't empty and if it actually changed
    if (title.trim() !== '' && title !== oldVal) {
      this.view.render('editTaskDone', { id, title });

      this.model.update(id, { title })
        .catch(err => {
          this.view.render('editTaskDone', { err, id, title, oldVal });
        });
    // Otherwise returns the old value to the View
    } else {
      this.view.render('editTaskDone', { id, title: oldVal });
    }
  }

  // Used to remove either singular tasks by their id
  // or multiple completed tasks
  removeTask(args) {
    const query = args.completed ? args.completed.join('&') : args.id;

    // removeTask expects an array, so we wrap the id string in an array
    this.view.render('removeTask', { query: args.id ? [args.id] : args.completed });

    this.model.remove(query)
      .catch(err => {
        this.view.render('removeTask', { err, args });
      });
  }

  // Toggles the completed parameter of a task
  // which can be either true or false
  toggleTask(id, completed) {
    this.view.render('toggleTask', { id, completed });

    this.model.update(id, { completed })
      .catch( err => {
        this.view.render('toggleTask', { err, id, completed });
      });
  }
}

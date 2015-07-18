export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  bindAll() {
    // Checking if the task-list element exists = we're on /tasks
    if (this.view.taskList) {
      this.view.bind('init');
      this.view.bind('addTask', (opts) => {
        this.addTask(opts.title);
      });
      this.view.bind('editTask');
      this.view.bind('editTaskDone', (opts) => {
        this.editTaskDone(opts.id, opts.title, opts.oldVal);
      });
      this.view.bind('editTaskCancel');
      this.view.bind('removeTask', (opts) => {
        this.removeTask(opts);
      });
      this.view.bind('toggleTask', (opts) => {
        this.toggleTask(opts.id, opts.completed);
      });
      this.view.bind('removeCompleted', (opts) => {
        this.removeTask(opts);
      });
    }
  }

  addTask(title) {
    if (title.trim() === '') {
      return;
    }

    const self = this;
    self.model.create(title, function(res) {
      const response = JSON.parse(res);
      self.view.render('addTask', {
        err: response.err,
        id: response.id,
        title
      });
    });
  }

  editTaskDone(id, title, oldVal) {
    const self = this;
    if (title.trim() && title !== oldVal) {
      self.model.update(id, { title }, function(res) {
        const response = JSON.parse(res);
        self.view.render('editTaskDone', {
          err: response.err,
          id: response.id,
          title: response.title
        });
      });
    } else {
      self.view.render('editTaskDone', { id, title: oldVal });
    }
  }

  removeTask(opts) {
    const self = this;
    let query = '';

    if (opts.completed) {
      const arr = [];
      Array.prototype.forEach.call(opts.completed, (v) => {
        arr.push(v.dataset.id);
      });
      query = arr.join('&');
    } else {
      query = opts.id;
    }

    self.model.remove(query, function(res) {
      const response = JSON.parse(res);
      self.view.render('removeTask', {
        err: response.err,
        query: response.query
      });
    });
  }

  toggleTask(id, completed) {
    const self = this;
    self.model.update(id, { completed }, function(res) {
      const response = JSON.parse(res);
      self.view.render('toggleTask', {
        err: response.err,
        id,
        completed: response.completed
      });
    });
  }
}

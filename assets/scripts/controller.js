export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  bindAll() {
    // Checking if the task-list element exists = we're on /tasks
    if (this.view.taskList) {
      this.view.bind('init');
      this.view.bind('addTask', opts => {
        this.addTask(opts.title);
      });
      this.view.bind('editTask');
      this.view.bind('editTaskDone', opts => {
        this.editTaskDone(opts.id, opts.title, opts.oldVal);
      });
      this.view.bind('editTaskCancel');
      this.view.bind('removeTask', opts => {
        this.removeTask(opts);
      });
      this.view.bind('toggleTask', opts => {
        this.toggleTask(opts.id, opts.completed);
      });
      this.view.bind('removeCompleted', opts => {
        this.removeTask(opts);
      });
    }
  }

  addTask(title) {
    if (title.trim() === '') {
      return;
    }

    this.model.create(title, res => {
      const response = JSON.parse(res);
      this.view.render('addTask', {
        err: response.err,
        id: response.id,
        title
      });
    });
  }

  editTaskDone(id, title, oldVal) {
    if (title.trim() && title !== oldVal) {
      this.model.update(id, { title }, res => {
        const response = JSON.parse(res);
        this.view.render('editTaskDone', {
          err: response.err,
          id: response.id,
          title: response.title
        });
      });
    } else {
      this.view.render('editTaskDone', { id, title: oldVal });
    }
  }

  removeTask(opts) {
    let query = '';

    if (opts.completed) {
      const arr = [];
      Array.prototype.forEach.call(opts.completed, v => {
        arr.push(v.dataset.id);
      });
      query = arr.join('&');
    } else {
      query = opts.id;
    }

    this.model.remove(query, res => {
      const response = JSON.parse(res);
      this.view.render('removeTask', {
        err: response.err,
        query: response.query
      });
    });
  }

  toggleTask(id, completed) {
    this.model.update(id, { completed }, res => {
      const response = JSON.parse(res);
      this.view.render('toggleTask', {
        err: response.err,
        response: id,
        completed: response.completed
      });
    });
  }
}

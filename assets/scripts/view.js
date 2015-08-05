const qs = (selector, scope) => {
  return (scope || document).querySelector(selector);
};

const qsa = (selector, scope) => {
  return (scope || document).querySelectorAll(selector);
};

const parent = function parent(element, tagName) {
  if (!element.parentNode) {
    return false;
  }
  if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
    return element.parentNode;
  }
  return parent(element.parentNode, tagName);
};

const on = (target, type, callback, useCapture) => {
  if (typeof type == 'object') {
    type.forEach(v => {
      target.addEventListener(v, callback, !!useCapture);
    });
  } else {
    target.addEventListener(type, callback, !!useCapture);
  }
};

const delegate = (target, selector, type, handler) => {
  function dispatchEvent(event) {
    const targetElement = event.target;
    const potentialElements = qsa(selector, target);
    const hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

    if (hasMatch) {
      handler.call(targetElement, event);
    }
  }

  const useCapture = type === 'blur' || type === 'focus';
  on(target, type, dispatchEvent, useCapture);
};

export default class View {
  constructor() {
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;

    this.addTaskInput = qs('.add-task__name');
    this.addTaskButton = qs('.add-task__button');
    this.taskList = qs('.task-list');
    this.taskListCounter = qs('.task-counter');
    this.taskListError = qs('.task-list__error');
    this.taskCounter = qs('.task-counter');
    this.clearCompleted = qs('.clear-completed');

    this.oldValCache = '';
  }

  itemId(element) {
    const li = parent(element, 'li');
    return li.dataset.id;
  }

  clearCompletedButton(visible) {
    this.clearCompleted.style.display = visible ? 'block' : 'none';
  }

  itemCounter(completed) {
    const tasksCompleted = qsa('.completed');
    const number = this.taskList.children.length - tasksCompleted.length;
    const plural = number === 1 ? '' : 's';

    if (completed) {
      return tasksCompleted;
    }

    this.clearCompletedButton(tasksCompleted.length);
    this.taskListCounter.textContent = `${number} task${plural} left`;
  }

  displayError(err) {
    this.taskListError.style.display = 'block';
    const errorName = document.createElement('h3');
    errorName.textContent = err;
    this.taskListError.appendChild(errorName);
    const errorDesc = document.createElement('span');
    errorDesc.textContent = `Something wrong happened. I'm working on it.`;
    this.taskListError.appendChild(errorDesc);
  }

  hideError() {
    this.taskListError.style.display = 'none';
  }

  bind(event, handler) {
    const self = this;

    if (event === 'init') {
      on(document, 'DOMContentLoaded', function() {
        self.render('init');
      });
    }

    if (event === 'addTask') {
      on(self.addTaskInput, 'keypress', function(e) {
        if (e.keyCode === self.ENTER_KEY) {
          const title = this.value;
          handler({ title });
        }
      });

      on(self.addTaskButton, ['mouseup', 'keypress'], function() {
        const title = self.addTaskInput.value;
        handler({ title });
      });
    }

    if (event === 'editTask') {
      delegate(self.taskList, '.task-list__item__name', 'dblclick', function() {
        self.render('editTask', {id: self.itemId(this)});
      });

    } else if (event === 'editTaskDone') {
      delegate(self.taskList, '.task-list__item--edit', 'blur', function() {
        if (!this.dataset.iscanceled) {
          handler({
            id: self.itemId(this),
            title: this.value,
            oldVal: self.oldValCache
          });
        }
      });

      delegate(self.taskList, '.task-list__item--edit', 'keypress', function(e) {
        if (e.keyCode === self.ENTER_KEY) {
          this.blur();
        }
      });

    } else if (event === 'editTaskCancel') {
      delegate(self.taskList, '.task-list__item--edit', 'keyup', function(event) {
        if (event.keyCode === self.ESCAPE_KEY) {
          this.dataset.iscanceled = true;
          this.blur();

          self.render('editTaskDone', {
            id: self.itemId(this),
            title: self.oldValCache
          });
        }
      });

    } else if (event === 'removeTask') {
      delegate(self.taskList, '.task-list__item__delete', 'click', function() {
        handler({id: self.itemId(this)});
      });

    } else if (event === 'toggleTask') {
      delegate(self.taskList, '.task-list__item__toggle', 'click', function() {
        let checked;
        if (this.className.search(/checked/) !== -1) {
          checked = false;
          this.className = 'task-list__item__toggle';
        } else {
          checked = true;
          this.className += ' checked';
        }
        handler({
          id: self.itemId(this),
          completed: checked
        });
      });

    } else if (event === 'removeCompleted') {
      on(self.clearCompleted, 'click', function() {
        const completed = self.itemCounter(true);
        handler({completed});
      });
    }
  }

  render(cmd, opts = { id: '' }) {
    const self = this;
    const listItem = qs(`[data-id="${opts.id}"]`);

    // Do nothing if we haven't got the task id back
    // except on the first render ('init')
    // and when adding a new task ('addTask')
    if (!listItem && !(cmd === 'init' || 'addTask')) {
      return false;
    }

    // Display error when receiving an error, do nothing else
    if (opts.err) {
      return self.displayError(opts.err);
    }

    // Hide the error message in case some previous action made it visible
    self.hideError();

    const commands = {
      init() {
        self.itemCounter();
      },

      addTask() {
        self.addTaskInput.value = '';

        const taskListItem = document.createElement('li');
        taskListItem.className = 'task-list__item';
        taskListItem.dataset.id = opts.id;
        const taskListItemView = document.createElement('div');
        taskListItemView.className = 'task-list__item--view';
        taskListItem.appendChild(taskListItemView);
        const taskListItemToogle = document.createElement('span');
        taskListItemToogle.className = 'task-list__item__toggle';
        taskListItemView.appendChild(taskListItemToogle);
        const taskListItemName = document.createElement('label');
        taskListItemName.className = 'task-list__item__name';
        taskListItemName.textContent = opts.title;
        taskListItemView.appendChild(taskListItemName);
        const taskListItemDelete = document.createElement('button');
        taskListItemDelete.className = 'task-list__item__delete';
        taskListItemView.appendChild(taskListItemDelete);

        self.taskList.appendChild(taskListItem);
        self.itemCounter();
      },

      editTask() {
        const input = document.createElement('input');
        const currVal = qs('label', listItem).textContent;
        self.oldValCache = currVal;

        listItem.className = listItem.className + ' editing';
        input.className = 'task-list__item--edit';
        listItem.appendChild(input);
        input.focus();
        input.value = currVal;
      },

      editTaskDone() {
        const input = qs('.task-list__item--edit', listItem);
        const label = qs('.task-list__item__name', listItem);

        listItem.removeChild(input);
        listItem.className = listItem.className.replace('editing', '');
        label.textContent = opts.title;
      },

      removeTask() {
        opts.query.forEach(v => {
          const item = qs(`[data-id="${v}"]`);
          self.taskList.removeChild(item);
        });

        return self.itemCounter();
      },

      toggleTask() {
        if (opts.completed) {
          listItem.className = 'task-list__item completed';
        } else {
          listItem.className = 'task-list__item';
        }

        self.itemCounter();
      }
    };

    commands[cmd]();
  }
}

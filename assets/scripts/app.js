// Instantiates a new todo object and binds
// the event handlers

import Model from './model';
import View from './view';
import Controller from './controller';

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

class Todo {
  constructor() {
    this.model = model;
    this.view = view;
    this.controller = controller;
  }

  init() {
    this.controller.bindAll();
  }
}

const todo = new Todo();
todo.init();

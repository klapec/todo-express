export default class Model {
  create(title, cb) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() { cb(this.responseText); };
    xhr.open('post', '/tasks', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({title}));
  }

  update(id, data, cb) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() { cb(this.responseText); };
    xhr.open('put', `/tasks/${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(data));
  }

  remove(query, cb) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() { cb(this.responseText); };
    xhr.open('delete', `/tasks/${query}`, true);
    xhr.send();
  }
}

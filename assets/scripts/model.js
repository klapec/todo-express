export default class Model {
  create(title, cb) {
    const xhr = new XMLHttpRequest();

    // Receives an object with new tasks's id
    xhr.onload = function() { cb(this.responseText); };
    xhr.open('post', '/tasks', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    // Sends an object with the task title to the server
    xhr.send(JSON.stringify({title}));
  }

  update(id, data, cb) {
    const xhr = new XMLHttpRequest();

    // Receives an object with the task id and either new name or completion
    // parameter
    xhr.onload = function() { cb(this.responseText); };
    xhr.open('put', `/tasks/${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    // Sends an object with either tasks updated title or completion parameter
    xhr.send(JSON.stringify(data));
  }

  remove(query, cb) {
    const xhr = new XMLHttpRequest();
    // Receives an object with the query that was used for removing task/s
    xhr.onload = function() { cb(this.responseText); };
    // Sends the query in the url of the request
    xhr.open('delete', `/tasks/${query}`, true);
    xhr.send();
  }
}

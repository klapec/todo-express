export default class Model {
  create(title) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Receives an object with new tasks's id
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = () => {
        reject(Error('Network error'));
      };
      xhr.open('post', '/tasks', true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      // Sends an object with the task title to the server
      xhr.send(JSON.stringify({title}));
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Receives an object with the task id and either new name or completion
      // parameter
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = () => {
        reject(Error('Network error'));
      };
      xhr.open('put', `/tasks/${id}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      // Sends an object with either tasks updated title or completion parameter
      xhr.send(JSON.stringify(data));
    });
  }

  remove(query) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Receives an object with the query that was used for removing task/s
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = () => {
        reject(Error('Network error'));
      };
      // Sends the query in the url of the request
      xhr.open('delete', `/tasks/${query}`, true);
      xhr.send();
    });
  }
}

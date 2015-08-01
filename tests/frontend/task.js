/* eslint no-unused-expressions:0, no-var: 0 */
/* global casper, expect */

var newUser = (Math.random() * 30).toString().slice(3, 9) + '@gmail.com';
var newTask = '';

describe('Frontend - Task', function() {
  before('new user should be successfully created', function() {
    casper.start('http://localhost:3000/signup');

    casper.waitForSelector('form.auth-form', function() {
      this.fill('form.auth-form', {
        'email': newUser,
        'password': 'test-front',
        'passwordConfirmation': 'test-front'
      }, true);

      this.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/tasks');
      });
    });
  });

  describe('Adding a task', function() {
    before('there should be no tasks initially', function() {
      expect('.task-list').to.be.inDOM;
      expect('.task-list__item').to.not.be.inDOM;
    });

    it('should be possible', function() {
      expect('.add-task').to.be.inDOM.and.be.visible;
      expect('.add-task__name').to.be.inDOM.and.be.visible;
      expect('.add-task__button').to.be.inDOM.and.be.visible;
    });
  });

  after(function() {
    expect('a[href="/logout"]').to.be.inDOM.and.be.visible;

    casper.click('a[href="/logout"]');
    casper.then(function() {
      expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
    });
  });
});

/* eslint no-unused-expressions:0, no-var: 0 */
/* global casper, expect */

var newUser = (Math.random() * 30).toString().slice(3, 9) + '@gmail.com';

describe('Frontend: ', function() {
  before('new user should be successfully created', function() {
    casper.options.remoteScripts.push('http://cdn.polyfill.io/v1/polyfill.min.js?features=Promise');
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

  beforeEach(function() {
    expect('.task-list__error').to.not.be.visible;
  });

  describe('Adding a task', function() {
    before('there should be no tasks initially', function() {
      expect('.task-list').to.be.inDOM;
      expect('.task-list__item').to.not.be.inDOM;
      expect('.task-counter').to.have.text('0 tasks left');
    });

    it('should be possible', function() {
      expect('.add-task').to.be.inDOM.and.be.visible;
      expect('.add-task__name').to.be.inDOM.and.be.visible;
      expect('.add-task__button').to.be.inDOM.and.be.visible;
    });

    describe('with the Add button', function() {
      it('shouldn\'t do anything when the input is empty', function() {
        casper.click('.add-task__button');
        casper.then(function() {
          expect('.task-list__item').to.not.be.inDOM;
          expect('.task-counter').to.have.text('0 tasks left');
        });
      });

      it('should successfully add a task', function() {
        casper.sendKeys('.add-task__name', 'test task');
        casper.click('.add-task__button');
        casper.waitForSelector('.task-list__item', function() {
          expect(this.getElementsInfo('.task-list__item').length).to.be.equal(1);
          expect('.task-list__item__name').to.have.text('test task');
          expect('.task-counter').to.have.text('1 task left');
        });
      });
    });

    describe('with the ENTER key', function() {
      it('shouldn\'t do anything when the input is empty', function() {
        casper.sendKeys('.add-task__name', casper.page.event.key.Enter);
        casper.then(function() {
          expect(this.getElementsInfo('.task-list__item').length).to.be.equal(1);
          expect('.task-counter').to.have.text('1 task left');
        });
      });

      it('should successfully add a task', function() {
        casper.sendKeys('.add-task__name', 'test task 2');
        casper.sendKeys('.add-task__name', casper.page.event.key.Enter);
        casper.waitForSelector('.task-list__item:nth-of-type(2)', function() {
          expect(this.getElementsInfo('.task-list__item').length).to.be.equal(2);
          expect(this.getElementsInfo('.task-list__item')[1].text).to.be.equal('test task 2');
          expect('.task-counter').to.have.text('2 tasks left');
        });
      });
    });
  });

  describe('Toggling a task', function() {
    before(function() {
      expect('.clear-completed').to.not.be.visible;
    });

    describe('that is not checked', function() {
      it('should set it to be completed', function() {
        casper.click('.task-list__item__toggle:nth-of-type(1)');
        casper.waitForSelector('.task-list__item.completed', function() {
          expect('.task-list__item.completed').to.be.inDOM.and.be.visible;
          expect('.task-list__item__toggle.checked').to.be.inDOM.and.be.visible;
          expect('.clear-completed').to.be.visible;
        });
      });
    });

    describe('that is checked already', function() {
      it('should un-check it', function() {
        casper.click('.task-list__item__toggle:nth-of-type(1)');
        casper.waitWhileSelector('.task-list__item.completed', function() {
          expect('.task-list__item.completed').to.not.be.inDOM;
          expect('.task-list__item__toggle.checked').to.not.be.inDOM;
          expect('.clear-completed').to.not.be.visible;
        });
      });
    });
  });

  describe('Removing', function() {
    describe('a task', function() {
      describe('with a delete button', function() {
        it('should actually remove the task', function() {
          casper.click('.task-list__item__delete');
          casper.waitWhileSelector('.task-list__item:nth-of-type(2)', function() {
            expect(this.getElementsInfo('.task-list__item').length).to.be.equal(1);
            expect('.task-counter').to.have.text('1 task left');
          });
        });
      });

      describe('with a "Clear completed" button', function() {
        before(function() {
          // We need to mark the remaining task as completed
          casper.click('.task-list__item__toggle');
          casper.waitForSelector('.task-list__item.completed', function() {
            expect('.task-list__item.completed').to.be.inDOM.and.be.visible;
            expect('.task-list__item__toggle.checked').to.be.inDOM.and.be.visible;
            expect('.clear-completed').to.be.visible;
          });
        });

        it('should actually remove the task', function() {
          casper.click('.clear-completed');
          casper.waitWhileSelector('.task-list__item', function() {
            expect('.task-list__item').to.not.be.inDOM;
            expect('.task-counter').to.have.text('0 tasks left');
          });
        });
      });
    });

    describe('multiple tasks', function() {
      describe('with a "Clear completed" button', function() {
        before(function() {
          // We need to add few extra tasks since we just have removed
          // the existing ones
          casper.sendKeys('.add-task__name', 'test task 3');
          casper.click('.add-task__button');
          casper.waitForSelector('.task-list__item', function() {
            expect('.task-list__item').to.be.inDOM.and.be.visible;
            expect(this.getElementsInfo('.task-list__item')[0].text).to.be.equal('test task 3');
            this.sendKeys('.add-task__name', 'test task 4');
            this.click('.add-task__button');
            this.waitForSelector('.task-list__item:nth-of-type(2)', function() {
              expect(this.getElementsInfo('.task-list__item')[1].text).to.be.equal('test task 4');
              this.click('.task-list__item__toggle:first-of-type');
              expect('.task-list__item__toggle.checked').to.be.inDOM;
              this.click('.task-list__item__toggle:not(.checked)');
              expect(this.getElementsInfo('.task-list__item__toggle.checked').length).to.be.equal(2);
            });
          });
        });

        it('should actually remove those tasks', function() {
          casper.waitForSelector('.task-list__item.completed', function() {
            this.click('.clear-completed');
            this.waitWhileVisible('.task-list__item', function() {
              expect('.task-list__item').to.not.be.inDOM;
              expect('.task-counter').to.have.text('0 tasks left');
              expect('.clear-completed').to.not.be.visible;
            });
          });
        });
      });
    });
  });

  describe('Editing a task', function() {
    before(function() {
      // Adding a task
      casper.sendKeys('.add-task__name', 'test task 5');
      casper.click('.add-task__button');
    });

    it('should actually edit the task\'s name', function() {
      casper.waitForSelector('.task-list__item', function() {
        casper.mouse.doubleclick('.task-list__item__name');
        this.waitForSelector('.task-list__item--edit', function() {
          expect('.task-list__item--edit').to.be.inDOM.and.be.visible;
          this.sendKeys('.task-list__item--edit', ' edited');
          this.waitWhileSelector('.task-list__item--edit', function() {
            expect('.task-list__item__name').to.have.text('test task 5 edited');
          });
        });
      });
    });

    it('should be cancelled when the ESC key is pressed', function() {
      casper.mouse.doubleclick('.task-list__item__name');
      casper.waitForSelector('.task-list__item--edit', function() {
        expect('.task-list__item--edit').to.be.inDOM.and.be.visible;
        this.sendKeys('.task-list__item--edit', casper.page.event.key.Escape);
        this.waitWhileSelector('.task-list__item--edit', function() {
          // Task name shouldn't change
          expect('.task-list__item__name').to.have.text('test task 5 edited');
        });
      });
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

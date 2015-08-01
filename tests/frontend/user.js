/* eslint no-unused-expressions:0, no-var: 0 */
/* global casper, expect */

var newUser;
var newUser2;

function generateEmail() {
  return (Math.random() * 30).toString().slice(3, 9) + '@gmail.com';
}

describe('Frontend: ', function() {
  before(function() {
    casper.start('http://localhost:3000/');
  });

  describe('Initial load', function() {
    it('should redirect to /login', function() {
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
      });
    });
  });

  describe('Login page', function() {
    before(function() {
      newUser = generateEmail();
      expect('.auth-alt-link').to.be.inDOM.and.be.visible;

      casper.click('.auth-alt-link');
      casper.then(function() {
        this.fill('form.auth-form', {
          'email': newUser,
          'password': 'test-front',
          'passwordConfirmation': 'test-front'
        }, true);
      });

      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/tasks');
        expect('.auth-form__error').to.not.be.inDOM.and.not.be.visible;
      });

      casper.then(function() {
        this.click('a[href="/logout"]');
        this.then(function() {
          expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
          expect('.auth-form__error').to.not.be.inDOM.and.not.be.visible;
        });
      });
    });

    it('should have the login form', function() {
      expect('form[action="/login"]').to.be.inDOM.and.be.visible;
    });

    it('should have the CSRF token', function() {
      expect('input[name="_csrf"]').to.have.an.attribute('value').that.is.ok;
    });

    it('should have all the required inputs', function() {
      expect('input[name="email"]').to.be.inDOM.and.be.visible;
      expect('input[name="password"]').to.be.inDOM.and.be.visible;
      expect('input[type="submit"]').to.be.inDOM.and.be.visible;
      expect('.auth-form__error').to.not.be.inDOM.and.not.be.visible;
    });

    it('should be reloaded when the form is submitted without any input data', function() {
      casper.fill('form.auth-form', {
        'email': '',
        'password': ''
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
        expect('.auth-form__error').to.not.be.inDOM.and.not.be.visible;
        expect('form[action="/login"]').to.be.inDOM.and.be.visible;
      });
    });

    it('should display an error message when the email is invalid', function() {
      casper.fill('form.auth-form', {
        'email': 'invalid@gmail.com',
        'password': 'foobar'
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
        expect('.auth-form__error').to.be.inDOM.and.be.visible;
        expect('.auth-form__error').to.have.text('Invalid email or unknown user');
      });
    });

    it('should display an error message when the password is invalid', function() {
      casper.fill('form.auth-form', {
        'email': newUser,
        'password': 'invalid'
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
        expect('.auth-form__error').to.be.inDOM.and.be.visible;
        expect('.auth-form__error').to.have.text('Invalid password');
      });
    });

    it('should redirect to /signup when clicked on "Not registered?"', function() {
      casper.click('.auth-alt-link');
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
      });
    });
  });

  describe('Signup page', function() {
    it('should have a signup form', function() {
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
        expect('form[action="/signup"]').to.be.inDOM.and.be.visible;
      });
    });

    it('should have the CSRF token', function() {
      expect(casper.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
      expect('input[name="_csrf"]').to.have.an.attribute('value').that.is.ok;
    });

    it('should have all the required inputs', function() {
      expect(casper.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
      expect('input[name="email"]').to.be.inDOM.and.be.visible;
      expect('input[name="password"]').to.be.inDOM.and.be.visible;
      expect('input[name="passwordConfirmation"]').to.be.inDOM.and.be.visible;
      expect('input[type="submit"]').to.be.inDOM.and.be.visible;
    });

    it('should return errors when the form was sent without any input', function() {
      expect(casper.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');

      casper.fill('form.auth-form', {
        'email': '',
        'password': '',
        'passwordConfirmation': ''
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
        expect('.auth-form__error-list').to.be.inDOM.and.be.visible;
        expect('.auth-form__error:first-of-type').to.have.text('Password cannot be blank');
        expect('.auth-form__error:last-of-type').to.have.text('Email cannot be blank');
      });
    });

    it('should return an error if the email already exists', function() {
      expect(casper.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');

      casper.fill('form.auth-form', {
        'email': newUser,
        'password': 'test',
        'passwordConfirmation': 'test'
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
        expect('.auth-form__error-list').to.be.inDOM.and.be.visible;
        expect('.auth-form__error:first-of-type').to.have.text('Email already exists');
      });
    });

    it('should return an error if passwords don\'t match', function() {
      casper.fill('form.auth-form', {
        'email': 'completelyrandom@gmail.com',
        'password': 'foo',
        'passwordConfirmation': 'bar'
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/signup');
        expect('.auth-form__error-list').to.be.inDOM.and.be.visible;
        expect('.auth-form__error:first-of-type').to.have.text('Passwords must match');
      });
    });

    it('should redirect to /tasks when successfully signed up', function() {
      newUser2 = generateEmail();

      casper.fill('form.auth-form', {
        'email': newUser2,
        'password': 'test-front',
        'passwordConfirmation': 'test-front'
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/tasks');
      });
    });
  });

  describe('New account', function() {
    it('should be able to log off', function() {
      expect('a[href="/logout"]').to.be.inDOM.and.be.visible;

      casper.click('a[href="/logout"]');
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/login');
      });
    });

    it('should be able to log back in', function() {
      casper.fill('form.auth-form', {
        'email': newUser2,
        'password': 'test-front'
      }, true);
      casper.then(function() {
        expect(this.getCurrentUrl()).to.be.equal('http://localhost:3000/tasks');
      });
    });
  });
});

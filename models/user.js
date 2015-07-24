// User mongoose model
//
// Does the login/signup input validation

import mongoose from 'mongoose';
import crypto from 'crypto';
import logger from '../helpers/logger';

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String },
  hashedPassword: { type: String },
  salt: { type: String },
  createdAt: { type: Date }
});

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._password; });

UserSchema
  .virtual('passwordConfirmation')
  .set(function(value) {
    this._passwordConfirmation = value;
  })
  .get(function() { return this._passwordConfirmation; });

UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank')
  .validate(function(email) {
    return email.length < 100;
  }, 'Email has to be shorter than 100 characters')
  .validate(function(email) {
    return (/^[\w\d_.%+-]+@[\w\d-]{2,}\.[\w\d-.]{2,}$/).test(email);
  }, 'Email is invalid')
  .validate(function(email, cb) {
    const User = mongoose.model('User');
    User.findOne({email: email}, function(err, user) {
      if (err) logger.error(err);
      cb(!user);
    });
  }, 'Email already exists');

UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank')
  .validate(function() {
    return this._password.length < 50;
  }, 'Password has to be shorter than 50 characters')
  .validate(function() {
    return this._password === this._passwordConfirmation;
  }, 'Passwords must match');

UserSchema.methods = {
  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  makeSalt() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },

  encryptPassword(password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      logger.error(err);
      return '';
    }
  }
};

mongoose.model('User', UserSchema);

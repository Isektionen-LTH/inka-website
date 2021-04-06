const bcrypt = require('bcrypt')
const config = require('./config')

class Auth {
  /**
   * Hash a password and return the hash
   */
  static async hashPassword(plaintext) {
    return await bcrypt.hash(plaintext, config.password.saltRounds)
  }

  /**
   * Validate password hash against plaintext
   */
  static async validatePassword(hash, password) {
    return await bcrypt.compare(password, hash)
  }

  /**
   * Get the signed in username
   */
  static signedInUser(req) {
    return req.session ? req.session.username : null
  }

  /**
   * Authenticate a user, set session variables
   */
  static signInUser(req, user) {
    req.session.username = user.username
    req.session.type = user.type
  }

  /**
   * Sign user out by destroying session
   */
  static signOutUser(req) {
    delete req.session.username
    delete req.session.type
  }

  /**
   * Middleware for requiring a signed in user
   */
  static requireSignedIn(req, res, next) {
    // Check if username is set in session
    if (!req.session.username) {
      //res.status(401).send('User has to be signed in')
      res.redirect('/login')
    }
    else {
      next()
    }
  }

  /**
   * Middleware for requiring admin signed in
   */
  static requireAdminPrivileges(req, res, next) {
    // Check that user is signed in
    if (!req.session.username) {
      res.status(401).send('User has to be signed in')
    }

    // Check for correct user type
    if (req.session.type !== 'admin') {
      res.status(403).send('You do not have access for this operation')
    }

    // All ok, go to next handler
    next()
  }
  
  /**
   * Middleware for requiring business signed in, admin is disallowed
   */
  static requireBusinessPrivileges(req, res, next) {
    // Check that user is signed in
    if (!req.session.username) {
      res.status(401).send('User has to be signed in')
    }

    // Check for correct user type
    if (req.session.type !== 'business') {
      res.status(403).send('You do not have access for this operation')
    }

    // All ok, go to next handler
    next()
  }
}

module.exports = Auth

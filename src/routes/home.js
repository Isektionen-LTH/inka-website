const express = require('express')
const uuid = require('uuid')
const Auth = require('../auth')
const DB = require('../db')
const Mailer = require('../mailer')

const routes = express.Router()

routes.get('/', (req, res) => {
  res.render('index')
})

routes.get('/login', (req, res) => {
  if (Auth.signedInUser(req)) {
    if (req.session.type === 'admin' || req.session.type === 'business') {
      res.redirect('/dashboard')
      return
    }
    else {
      // TODO Redirect to app
    }
  }
  res.render('login')
})

routes.post('/login', async (req, res) => {
  if (Auth.signedInUser(req)) {
    const userType = req.session.type

    if (userType === 'admin' || userType === 'business') {
      res.redirect('/dashboard')
    }
    else {
      // TODO Maybe redirect 'student' to the app later
      res.status(400).send('User is already signed in')
    }
  }

  const { username, password } = req.body

  // Validate input
  if (!username || !password) {
    res.render('login', { error: 'Något gick fel, testa ladda om sidan' })
  }

  // Find user
  const user = await DB.findUser(username)
  if (!user) {
    // Do not expose if user exists
    res.render('login', { error: 'Fel användarnamn eller lösenord' })
  }

  // Check if user is business or admin
  if (user.type !== 'admin' && user.type !== 'business') {
    res.render('login', { error: 'Bara företag kan logga in här' })
    return
  }

  // Validate password
  if (await Auth.validatePassword(user.password, password)) {
    Auth.signInUser(req, user)
    res.redirect('/dashboard')
  }
  else {
    res.render('login', { error: 'Fel användarnamn eller lösenord' })
  }
})

routes.get('/logout', (req, res) => {
  Auth.signOutUser(req)
  res.redirect('/login')
})

routes.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword')
})

routes.post('/forgotPassword', async (req, res) => {
  const { username } = req.body

  if (!username) {
    res.render('forgotPassword', { error: 'Något gick fel, testa att ladda om sidan' })
    return
  }

  const user = await DB.findUser(username)

  if (!user) {
    // Show success even if user was not found
    res.render('forgotPassword', { showSuccess: true })
    return
  }

  user.passwordResetToken = {
    token: uuid.v4(),
    created: (new Date()).getTime()
  }

  await DB.updateUser(username, user)

  await Mailer.sendPasswordReset(user)

  res.render('forgotPassword', { showSuccess: true })
})

routes.get('/resetPassword', async (req, res) => {
  const passwordResetToken = req.query.token

  res.render('resetPassword', { passwordResetToken })
})

module.exports = routes

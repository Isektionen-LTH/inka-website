const express = require('express')
const Auth = require('../auth')
const DB = require('../db')

const routes = express.Router()

routes.get('/', (req, res) => res.send('Hello World'))

routes.get('/login', (req, res) => {
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

module.exports = routes

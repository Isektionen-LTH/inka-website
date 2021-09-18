const express = require('express')
const uuid = require('uuid')
const Auth = require('../auth')
const DB = require('../db')
const Mailer = require('../mailer')

const routes = express.Router()

routes.get('/', async (req, res) => {
  const businesses = await DB.getBusinesses()
  res.render('index', { businesses })
})
routes.get('/events',async (req, res)  =>{
  const businesses = await DB.getBusinesses()
  res.render('events', {businesses})
})
routes.get('/contact',async (req, res)  =>{
  const businesses = await DB.getBusinesses()
  res.render('contact', {businesses})
})
routes.get('/companies',async (req, res)  =>{
  const businesses = await DB.getBusinesses()
  res.render('companies', {businesses})
})
routes.get('/login', (req, res) => {
  if (Auth.signedInUser(req)) {
    res.redirect('/dashboard')
  }
  else {
    res.render('login')
  }
})

routes.post('/login', async (req, res) => {
  // Redirect if user is already signed in
  if (Auth.signedInUser(req)) {
    res.redirect('/dashboard')
    return
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

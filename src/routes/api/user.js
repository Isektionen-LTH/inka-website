const express = require('express')
const zxcvbn = require('zxcvbn')
const DB = require('../../db')
const Auth = require('../../auth')
const Utils = require('../../utils')
const config = require('../../config')

const router = express.Router()

/**
 * Sign a user in with provided credentials
 */
router.post('/signin', async (req, res) => {
  const { username, password } = req.body

  // Validate input
  if (!username || !password) {
    res.status(400)
  }

  // Find user
  const user = await DB.findUser(username)
  if (!user) {
    // Do not expose if user exists
    res.status(400).send('Invalid user/password combination')
  }

  // Validate password
  if (await Auth.validatePassword(user.password, password)) {
    Auth.signInUser(req, user)
    res.status(204).send('Sign in sucessful')
  }
  else {
    res.status(400).send('Invalid user/password combination')
  }
})

/**
 * Sign a user out
 */
router.get('/signout', Auth.requireSignedIn, async (req, res) => {
  Auth.signOutUser(req)
  res.status(204).send()
})

/**
 * Change a user password
 */
router.post('/changePassword', async (req, res) => {
  const { oldPassword, newPassword, passwordResetToken } = req.body

  // New password must be set
  if (!newPassword || zxcvbn(newPassword).score < config.password.zxcvbnMinScore) {
    res.status(400).send('Too weak password')
    return
  }

  if (passwordResetToken) {
    // Set password by token
    if (await DB.setPasswordByToken(passwordResetToken, await Auth.hashPassword(newPassword))) {
      res.status(204).send()
    }
    else {
      // Password reset with token failed, probably expired
      res.status(401).send()
    }
  }
  else if (oldPassword) {
    if (Auth.signedInUser(req)) {
      const user = await DB.findUser(Auth.signedInUser(req))

      if (user && await Auth.validatePassword(user.password, oldPassword)) {
        const passwordHash = await Auth.hashPassword(newPassword)
        console.log(user.password)
        console.log(passwordHash)
        // Set password by username and old password
        await DB.setPasswordByUsername(user.username, passwordHash)
        res.status(204).send()
      }
      else {
        // Wrong oldPassword
        res.status(400).send()
      }
    }
    else {
      // Need to be signed in to change password with old
      res.status(401).send()
    }
  }
})

/**
 * A simple test route to see that the routing is working well
 */
router.get('/test', async (req, res) => {
  let info = 'Time: ' + (new Date()).getTime()

  info += '<br>Session username: ' + req.session.username
  info += '<br>Session type: ' + req.session.type
  const user = await DB.getBusinesses()
  info += '<br>user: <pre>' + JSON.stringify(user) + '</pre>'

  res.send(info)
})

/**
 * Get a list of all businesses, sorted by name
 */
router.get('/businesses', Auth.requireAdminPrivileges, (req, res) => {
  const businesses = DB.getBusinesses()
  const safeBusinesses = businesses.map(b => Utils.sanitizeUser(b))
  safeBusinesses.sort((a, b) => {
    if (a.name < b.name) return -1
    else if (a.name > b.name) return 1
    else return 0
  })
  res.send(safeBusinesses)
})

/**
 * Get specific business
 */
router.get('/business/:username', Auth.requireAdminPrivileges, (req, res) => {
  const business = DB.findUser(req.params.username)

  if (!business || business.type !== 'business') {
    res.status(404).send()
  }

  const safeBusiness = Utils.sanitizeUser(business)
  res.send(safeBusiness)
})

module.exports = router

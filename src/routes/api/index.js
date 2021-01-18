const express = require('express')
const userRoutes = require('./user')
const businessRoutes = require('./business')

const router = express.Router()

router.use('/user', userRoutes)
router.use('/business', businessRoutes)

module.exports = router

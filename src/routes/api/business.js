const express = require('express')
const DB = require('../../db')

const router = express.Router()

/**
 * Get public information about a business
 */
router.get('/:business', async (req, res) => {
  const business = await DB.findPublicBusiness(req.params.business)

  if (!business) {
    res.status(404).send()
  }

  res.send(business)
})

module.exports = router

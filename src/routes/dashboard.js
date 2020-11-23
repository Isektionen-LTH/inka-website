const express = require('express')
const uuid = require('uuid')
const DB = require('../db')
const Auth = require('../auth')
const Utils = require('../utils')
const Mailer = require('../mailer')

const config = require('../config')

const router = express.Router()

/**
 * Index
 */
router.get('/', Auth.requireSignedIn, async (req, res) => {

  const user = await DB.findUser(req.session.username)

  if (user.type === 'admin') {
    const businesses = await DB.getBusinesses()
    // TODO Could probably be done with a join operation
    const safeBusinesses = await Promise.all(businesses.map(b => Utils.sanitizeUser(b)).map(async b => {
      const inka = await DB.findUser(b.inka)
      b.inka = Utils.sanitizeUser(inka)
      return b
    }))

    res.render('dashboard/index_admin', {
      user,
      businesses: safeBusinesses
    })
  }
  else if (user.type === 'business') {
    user.inka = await DB.findUser(user.inka)
    // Create addons array
    user.registration.addons = config.businesses.registrationAddons.map(a => {
      return {
        name: a.name,
        value: user.registration.addons.includes(a.name),
        price: a.price
      }
    })
    
    // Create offers array
    user.info.offers = config.businesses.enabledOffers.map(o => {
      return {
        name: o,
        value: user.info.offers.includes(o)
      }
    })
    res.render('dashboard/index_business', { user, business: user })
  }
  else {
    res.status(401).send('You are not allowed on this page')
  }
})

/**
 * Show page for creating business account
 */
router.get('/business/create', Auth.requireAdminPrivileges, async (req, res) => {
  const user = await DB.findUser(req.session.username)
  const admins = await DB.getAdmins()

  res.render('dashboard/business_admin_create', { user, admins })
})

/**
 * Create a new business account
 */
router.post('/business/create', Auth.requireAdminPrivileges, async (req, res) => {
  const createBusinessDefault = {
    username: '',
    name: '',
    contact: {
      name: '',
      email: ''
    },
    inka: ''
  }

  const rawData = req.body
  if (!Utils.isSibling(rawData, createBusinessDefault)) {
    res.status(400).send()
    return
  }

  // Generate new password reset token and make it "never" expire
  rawData.passwordResetToken = {
    token: uuid.v4(),
    created: (new Date('9999-12-31')).getTime()
  }

  const business = await DB.createBusiness(rawData)

  await Mailer.sendAccountCreated(business)

  res.redirect('/dashboard')
})

/**
 * Show business edit page
 */
router.get('/edit', Auth.requireBusinessPrivileges, async (req, res) => {
  const business = await DB.findUser(req.session.username)

  business.inka = await DB.findUser(business.inka)

  // Build addons array
  business.registration.addons = config.businesses.registrationAddons.map(a => {
    return {
      name: a.name,
      value: business.registration.addons.includes(a.name),
      price: a.price
    }
  }) 

  // Build offers array
  business.info.offers = config.businesses.enabledOffers.map(o => {
    return {
      name: o,
      value: business.info.offers.includes(o)
    }
  }) 

  res.render('dashboard/business_edit_business', { user: business, business })
})

/**
 * Save business self edit
 */
router.post('/edit', Auth.requireBusinessPrivileges, async (req, res) => {
  const businessEditDefaults = {
    contact: {
      name: '',
      email: ''
    },
    billing: {
      signer: {
        name: '',
        email: '',
        phone: '',
      },
      address: '',
      orgNumber: ''
    },
    registration: {
      participation: '',
      addons: []
    },
    info: {
      about: '',
      offers: []
    }
  }

  // Sanitize input
  const rawData = req.body
  if (!Utils.isSubset(rawData, businessEditDefaults)) {
    res.status(400).send()
    return
  }

  // Merge the body with defaults to provide defaults for empty arrays
  const data = Utils.mergeDeep(businessEditDefaults, rawData)

  const business = await DB.findUser(req.session.username)
  const merged = Utils.mergeDeep(business, data)
  

  await DB.updateUser(req.session.username, merged)
  
  res.redirect('/dashboard')
})

/**
 * Show the settings page
 */
router.get('/settings', Auth.requireSignedIn, async (req, res) => {
  const user = await DB.findUser(req.session.username)
  
  res.render('dashboard/settings', { user })
})

/**
 * Show business page, admin
 */
router.get('/:business', Auth.requireAdminPrivileges, async (req, res) => {

  const user = await DB.findUser(req.session.username)

  const business = await DB.findUser(req.params.business)
  const safeBusiness = Utils.sanitizeUser(business)
  const inkaUsername = safeBusiness.inka
  safeBusiness.inka = Utils.sanitizeUser(await DB.findUser(inkaUsername))
  safeBusiness.inka.email = inkaUsername

  // Build addons array
  safeBusiness.registration.addons = config.businesses.registrationAddons.map(a => {
    return {
      name: a.name,
      value: safeBusiness.registration.addons.includes(a.name),
      price: a.price
    }
  })

  // Build offers array
  safeBusiness.info.offers = config.businesses.enabledOffers.map(o => {
    return {
      name: o,
      value: safeBusiness.info.offers.includes(o)
    }
  })

  res.render('dashboard/business_admin', {
    user,
    business
  })
})

/**
 * Edit business page, admin
 */
router.get('/:business/edit', Auth.requireAdminPrivileges, async (req, res) => {

  const user = await DB.findUser(req.session.username)

  const business = await DB.findUser(req.params.business)
  const safeBusiness = Utils.sanitizeUser(business)
  const inkaUsername = safeBusiness.inka
  safeBusiness.inka = Utils.sanitizeUser(await DB.findUser(inkaUsername))
  safeBusiness.inka.email = inkaUsername

  const admins = await DB.getAdmins()

  // Build addons array
  safeBusiness.registration.addons = config.businesses.registrationAddons.map(a => {
    return {
      name: a.name,
      value: safeBusiness.registration.addons.includes(a.name),
      price: a.price
    }
  })

  // Build offer array
  safeBusiness.info.offers = config.businesses.enabledOffers.map(o => {
    return {
      name: o,
      value: safeBusiness.info.offers.includes(o)
    }
  })


  res.render('dashboard/business_admin_edit', {
    user,
    business,
    admins
  })
})

/**
 * Edit business page, admin
 */
router.post('/:business/edit', Auth.requireAdminPrivileges, async (req, res) => {

  // The default object of what to set, these are the only allowed fields in the body
  const adminEditDefaults = {
    name: '',
    contact: {
      name: '',
      email: ''
    },
    billing: {
      signer: {
        name: '',
        email: '',
        phone: ''
      },
      address: '',
      orgNumber: ''
    },
    inka: '',
    nonProfit: false,
    registration: {
      participation: '',
      addons: []
    },
    info: {
      offers: []
    }
  }

  // Sanitize input
  const rawData = req.body
  //if (!Utils.isSubset(rawData, adminEditDefaults)) {
  //  res.status(400).send()
  //  return
  //}

  // Merge the body with defaults to provide defaults for empty arrays
  const data = Utils.mergeDeep(adminEditDefaults, rawData)
  data.nonProfit = data.nonProfit == 'true'

  const business = await DB.findUser(req.params.business)
  const merged = Utils.mergeDeep(business, data)
  

  await DB.updateUser(req.params.business, merged)
  
  res.redirect('/dashboard/' + req.params.business)
})


module.exports = router

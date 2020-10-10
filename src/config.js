const config = {
  nodeEnv: 'development',
  domain: 'localhost:3000',
  session: {
    secret: 'developmentSecret',
  },
  password: {
    zxcvbnMinScore: 2,
    resetTokenMaxAge: 3600000,
    saltRounds: 10
  },
  db: {
    connectionString: 'mongodb://db:27017',
    databaseName: 'inka',
    connectionOptions: {
      useUnifiedTopology: true
    }
  },
  mailer: {
    senderName: 'INKA Företagssida',
    host: 'localhost',
    port: '-1',
    secure: true,
    auth: {
      user: '',
      pass: ''
    }
  },
  businesses: {
    registrationAddons: [
      '5 kontaktsamtal',
      'Extra marknadsföring'
    ],
    enabledOffers: [
      'Examensarbete',
      'Extrajobb/timanställning',
      'Internship',
      'Praktik',
      'Sommarjobb',
      'Tillsvidareanställning',
      'Traineeprogram',
      'Utlandsmöjligheter'
    ]
  }
}

// Production config
if (process.env.NODE_ENV === 'production') {
  // Make sure the environment is set up correctly
  const requiredEnv = ['SESSION_SECRET', 'DOMAIN_NAME', 'MAILER_USERNAME', 'MAILER_PASSWORD', 'MAILER_SMTP_HOST', 'MAILER_SMTP_PORT']
  requriedEnv.forEach(env => {
    if (!process.env[env]) {
      console.error('Required environemnt variable not set: ' + env)
      process.exit(1)
    }
  })

  // TODO Only do this once on the first load
  // Transfer env configs to config object
  config.nodeEnv = process.env.NODE_ENV
  config.domain = process.env.DOMAIN_NAME
  config.mailer.host = process.env.MAILER_SMTP_HOST
  config.mailer.port = process.env.MAILER_SMTP_PORT
  config.mailer.auth.user = process.env.MAILER_USERNAME
  config.mailer.auth.pass = process.env.MAILER_PASSWORD
}

module.exports = config